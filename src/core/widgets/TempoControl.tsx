import { MAX_BPM, MIN_BPM, clampBpm } from "../audio/output/scheduler";
import "./TempoControl.css";

const STEP = 5;

export type TempoControlProps = {
  bpm: number;
  onChange: (bpm: number) => void;
};

/**
 * BPM の増減つまみ。メトロノーム・ストロークパターン・伴奏再生で共通に使う。
 *
 * 押せる要素はすべて 44px 以上にする。練習中は指で操作するため、
 * 小さいつまみだと拍を刻みながら触れない。
 */
export function TempoControl({ bpm, onChange }: TempoControlProps) {
  const shift = (delta: number) => onChange(clampBpm(bpm + delta));

  return (
    <div className="tempo">
      <div className="tempo__row">
        <button
          type="button"
          className="tempo__step"
          onClick={() => shift(-STEP)}
          disabled={bpm <= MIN_BPM}
          aria-label={`テンポを${STEP}下げる`}
        >
          −
        </button>
        <p className="tempo__value">
          <output aria-live="off">{bpm}</output>
          <span className="tempo__unit">BPM</span>
        </p>
        <button
          type="button"
          className="tempo__step"
          onClick={() => shift(STEP)}
          disabled={bpm >= MAX_BPM}
          aria-label={`テンポを${STEP}上げる`}
        >
          ＋
        </button>
      </div>
      <label className="tempo__slider">
        <span className="visually-hidden">テンポ</span>
        <input
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          step={1}
          value={bpm}
          onChange={(event) => onChange(clampBpm(Number(event.target.value)))}
        />
      </label>
    </div>
  );
}
