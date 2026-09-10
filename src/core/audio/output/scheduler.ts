import { getAudioContext } from "./context";

export const MIN_BPM = 40;
export const MAX_BPM = 160;

/** テンポとして扱わない値の下限（秒）。0 や負の値でも無限ループしないための歯止め。 */
const MIN_INTERVAL = 0.05;

export type BeatPlan = { index: number; time: number };
/** 次に鳴らす拍。時刻は AudioContext の時間軸（秒）。 */
export type BeatCursor = { index: number; time: number };

/** BPM を許容範囲へ丸める。 */
export function clampBpm(bpm: number): number {
  // NaN だけは大小が決まらないので下限にする。±Infinity は min/max が正しく畳む
  if (Number.isNaN(bpm)) return MIN_BPM;
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

/** BPM を1拍の長さ（秒）へ変換する。 */
export function bpmToInterval(bpm: number): number {
  return 60 / clampBpm(bpm);
}

/**
 * 先読み窓 [cursor.time, until) に入る拍を列挙する。
 *
 * テンポは拍ごとに問い合わせる。演奏中にテンポを変えても、
 * すでに予約した拍だけが古いテンポで鳴り、その先は新しいテンポになる。
 *
 * 時計と音の予約を分けるのは Web Audio の作法。setInterval で直接鳴らすと、
 * タイマーの揺れがそのまま音の揺れになる。予約は AudioContext の時間軸で行い、
 * タイマーは「次の予約をしに行く」合図としてだけ使う。
 */
export function planBeats(
  cursor: BeatCursor,
  until: number,
  interval: (index: number) => number,
  maxBeats = 128,
): { beats: BeatPlan[]; cursor: BeatCursor } {
  const beats: BeatPlan[] = [];
  let current = cursor;

  while (current.time < until && beats.length < maxBeats) {
    beats.push({ index: current.index, time: current.time });
    const step = interval(current.index);
    const safe = Number.isFinite(step) && step >= MIN_INTERVAL ? step : MIN_INTERVAL;
    current = { index: current.index + 1, time: current.time + safe };
  }

  return { beats, cursor: current };
}

/**
 * カーソルが現在時刻より遅れていたら、今より少し先へ飛ばす。
 *
 * タブを裏に回すと setInterval は1秒〜1分まで絞られる。戻ってきたとき、
 * カーソルは現在時刻より大きく遅れている。そのまま予約すると過去時刻の拍が
 * 並び、Web Audio は過去時刻の start() を即時再生するため、まとめて連打で鳴る。
 *
 * 飛ばす先の index は cycle の倍数へ切り上げる。拍子やパターンの頭から
 * 再開しないと、1拍目のアクセントや空振りの位置がずれたまま続く。
 */
export function catchUpCursor(
  cursor: BeatCursor,
  now: number,
  offset = 0.1,
  cycle = 1,
): BeatCursor {
  if (cursor.time >= now) return cursor;
  const size = Math.max(1, Math.trunc(cycle));
  return { index: Math.ceil(cursor.index / size) * size, time: now + offset };
}

export type Scheduler = {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
};

export type SchedulerOptions = {
  /** 拍ごとの長さ（秒）を返す。テンポ変更に追従するため毎回問い合わせる。 */
  interval: (index: number) => number;
  /** 音を予約する。time は AudioContext の時間軸。 */
  schedule: (index: number, time: number) => void;
  /** 音が実際に鳴る時刻に呼ばれる。画面の表示を合わせるのに使う。 */
  onBeat?: (index: number) => void;
  /** 何秒先まで予約しておくか。 */
  lookaheadSeconds?: number;
  /** 予約しに行く間隔（ミリ秒）。 */
  tickMs?: number;
  /**
   * 拍子やパターン1周の長さ。裏タブから戻ったときに、この倍数の位置から再開する。
   * 拍ごとに変わりうるため関数で受ける。
   */
  cycle?: () => number;
  /** 現在時刻（秒）。既定は AudioContext の時計。テストで差し替える。 */
  now?: () => number;
};

/**
 * 一定間隔で音を予約し続けるスケジューラ。
 *
 * 予約（音）と通知（画面）を別の時計で動かしている。予約は setInterval で
 * 先の分をまとめて入れ、通知は requestAnimationFrame で鳴る時刻に合わせる。
 * 予約した時点で画面を更新すると、音より先に表示が動く。
 */
export function createScheduler({
  interval,
  schedule,
  onBeat,
  lookaheadSeconds = 0.25,
  tickMs = 25,
  cycle,
  now,
}: SchedulerOptions): Scheduler {
  const readNow = now ?? (() => getAudioContext().currentTime);
  let timer: ReturnType<typeof setInterval> | null = null;
  let frame: number | null = null;
  let cursor: BeatCursor = { index: 0, time: 0 };
  let pending: BeatPlan[] = [];

  const tick = () => {
    const current = readNow();
    cursor = catchUpCursor(cursor, current, 0.1, cycle?.() ?? 1);
    const planned = planBeats(cursor, current + lookaheadSeconds, interval);
    cursor = planned.cursor;
    for (const beat of planned.beats) {
      schedule(beat.index, beat.time);
      if (onBeat) pending.push(beat);
    }
  };

  const watchFrames = () => {
    frame = requestAnimationFrame(() => {
      if (timer === null) return;
      const current = readNow();
      let due: BeatPlan | null = null;
      // 溜まっていても最後の1つだけ知らせる。表示が連続で飛ぶより今の位置が正しい
      while (pending.length > 0 && pending[0].time <= current) {
        due = pending.shift()!;
      }
      if (due) onBeat?.(due.index);
      watchFrames();
    });
  };

  return {
    start() {
      if (timer !== null) return;
      // 最初の拍だけ少し先に置く。現在時刻そのままだと予約が間に合わない
      cursor = { index: 0, time: readNow() + 0.1 };
      pending = [];
      tick();
      timer = setInterval(tick, tickMs);
      if (onBeat) watchFrames();
    },
    stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      pending = [];
    },
    isRunning() {
      return timer !== null;
    },
  };
}
