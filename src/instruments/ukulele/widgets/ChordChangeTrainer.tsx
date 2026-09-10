import { useEffect, useRef, useState } from "react";
import { UKULELE_CHORDS } from "../chords";
import { ChordDiagram } from "./ChordDiagram";
import "./ChordChangeTrainer.css";

const DURATION_SECONDS = 60;

export type ChordChangeTrainerProps = {
  /** 交互に押さえ替える2つのコード。 */
  from?: string;
  to?: string;
};

type Phase = "ready" | "running" | "done";

/**
 * 1分間チェンジの計測。60秒で2つのコードを何回押さえ替えられたか数える。
 *
 * 記録は保存しない（仕様 §8）。伸びを見たいのは日ごとの1回だけで、
 * 端末に残す価値がない。利用者が紙に書くほうが続く。
 *
 * 「替えた」を押すたびに次に押さえるコードが入れ替わる。数を数えながら
 * 押さえ替えるのは無理なので、数えるほうを道具に渡す。
 */
export function ChordChangeTrainer({ from = "C", to = "F" }: ChordChangeTrainerProps) {
  const pair = [from, to];
  for (const name of pair) {
    if (!UKULELE_CHORDS[name]) throw new Error(`未定義のコードです: ${name}`);
  }

  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(0);
  const [left, setLeft] = useState(DURATION_SECONDS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => stop, []);

  const start = () => {
    stop();
    setCount(0);
    setLeft(DURATION_SECONDS);
    setPhase("running");
    // 残り時間は1秒ごとに減らす。音を出さないので Web Audio の時計は要らない
    timer.current = setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          stop();
          setPhase("done");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  const nextIndex = count % 2;

  return (
    <div className="trainer">
      <div className="trainer__chords">
        {pair.map((name, index) => (
          <div
            key={name}
            className={`trainer__chord${phase === "running" && index === nextIndex ? " is-next" : ""}`}
          >
            <ChordDiagram name={name} size="sm" />
            {phase === "running" && index === nextIndex && (
              <p className="trainer__cue">次はこれ</p>
            )}
          </div>
        ))}
      </div>

      <div className="trainer__readout">
        <p className="trainer__stat">
          <span className="trainer__value">{count}</span>
          <span className="trainer__label">回</span>
        </p>
        <p className="trainer__stat trainer__stat--time">
          <span className="trainer__value">{left}</span>
          <span className="trainer__label">秒</span>
        </p>
      </div>

      {phase === "running" ? (
        <button
          type="button"
          className="btn btn--primary trainer__tap"
          onClick={() => setCount((value) => value + 1)}
        >
          替えた
        </button>
      ) : (
        <button type="button" className="btn btn--primary trainer__tap" onClick={start}>
          {phase === "done" ? "もう一度" : "60秒はじめる"}
        </button>
      )}

      {phase === "done" && (
        <p className="trainer__result">
          {count}回。
          {count >= 30
            ? "考えずに替えられています。曲の中で困りません。"
            : count >= 20
              ? "曲の中で使える速さです。"
              : "まだ形を探しています。毎日1回だけ測ってください。"}
        </p>
      )}

      <p className="trainer__note">
        音は鳴らさなくてよいので、形だけ作ります。記録は保存しません。
      </p>
    </div>
  );
}
