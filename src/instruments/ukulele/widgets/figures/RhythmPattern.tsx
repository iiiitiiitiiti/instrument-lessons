import { Figure } from "../../../../core/widgets/Figure";

/** 下向き＝ダウンストローク、上向き＝アップストローク、休み＝弾かない。 */
export type Stroke = "D" | "U" | "-";

const STROKE_NAMES: Record<Stroke, string> = { D: "下", U: "上", "-": "休み" };

const LEFT = 26;
const RIGHT = 294;
const TOP_NO_CHORD = 14;
const CHORD_BAND_H = 34;

export type RhythmPatternProps = {
  /** ストロークの並び。1小節あたり4個（4分音符）か8個（8分音符）。 */
  strokes: Stroke[];
  /** 何小節分か。2にすると真ん中に小節線を引き、拍の数え直しをする。 */
  bars?: 1 | 2;
  /** 上に並べるコードの帯。span はストローク何個分か。 */
  chords?: { label: string; span: number }[];
  /** 図の下に出す補足。 */
  caption?: string;
  /** 今鳴っているストローク。再生中に光らせる。-1 で消灯。 */
  activeIndex?: number;
};

/**
 * 1小節のストロークパターンを、拍・向き・コードの3段で示す。
 *
 * 音を鳴らす機能は持たない（それはプランBの StrumPattern の役目）。
 * ここでは「どの拍でどちらに動かすか」を静かに読めることだけを引き受ける。
 */
export function RhythmPattern({
  strokes,
  bars = 1,
  chords,
  caption,
  activeIndex = -1,
}: RhythmPatternProps) {
  const step = (RIGHT - LEFT) / strokes.length;
  const x = (index: number) => LEFT + step * (index + 0.5);
  const bandH = chords ? CHORD_BAND_H : 0;
  const top = TOP_NO_CHORD + bandH;
  const shaftTop = top + 8;
  const shaftBottom = top + 44;
  const countY = shaftBottom + 30;
  const height = countY + 10;

  /** 8分音符なら「1 と 2 と …」、4分音符なら「1 2 3 4」。拍は小節ごとに数え直す。 */
  const perBar = strokes.length / bars;
  const eighths = perBar === 8;
  const count = (index: number) => {
    const inBar = index % perBar;
    return eighths ? (inBar % 2 === 0 ? String(inBar / 2 + 1) : "と") : String(inBar + 1);
  };

  const alt = [
    `${bars}小節のストロークパターン。${eighths ? "8分音符" : "4分音符"}で`,
    strokes.map((stroke) => STROKE_NAMES[stroke]).join("、"),
    "の順に動かす。",
    chords ? `コードは${chords.map((chord) => chord.label).join("→")}。` : "",
  ].join("");

  let cursor = 0;

  return (
    <Figure alt={alt} caption={caption}>
      <svg viewBox={`0 0 320 ${height}`}>
        {chords?.map((chord) => {
          const from = cursor;
          cursor += chord.span;
          const left = LEFT + step * from;
          const width = step * chord.span;
          return (
            <g key={`${chord.label}-${from}`}>
              <rect
                x={left + 2}
                y={12}
                width={width - 4}
                height={26}
                rx={4}
                className="fig-mark"
                opacity={0.12}
              />
              <text
                x={left + width / 2}
                y={30}
                className="fig-label fig-label--accent fig-center"
              >
                {chord.label}
              </text>
            </g>
          );
        })}

        {/* 小節線。2小節のときだけ引く */}
        {bars === 2 && (
          <line
            x1={LEFT + step * perBar}
            y1={top}
            x2={LEFT + step * perBar}
            y2={countY - 14}
            className="fig-leader"
          />
        )}

        {/* 再生中の位置。矢印より下に置いて、矢印を塗り潰さないようにする */}
        {activeIndex >= 0 && (
          <rect
            x={LEFT + step * (activeIndex % strokes.length) + 2}
            y={top}
            width={step - 4}
            height={shaftBottom - top + 8}
            rx={4}
            className="fig-mark"
            opacity={0.16}
          />
        )}

        {strokes.map((stroke, index) => {
          const cx = x(index);
          if (stroke === "-") {
            return (
              <line
                key={index}
                x1={cx - 8}
                y1={(shaftTop + shaftBottom) / 2}
                x2={cx + 8}
                y2={(shaftTop + shaftBottom) / 2}
                className="fig-leader"
                strokeWidth={2.4}
              />
            );
          }
          const down = stroke === "D";
          return (
            <g key={index} className="fig-mark">
              <line
                x1={cx}
                y1={down ? shaftTop : shaftBottom}
                x2={cx}
                y2={down ? shaftBottom - 8 : shaftTop + 8}
                className="fig-mark-line"
                strokeWidth={2.6}
              />
              <polygon
                points={
                  down
                    ? `${cx - 6},${shaftBottom - 10} ${cx + 6},${shaftBottom - 10} ${cx},${shaftBottom}`
                    : `${cx - 6},${shaftTop + 10} ${cx + 6},${shaftTop + 10} ${cx},${shaftTop}`
                }
                className="fig-mark"
              />
            </g>
          );
        })}

        {strokes.map((_, index) => (
          <text
            key={index}
            x={x(index)}
            y={countY}
            className={`fig-label fig-center${index % 2 === 1 && eighths ? " fig-label--quiet" : ""}`}
          >
            {count(index)}
          </text>
        ))}
      </svg>
    </Figure>
  );
}
