import { Figure } from "../../../../core/widgets/Figure";

/**
 * 右手を置く位置。
 *
 * 本文の「ネックとボディのつなぎ目のあたり。ギターのようにサウンドホールの上ではない」を
 * そのまま図にする。手は描かず、位置だけを○と×で示す。
 * 手の形を描き起こすと、位置ではなく手つきに目が行く。
 */
export function StrumSpot() {
  return (
    <Figure
      alt="ウクレレの正面図。右手で弦を鳴らす位置は、ネックとボディのつなぎ目のあたり。サウンドホールの上ではない。"
      caption="つなぎ目のあたりを弾くと、ウクレレらしい軽い音になる。サウンドホールの上は音がこもる。"
    >
      <svg viewBox="0 0 320 268">
        <path
          d="M 96 74 C 118 74, 138 88, 138 114 C 138 134, 126 142, 126 152
             C 126 166, 148 174, 148 206 C 148 238, 126 256, 96 256
             C 66 256, 44 238, 44 206 C 44 174, 66 166, 66 152
             C 66 142, 54 134, 54 114 C 54 88, 74 74, 96 74 Z"
          className="fig-fill-soft"
        />
        <circle cx={96} cy={172} r={17} className="fig-outline" />
        <rect x={82} y={222} width={28} height={8} rx={3} className="fig-fill-soft" />
        {/* ネックは上端で断ち切る。ここにナットを描くと、ネックがそこで終わる形に見える */}
        <rect x={85} y={-2} width={22} height={80} className="fig-fill-soft" />
        {[18, 36, 52, 66].map((y) => (
          <line key={y} x1={85} y1={y} x2={107} y2={y} className="fig-metal" />
        ))}
        {[87.75, 93.25, 98.75, 104.25].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1={0}
            x2={x}
            y2={226}
            className="fig-string"
            strokeWidth={[1.8, 3.4, 2.5, 1.2][i]}
          />
        ))}

        {/* 弾く位置。ネックとボディのつなぎ目のあたり */}
        <circle cx={96} cy={100} r={20} className="fig-mark-line" />
        <polyline points="120,100 168,100" className="fig-leader" />
        <text x={174} y={96} className="fig-label fig-label--accent">
          ここで鳴らす
        </text>
        <text x={174} y={116} className="fig-label fig-label--quiet">
          ネックとボディの
        </text>
        <text x={174} y={133} className="fig-label fig-label--quiet">
          つなぎ目のあたり
        </text>

        {/* サウンドホールの上は違う */}
        <g>
          <line x1={86} y1={162} x2={106} y2={182} className="fig-no" />
          <line x1={106} y1={162} x2={86} y2={182} className="fig-no" />
        </g>
        <polyline points="120,172 168,172" className="fig-leader" />
        <text x={174} y={168} className="fig-label fig-label--no">
          ここではない
        </text>
        <text x={174} y={188} className="fig-label fig-label--quiet">
          ギターの位置
        </text>
      </svg>
    </Figure>
  );
}
