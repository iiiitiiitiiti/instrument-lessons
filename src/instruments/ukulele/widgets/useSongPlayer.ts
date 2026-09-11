import { useEffect, useMemo, useRef, useState } from "react";
import { playClick } from "../../../core/audio/output/click";
import { getAudioContext } from "../../../core/audio/output/context";
import { playNotes } from "../../../core/audio/output/play";
import { bpmToInterval, clampBpm, createScheduler } from "../../../core/audio/output/scheduler";
import { playVoice } from "../../../core/audio/output/voice";
import { parseAbc } from "../../../core/music/abc";
import { UKULELE_CHORDS, chordNotes } from "../chords";
import { buildPerformance, withCountIn } from "../performance";
import type { SongPerformance } from "../songs/types";

/** スケジューラの1ステップは16分音符1つ。 */
const STEPS_PER_BEAT = 4;

export type SongPlayer = {
  running: boolean;
  bpm: number;
  setBpm: (bpm: number) => void;
  melody: boolean;
  setMelody: (on: boolean) => void;
  /** 鳴っているコードの番号（譜面に出てくる順）。止まっているときは -1。 */
  activeChord: number;
  toggle: () => void;
};

/**
 * お手本の再生。曲データ（ABC）から組んだ表を、16分音符ごとにスケジューラで引いて鳴らす。
 *
 * テンポとメロディの有無は ref から読む。再生中に変えてもスケジューラを作り直さずに済む。
 */
export function useSongPlayer(performance: SongPerformance | undefined): SongPlayer {
  const [bpm, setBpm] = useState(() => clampBpm(performance?.bpm ?? 60));
  const [melody, setMelody] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeChord, setActiveChord] = useState(-1);

  const data = useMemo(() => {
    if (!performance) return null;
    const tune = parseAbc(performance.abc);
    const voicings = tune.chords.map((chord) => {
      const shape = UKULELE_CHORDS[chord.name];
      if (!shape) throw new Error(`未定義のコードです: ${chord.name}`);
      return chordNotes(shape);
    });
    return { plan: withCountIn(buildPerformance(tune, performance.strum), tune), voicings };
  }, [performance]);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const melodyRef = useRef(melody);
  melodyRef.current = melody;
  const dataRef = useRef(data);
  dataRef.current = data;
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRef = useRef(() => {});

  const scheduler = useMemo(
    () =>
      createScheduler({
        interval: () => bpmToInterval(bpmRef.current) / STEPS_PER_BEAT,
        schedule: (index, time) => {
          const current = dataRef.current;
          if (!current) return;
          const { plan, voicings } = current;

          // スケジューラには終わりが無い。最後のステップの次を予約しに来たら、その時刻に止める
          if (index >= plan.steps.length) {
            if (index === plan.steps.length && endTimer.current === null) {
              const wait = Math.max(0, time - getAudioContext().currentTime);
              endTimer.current = setTimeout(() => stopRef.current(), wait * 1000);
            }
            return;
          }

          const step = plan.steps[index];
          const chord = plan.chordAt[index];
          if (step.click) playClick({ accent: step.click === "accent", at: time });
          if (step.stroke && chord !== -1) {
            const notes = voicings[chord];
            if (step.stroke === "D") {
              playNotes(notes, { spreadMs: 22, seconds: 1.4, volume: 0.7, at: time });
            } else {
              // アップは高い2本だけ、下から上へ、弱く（StrumPattern と同じ）
              playNotes([...notes].slice(-2).reverse(), {
                spreadMs: 18,
                seconds: 1,
                volume: 0.4,
                at: time,
              });
            }
          }
          if (step.melody && melodyRef.current) {
            const seconds = (step.melody.steps * bpmToInterval(bpmRef.current)) / STEPS_PER_BEAT;
            playVoice(step.melody.note, { seconds, at: time });
          }
        },
        onBeat: (index) => {
          const current = dataRef.current;
          if (!current || index >= current.plan.chordAt.length) return;
          setActiveChord(current.plan.chordAt[index]);
        },
      }),
    [],
  );

  const stop = () => {
    scheduler.stop();
    if (endTimer.current !== null) {
      clearTimeout(endTimer.current);
      endTimer.current = null;
    }
    setRunning(false);
    setActiveChord(-1);
  };
  stopRef.current = stop;

  useEffect(
    () => () => {
      scheduler.stop();
      if (endTimer.current !== null) clearTimeout(endTimer.current);
    },
    [scheduler],
  );

  /*
   * 裏に回ったら止める。スケジューラの追いつき処理は再開位置を周期の倍数へ切り上げるが、
   * 曲には弱起や短い小節があり、小節の頭が周期の倍数に並ばない。戻ってきたときに
   * 小節の途中から鳴り出すより、止めて押し直してもらうほうが分かりやすい。
   */
  useEffect(() => {
    if (!running) return;
    const onVisibility = () => {
      if (document.hidden) stopRef.current();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [running]);

  const toggle = () => {
    if (scheduler.isRunning()) {
      stop();
      return;
    }
    if (!dataRef.current) return;
    scheduler.start();
    setRunning(true);
  };

  return { running, bpm, setBpm, melody, setMelody, activeChord, toggle };
}
