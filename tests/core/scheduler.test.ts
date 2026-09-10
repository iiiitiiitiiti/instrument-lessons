import { describe, expect, test } from "vitest";
import { afterEach, beforeEach, vi } from "vitest";
import {
  MAX_BPM,
  MIN_BPM,
  bpmToInterval,
  catchUpCursor,
  clampBpm,
  createScheduler,
  planBeats,
} from "../../src/core/audio/output/scheduler";

const steady = (seconds: number) => () => seconds;

describe("clampBpm", () => {
  test("範囲内はそのまま", () => {
    expect(clampBpm(60)).toBe(60);
  });

  test("範囲外は端に丸める", () => {
    expect(clampBpm(10)).toBe(MIN_BPM);
    expect(clampBpm(400)).toBe(MAX_BPM);
  });

  test("小数は整数へ", () => {
    expect(clampBpm(72.4)).toBe(72);
  });

  test("数でない値は下限にする", () => {
    expect(clampBpm(Number.NaN)).toBe(MIN_BPM);
  });
});

describe("bpmToInterval", () => {
  test("60 BPM は1拍1秒", () => {
    expect(bpmToInterval(60)).toBe(1);
  });

  test("120 BPM は1拍0.5秒", () => {
    expect(bpmToInterval(120)).toBe(0.5);
  });

  test("範囲外でも 0 や無限にならない", () => {
    expect(bpmToInterval(0)).toBeCloseTo(60 / MIN_BPM);
    expect(bpmToInterval(Number.POSITIVE_INFINITY)).toBeCloseTo(60 / MAX_BPM);
  });
});

describe("planBeats", () => {
  test("先読み窓に入る拍だけを返す", () => {
    const { beats } = planBeats({ index: 0, time: 0 }, 2.5, steady(1));
    expect(beats).toEqual([
      { index: 0, time: 0 },
      { index: 1, time: 1 },
      { index: 2, time: 2 },
    ]);
  });

  test("次に鳴らす拍をカーソルとして返す", () => {
    const { cursor } = planBeats({ index: 0, time: 0 }, 2.5, steady(1));
    expect(cursor).toEqual({ index: 3, time: 3 });
  });

  test("窓に入る拍が無ければカーソルは動かない", () => {
    const start = { index: 7, time: 10 };
    const { beats, cursor } = planBeats(start, 9, steady(1));
    expect(beats).toEqual([]);
    expect(cursor).toEqual(start);
  });

  test("続けて呼ぶと拍が途切れずに並ぶ", () => {
    const first = planBeats({ index: 0, time: 0 }, 1.5, steady(0.5));
    const second = planBeats(first.cursor, 3, steady(0.5));
    const times = [...first.beats, ...second.beats].map((beat) => beat.time);
    expect(times).toEqual([0, 0.5, 1, 1.5, 2, 2.5]);
  });

  test("途中でテンポが変わっても、変わった先から新しい間隔になる", () => {
    // 2拍目以降を倍速にする
    const { beats } = planBeats({ index: 0, time: 0 }, 3, (index) => (index < 2 ? 1 : 0.5));
    expect(beats.map((beat) => beat.time)).toEqual([0, 1, 2, 2.5]);
  });

  test("間隔が 0 でも無限ループしない", () => {
    const { beats } = planBeats({ index: 0, time: 0 }, 1, steady(0));
    expect(beats.length).toBeLessThan(128);
    expect(beats.length).toBeGreaterThan(0);
  });

  test("間隔が負や数でない値でも進む", () => {
    expect(planBeats({ index: 0, time: 0 }, 1, steady(-5)).cursor.time).toBeGreaterThan(0);
    expect(planBeats({ index: 0, time: 0 }, 1, steady(Number.NaN)).cursor.time).toBeGreaterThan(0);
  });

  test("maxBeats で打ち切る", () => {
    const { beats } = planBeats({ index: 0, time: 0 }, 1000, steady(1), 5);
    expect(beats).toHaveLength(5);
  });
});

