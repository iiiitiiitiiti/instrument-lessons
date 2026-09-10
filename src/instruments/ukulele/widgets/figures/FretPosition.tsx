import { Figure } from "../../../../core/widgets/Figure";

const BOARD_LEFT = 30;
const BOARD_RIGHT = 290;
/** ナットから数えたフレット（金属の棒）の位置。間隔はボディ側へ詰まっていく。 */
const FRETS = [82, 130, 172, 208, 238];
const STRINGS = [46, 68, 90, 106];
const STRING_WIDTHS = [1.8, 3.4, 2.5, 1.2];

/**
 * 「3フレットを押さえる」がどこを指すのかを示す。
 *
 * 棒の上ではなく手前、という本文の注意をそのまま図にする。
 * 押さえる位置に丸、棒の上に×を置き、同じ図の中で並べて比べさせる。
 * 説明は右に置くと 320 の座標に収まらないため、下に凡例としてまとめる。
 */
export function FretPosition() {
  const thirdFret = FRETS[2];
  const pressX = (FRETS[1] + thirdFret) / 2;

  return (
    <Figure
      alt="ネックの拡大図。3フレットを押さえるとは、ヘッド側から3本目の金属の棒の手前を押さえること。棒の真上ではない。"
      caption="どのフレットも「その棒の手前」を押さえる。棒の真上を押さえると音が詰まる。"
    >
      <svg viewBox="0 0 320 194">
        <text x={BOARD_LEFT + 4} y={24} className="fig-label fig-label--quiet">
          ヘッド側
        </text>

        <rect
          x={BOARD_LEFT}
          y={34}
          width={BOARD_RIGHT - BOARD_LEFT}
          height={82}
          className="fig-fill-soft"
        />
        <line x1={BOARD_LEFT} y1={32} x2={BOARD_LEFT} y2={118} className="fig-nut" />
        {FRETS.map((x) => (
          <line key={x} x1={x} y1={34} x2={x} y2={116} className="fig-metal" />
        ))}

        {/* 番号は棒に振られている。押さえる場所の番号ではない */}
        {FRETS.map((x, i) => (
          <text key={x} x={x} y={136} className="fig-label fig-label--num fig-center">
            {i + 1}
          </text>
        ))}

        {STRINGS.map((y, i) => (
          <line
            key={y}
            x1={BOARD_LEFT}
            y1={y}
            x2={BOARD_RIGHT}
            y2={y}
            className="fig-string"
            strokeWidth={STRING_WIDTHS[i]}
          />
        ))}

        {/* 棒の真上（してはいけないほう） */}
        <line x1={thirdFret - 7} y1={51} x2={thirdFret + 7} y2={63} className="fig-no" />
        <line x1={thirdFret + 7} y1={51} x2={thirdFret - 7} y2={63} className="fig-no" />

        {/* 押さえる位置。3本目の棒の手前 */}
        <circle cx={pressX} cy={STRINGS[3]} r={11} className="fig-mark" />

        {/* 凡例 */}
        <circle cx={38} cy={158} r={9} className="fig-mark" />
        <text x={56} y={164} className="fig-label fig-label--accent">
          ここを押さえる
        </text>
        <line x1={31} y1={180} x2={45} y2={192} className="fig-no" />
        <line x1={45} y1={180} x2={31} y2={192} className="fig-no" />
        <text x={56} y={192} className="fig-label fig-label--no">
          棒の真上ではない
        </text>
      </svg>
    </Figure>
  );
}
