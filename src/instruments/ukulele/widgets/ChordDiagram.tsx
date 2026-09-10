import { UKULELE_CHORDS, describeChord } from "../chords";
import { UKULELE_TUNING } from "../tuning";
import "./ChordDiagram.css";

const FRET_COUNT = 5;

/**
 * 図の座標系。実寸は CSS の inline-size で決め、ここは比率だけを持つ。
 * px を size ごとに変えると線の太さと文字の大きさの比が崩れるため、
 * 座標は1つに固定して拡大縮小は SVG に任せる。
 */
const BOX_W = 168;
const PAD_X = 26;
const PAD_TOP = 34; // 開放弦の○とミュートの✕を置く余白
const PAD_BOTTOM = 12;
const GRID_W = BOX_W - PAD_X * 2;
const FRET_GAP = 30;
const GRID_H = FRET_GAP * FRET_COUNT;
const BOX_H = PAD_TOP + GRID_H + PAD_BOTTOM;

export type ChordDiagramProps = {
  name: string;
  /** 実寸。既定の md は練習中にスマホを譜面台の距離で見て読める大きさ。 */
  size?: "sm" | "md" | "lg";
};

/** ウクレレのコードの押さえ方を SVG で描く。 */
export function ChordDiagram({ name, size = "md" }: ChordDiagramProps) {
  const chord = UKULELE_CHORDS[name];
  if (!chord) throw new Error(`未定義のコードです: ${name}`);

  const stringCount = UKULELE_TUNING.strings.length;
  const stringGap = GRID_W / (stringCount - 1);
  const stringX = (index: number) => PAD_X + index * stringGap;
  const fretY = (fret: number) => PAD_TOP + fret * FRET_GAP;
  /** 押さえる指の丸は、フレット間の真ん中に置く。 */
  const dotY = (fret: number) => fretY(fret) - FRET_GAP / 2;

  const barre = chord.barre;
  /** セーハが受け持つ弦。1本の指なので、弦ごとの丸と数字は描かない。 */
  const isBarred = (index: number, fret: number | "x") =>
    barre !== undefined && fret === barre.fret && index >= barre.from && index <= barre.to;

  return (
    <figure className={`chord-diagram chord-diagram--${size}`}>
      <svg
        viewBox={`0 0 ${BOX_W} ${BOX_H}`}
        role="img"
        aria-label={`${name} コードの押さえ方。${describeChord(chord)}`}
      >
        {/* ナット（0フレット）。ここだけ太くして上下の向きを示す */}
        <line
          x1={stringX(0)}
          y1={fretY(0)}
          x2={stringX(stringCount - 1)}
          y2={fretY(0)}
          className="chord-diagram__nut"
        />
        {Array.from({ length: FRET_COUNT }, (_, i) => i + 1).map((fret) => (
          <line
            key={fret}
            x1={stringX(0)}
            y1={fretY(fret)}
            x2={stringX(stringCount - 1)}
            y2={fretY(fret)}
            className="chord-diagram__fret"
          />
        ))}
        {UKULELE_TUNING.strings.map((_, index) => (
          <line
            key={index}
            x1={stringX(index)}
            y1={fretY(0)}
            x2={stringX(index)}
            y2={fretY(FRET_COUNT)}
            className="chord-diagram__string"
          />
        ))}

        {barre && (
          <g>
            <rect
              data-testid="barre"
              x={stringX(barre.from) - stringGap * 0.34}
              y={dotY(barre.fret) - FRET_GAP * 0.34}
              width={(barre.to - barre.from) * stringGap + stringGap * 0.68}
              height={FRET_GAP * 0.68}
              rx={FRET_GAP * 0.34}
              className="chord-diagram__barre"
            />
            {/* 指番号は棒の中央に1つ。弦ごとに並べると1本の指に見えない */}
            <text
              x={(stringX(barre.from) + stringX(barre.to)) / 2}
              y={dotY(barre.fret)}
              className="chord-diagram__finger"
            >
              {chord.fingers[barre.from]}
            </text>
          </g>
        )}

        {chord.frets.map((fret, index) => {
          if (isBarred(index, fret)) return null;
          if (fret === "x") {
            return (
              <text
                key={index}
                data-testid="muted-string"
                x={stringX(index)}
                y={PAD_TOP - 14}
                className="chord-diagram__mark"
              >
                ✕
              </text>
            );
          }
          if (fret === 0) {
            return (
              <circle
                key={index}
                data-testid="open-string"
                cx={stringX(index)}
                cy={PAD_TOP - 15}
                r={9}
                className="chord-diagram__open"
              />
            );
          }
          return (
            <g key={index} data-testid="finger-dot">
              <circle
                cx={stringX(index)}
                cy={dotY(fret)}
                r={FRET_GAP * 0.42}
                className="chord-diagram__dot"
              />
              <text
                x={stringX(index)}
                y={dotY(fret)}
                className="chord-diagram__finger"
              >
                {chord.fingers[index]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="chord-diagram__name">{name}</figcaption>
    </figure>
  );
}
