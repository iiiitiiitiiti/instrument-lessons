import { Figure } from "../../../../core/widgets/Figure";

/** 上から下へ 4弦・3弦・2弦・1弦。線の太さは実際の弦の太さの順に合わせる。 */
const STRINGS = [
  { label: "4弦", y: 46, width: 1.8 },
  { label: "3弦", y: 68, width: 3.4 },
  { label: "2弦", y: 90, width: 2.5 },
  { label: "1弦", y: 112, width: 1.2 },
];

/**
 * 構えたときの弦の並びと番号。
 *
 * ウクレレを構えた向き（ネックが左）で描く。正面から見た図にすると、
 * 「下から数える」の上下が読み手の向きとずれる。
 */
export function StringNumbers() {
  return (
    <Figure
      alt="構えたときのウクレレの弦の並び。上から順に4弦、3弦、2弦、1弦で、床に近い一番下の細い弦が1弦。"
      caption="番号は下から数える。線の太さは実際の弦の太さの順で、一番太いのは3弦。"
    >
      <svg viewBox="0 0 320 170">
        <defs>
          <marker
            id="string-numbers-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
          </marker>
        </defs>

        <text x={56} y={22} className="fig-label fig-label--quiet">
          ヘッド側
        </text>
        <text x={244} y={22} className="fig-label fig-label--quiet fig-end">
          ボディ側
        </text>

        <rect x={56} y={34} width={188} height={90} className="fig-fill-soft" />
        <line x1={56} y1={32} x2={56} y2={126} className="fig-nut" />
        {[100, 140, 175, 205, 230].map((x) => (
          <line key={x} x1={x} y1={34} x2={x} y2={124} className="fig-metal" />
        ))}

        {STRINGS.map((string) => {
          const isFirst = string.label === "1弦";
          return (
            <g key={string.label}>
              <line
                x1={56}
                y1={string.y}
                x2={244}
                y2={string.y}
                className={isFirst ? "fig-mark-line" : "fig-string"}
                strokeWidth={string.width}
              />
              <text
                x={50}
                y={string.y + 5}
                className={`fig-label fig-end${isFirst ? " fig-label--accent" : ""}`}
              >
                {string.label}
              </text>
            </g>
          );
        })}

        {/* 1弦が床に一番近いことを、床の線との距離で示す */}
        <line
          x1={262}
          y1={112}
          x2={262}
          y2={142}
          className="fig-mark-line"
          markerEnd="url(#string-numbers-arrow)"
        />
        <line x1={20} y1={150} x2={280} y2={150} className="fig-leader" />
        <text x={20} y={166} className="fig-label fig-label--quiet">
          床
        </text>
      </svg>
    </Figure>
  );
}
