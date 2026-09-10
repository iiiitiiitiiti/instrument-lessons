import { useEffect, useMemo, useRef, useState } from "react";
import { playNotes } from "../../../core/audio/output/play";
import { bpmToInterval, clampBpm, createScheduler } from "../../../core/audio/output/scheduler";
import { TempoControl } from "../../../core/widgets/TempoControl";
import { UKULELE_CHORDS, chordNotes } from "../chords";
import { RhythmPattern, type Stroke } from "./figures/RhythmPattern";
import "./StrumPattern.css";

export type StrumPatternProps = {
  strokes: Stroke[];
  bars?: 1 | 2;
  /** 鳴らすコード。既定は C。 */
  chord?: string;
  defaultBpm?: number;
  caption?: string;
};

/** 1小節は4拍。ストローク1つの長さは、拍の長さを1小節あたりの個数で割ったもの。 */
function strokeInterval(bpm: number, strokesPerBar: number): number {
  return (bpmToInterval(bpm) * 4) / strokesPerBar;
}

/**
 * ストロークパターンを鳴らして、今どこを弾いているかを図の上で示す。
 *
 * 図は RhythmPattern をそのまま使う。本文中の静止した図と、再生できる図が
 * 別の絵になると、同じパターンだと分からなくなる。
 *
 * アップストロークは1弦と2弦だけを弱く鳴らす。Lesson 09 の本文で
 * 「アップは1弦と2弦にだけ軽く当たっている」と説明しているため、音もそう作る。
 */
export function StrumPattern({
  strokes,
  bars = 1,
  chord = "C",
  defaultBpm = 60,
  caption,
}: StrumPatternProps) {
  const [bpm, setBpm] = useState(() => clampBpm(defaultBpm));
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(-1);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const shape = UKULELE_CHORDS[chord];
  if (!shape) throw new Error(`未定義のコードです: ${chord}`);
  const notes = useMemo(() => chordNotes(shape), [shape]);
  const perBar = strokes.length / bars;

  /*
   * strokes は MDX のインライン配列なので、レンダーごとに別の配列になる。
   * useMemo の依存に入れるとスケジューラが作り直され、鳴っている最中に
   * 親（レッスンページ）が再描画されると音だけ止まってボタンの表示が残る。
   * bpm と同じく ref から読み、スケジューラは1度だけ作る。
   */
  const playRef = useRef({ strokes, notes, perBar });
  playRef.current = { strokes, notes, perBar };

  const scheduler = useMemo(
    () =>
      createScheduler({
        interval: () => strokeInterval(bpmRef.current, playRef.current.perBar),
        cycle: () => playRef.current.strokes.length,
        schedule: (index, time) => {
          const pattern = playRef.current.strokes;
          const stroke = pattern[index % pattern.length];
          if (stroke === "-") return;
          if (stroke === "D") {
            playNotes(playRef.current.notes, { spreadMs: 22, seconds: 1.4, at: time });
            return;
          }
          // アップは高い2本だけ、下から上へ、弱く
          playNotes([...playRef.current.notes].slice(-2).reverse(), {
            spreadMs: 18,
            seconds: 1,
            volume: 0.55,
            at: time,
          });
        },
        onBeat: (index) => setActive(index % playRef.current.strokes.length),
      }),
    [],
  );

  useEffect(() => () => scheduler.stop(), [scheduler]);

  const toggle = () => {
    if (scheduler.isRunning()) {
      scheduler.stop();
      setRunning(false);
      setActive(-1);
      return;
    }
    scheduler.start();
    setRunning(true);
  };

  return (
    <div className="strum">
      <RhythmPattern
        strokes={strokes}
        bars={bars}
        caption={caption}
        activeIndex={running ? active : -1}
      />
      <div className="strum__controls">
        <TempoControl bpm={bpm} onChange={setBpm} />
        <button type="button" className="btn btn--primary" onClick={toggle}>
          {running ? "止める" : `${chord} で鳴らす`}
        </button>
      </div>
    </div>
  );
}
