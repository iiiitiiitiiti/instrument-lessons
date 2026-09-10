import { useEffect, useMemo, useRef, useState } from "react";
import { playClick } from "../audio/output/click";
import { bpmToInterval, clampBpm, createScheduler } from "../audio/output/scheduler";
import { TempoControl } from "./TempoControl";
import "./Metronome.css";

export type MetronomeProps = {
  /** 最初に表示する BPM。 */
  defaultBpm?: number;
  /** 1小節の拍数。 */
  beatsPerBar?: 2 | 3 | 4;
};

/**
 * メトロノーム。楽器に依存しないため core に置く。
 *
 * BPM の値はスケジューラへ直接渡さず ref 経由で読む。演奏中に BPM を変えても
 * スケジューラを作り直さずに済み、拍が途切れない。
 */
export function Metronome({ defaultBpm = 60, beatsPerBar = 4 }: MetronomeProps) {
  const [bpm, setBpm] = useState(() => clampBpm(defaultBpm));
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(-1);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const scheduler = useMemo(
    () =>
      createScheduler({
        interval: () => bpmToInterval(bpmRef.current),
        schedule: (index, time) => {
          playClick({ accent: index % beatsPerBar === 0, at: time });
        },
        onBeat: (index) => setCurrent(index % beatsPerBar),
      }),
    [beatsPerBar],
  );

  // 画面から消えるときに必ず止める。止めないと鳴り続ける
  useEffect(() => () => scheduler.stop(), [scheduler]);

  const toggle = () => {
    if (scheduler.isRunning()) {
      scheduler.stop();
      setRunning(false);
      setCurrent(-1);
      return;
    }
    scheduler.start();
    setRunning(true);
  };

  return (
    <div className="metronome">
      <div className="metronome__beats" aria-hidden="true">
        {Array.from({ length: beatsPerBar }, (_, index) => (
          <span
            key={index}
            className={[
              "metronome__beat",
              index === 0 ? "metronome__beat--accent" : "",
              running && index === current ? "is-on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>

      <TempoControl bpm={bpm} onChange={setBpm} />

      <button type="button" className="btn btn--primary metronome__toggle" onClick={toggle}>
        {running ? "止める" : "鳴らす"}
      </button>

      <p className="metronome__note">
        {beatsPerBar}拍で1小節。1拍目だけ高い音が鳴ります。
      </p>
    </div>
  );
}
