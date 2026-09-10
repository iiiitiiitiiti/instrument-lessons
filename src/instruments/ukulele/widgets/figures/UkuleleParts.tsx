import { Figure } from "../../../../core/widgets/Figure";

/**
 * ウクレレの正面図に、覚える4つの部位の名前を引き出し線で付ける。
 *
 * 本文が「覚えるのは4つ」と書いているため、ラベルもその4つに絞る。
 * 図に本文以上の情報を載せると、どれを覚えればよいのかが薄まる。
 */
export function UkuleleParts() {
  return (
    <Figure
      alt="ウクレレの正面図。上端がヘッドで糸巻きが4つ付き、その下の細い部分がネック。ネックには金属の棒のフレットが並び、一番下のふくらんだ胴体がボディ。"
      caption="覚えるのはこの4つ。以降の説明はすべてこの名前で進む。"
    >
      <svg viewBox="0 0 320 320">
        {/* ボディ。上のふくらみ・くびれ・下のふくらみを持つ左右対称の輪郭 */}
        <path
          d="M 70 118 C 92 118, 112 132, 112 158 C 112 178, 100 186, 100 196
             C 100 210, 122 218, 122 250 C 122 282, 100 300, 70 300
             C 40 300, 18 282, 18 250 C 18 218, 40 210, 40 196
             C 40 186, 28 178, 28 158 C 28 132, 48 118, 70 118 Z"
          className="fig-fill-soft"
        />
        <circle cx={70} cy={216} r={17} className="fig-outline" />
        <rect x={56} y={266} width={28} height={8} rx={3} className="fig-fill-soft" />

        {/* ネック */}
        <rect x={59} y={42} width={22} height={80} className="fig-fill-soft" />

        {/* ヘッドと糸巻き */}
        <path d="M 54 42 L 50 12 Q 50 6, 56 6 L 84 6 Q 90 6, 90 12 L 86 42 Z" className="fig-fill-soft" />
        {[16, 30].map((y) => (
          <g key={y}>
            <line x1={50} y1={y} x2={42} y2={y} className="fig-metal" />
            <circle cx={40} cy={y} r={4} className="fig-fill-soft" />
            <line x1={90} y1={y} x2={98} y2={y} className="fig-metal" />
            <circle cx={100} cy={y} r={4} className="fig-fill-soft" />
          </g>
        ))}

        {/* ナットと、間隔が下へ詰まっていくフレット */}
        <line x1={57} y1={42} x2={83} y2={42} className="fig-nut" />
        {[60, 76, 90, 112].map((y) => (
          <line key={y} x1={59} y1={y} x2={81} y2={y} className="fig-metal" />
        ))}
        {/* ラベルで指す1本だけアクセント色にする */}
        <line x1={59} y1={102} x2={81} y2={102} className="fig-mark-line" />

        {/* 弦。ナットからブリッジまで。左端が4弦で、太さは実際の弦の順に合わせる */}
        {[61.75, 67.25, 72.75, 78.25].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1={42}
            x2={x}
            y2={270}
            className="fig-string"
            strokeWidth={[1.8, 3.4, 2.5, 1.2][i]}
          />
        ))}

        {/* 引き出し線とラベル */}
        <polyline points="146,20 104,20" className="fig-leader" />
        <text x={152} y={24} className="fig-label">
          ヘッド
        </text>

        <polyline points="146,62 100,62 84,74" className="fig-leader" />
        <text x={152} y={66} className="fig-label">
          ネック
        </text>

        <polyline points="146,104 110,104 84,102" className="fig-leader" />
        <text x={152} y={108} className="fig-label fig-label--accent">
          フレット
        </text>

        <polyline points="146,222 126,222" className="fig-leader" />
        <text x={152} y={226} className="fig-label">
          ボディ
        </text>
        <text x={152} y={246} className="fig-label fig-label--quiet">
          ここが鳴って
        </text>
        <text x={152} y={264} className="fig-label fig-label--quiet">
          音が大きくなる
        </text>
      </svg>
    </Figure>
  );
}