describe("catchUpCursor", () => {
  test("遅れていなければそのまま返す", () => {
    const cursor = { index: 3, time: 10 };
    expect(catchUpCursor(cursor, 9)).toBe(cursor);
  });

  test("遅れていたら今より少し先へ飛ばす", () => {
    expect(catchUpCursor({ index: 3, time: 5 }, 100, 0.1)).toEqual({ index: 3, time: 100.1 });
  });

  test("飛ばす先の index を拍子の倍数へ切り上げる", () => {
    // 4拍子で37拍目まで進んでいたら、40拍目（小節の頭）から再開する
    expect(catchUpCursor({ index: 37, time: 5 }, 100, 0.1, 4).index).toBe(40);
  });

  test("すでに小節の頭にいるなら index を動かさない", () => {
    expect(catchUpCursor({ index: 40, time: 5 }, 100, 0.1, 4).index).toBe(40);
  });

  test("cycle が 0 や小数でも壊れない", () => {
    expect(catchUpCursor({ index: 7, time: 5 }, 100, 0.1, 0).index).toBe(7);
    expect(catchUpCursor({ index: 7, time: 5 }, 100, 0.1, 2.7).index).toBe(8);
  });
});

describe("createScheduler", () => {
  let clock = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    clock = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const build = () => {
    const scheduled: { index: number; time: number }[] = [];
    const scheduler = createScheduler({
      interval: () => 1,
      schedule: (index, time) => scheduled.push({ index, time }),
      lookaheadSeconds: 0.25,
      tickMs: 25,
      now: () => clock,
      cycle: () => 4,
    });
    return { scheduled, scheduler };
  };

  test("開始すると最初の拍だけ先に予約する", () => {
    const { scheduled, scheduler } = build();
    scheduler.start();
    expect(scheduled).toEqual([{ index: 0, time: 0.1 }]);
    scheduler.stop();
  });

  test("時間が進むと続きを予約する", () => {
    const { scheduled, scheduler } = build();
    scheduler.start();
    clock = 1;
    vi.advanceTimersByTime(25);
    expect(scheduled.map((beat) => beat.index)).toEqual([0, 1]);
    expect(scheduled[1].time).toBeCloseTo(1.1);
    scheduler.stop();
  });

  test("停止したら予約しにいかない", () => {
    const { scheduled, scheduler } = build();
    scheduler.start();
    scheduler.stop();
    clock = 10;
    vi.advanceTimersByTime(1000);
    expect(scheduled).toHaveLength(1);
  });

  /*
   * 裏タブでは setInterval が1秒〜1分まで絞られる。戻ってきたときカーソルは
   * 大きく遅れていて、そのまま予約すると過去時刻の拍が並ぶ。Web Audio は
   * 過去時刻の start() を即時再生するため、まとめて連打で鳴ってしまう。
   */
  test("長く止まってから戻っても、過去時刻の拍を予約しない", () => {
    const { scheduled, scheduler } = build();
    scheduler.start();
    clock = 120; // 2分ぶん放置された
    vi.advanceTimersByTime(25);
    const past = scheduled.filter((beat) => beat.time < clock);
    expect(past).toHaveLength(1); // start 時の1拍だけ
    expect(scheduled.length).toBeLessThan(5);
    scheduler.stop();
  });

  test("戻ったあとは小節の頭から再開する", () => {
    const { scheduled, scheduler } = build();
    scheduler.start();
    clock = 120;
    vi.advanceTimersByTime(25);
    const resumed = scheduled[scheduled.length - 1];
    expect(resumed.index % 4).toBe(0);
    scheduler.stop();
  });

  test("二重に開始しても予約は増えない", () => {
    const { scheduled, scheduler } = build();
    scheduler.start();
    scheduler.start();
    expect(scheduled).toHaveLength(1);
    expect(scheduler.isRunning()).toBe(true);
    scheduler.stop();
    expect(scheduler.isRunning()).toBe(false);
  });
});
