import { UKULELE_CHORDS } from "../chords";
import { UKULELE_TUNING } from "../tuning";
import "./ChordDiagram.css";

const FRET_COUNT = 5;
const SIZES = { sm: 96, md: 140, lg: 200 } as const;

export type ChordDiagramProps = {
  name: string;
  size?: keyof typeof SIZES;
};

/** ウクレレのコードの押さえ方を SVG で描く。 */
export function ChordDiagram({ name, size = "md" }: ChordDiagramProps) {
  const chord = UKULELE_CHORDS[name];
  if (!chord) throw new Error(`未定義のコードです: ${name}`);

  const width = SIZES[size];
  const height = width * 1.25;
  const padding = width * 0.16;
  const gridWidth = width - padding * 2;
  const gridHeight = height - padding * 2.2;
  const stringCount = UKULELE_TUNING.strings.length;
  const stringGap = gridWidth / (stringCount - 1);
  const fretGap = gridHeight / FRET_COUNT;
  const stringX = (index: number) => padding + index * stringGap;
  const fretY = (fret: number) => padding * 1.2 + fret * fretGap;

  return (
    <figure className="chord-diagram">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        role="img"
        aria-label={`${name} コードの押さえ方`}
      >
        <line
          x1={stringX(0)} y1={fretY(0)} x2={stringX(stringCount - 1)} y2={fretY(0)}
          className="chord-diagram__nut"
        />
        {Array.from({ length: FRET_COUNT }, (_, i) => i + 1).map((fret) => (
          <line
            key={fret}
            x1={stringX(0)} y1={fretY(fret)} x2={stringX(stringCount - 1)} y2={fretY(fret)}
            className="chord-diagram__fret"
          />
        ))}
        {UKULELE_TUNING.strings.map((_, index) => (
          <line
            key={index}
            x1={stringX(index)} y1={fretY(0)} x2={stringX(index)} y2={fretY(FRET_COUNT)}
            className="chord-diagram__string"
          />
        ))}

        {chord.barre && (
          <rect
            data-testid="barre"
            x={stringX(chord.barre.from) - stringGap * 0.22}
            y={fretY(chord.barre.fret) - fretGap * 0.72}
            width={(chord.barre.to - chord.barre.from) * stringGap + stringGap * 0.44}
            height={fretGap * 0.44}
            rx={fretGap * 0.22}
            className="chord-diagram__barre"
          />
        )}

        {chord.frets.map((fret, index) => {
          if (fret === "x") {
            return (
              <text
                key={index}
                data-testid="muted-string"
                x={stringX(index)} y={fretY(0) - fretGap * 0.3}
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
                cx={stringX(index)} cy={fretY(0) - fretGap * 0.45}
                r={stringGap * 0.16}
                className="chord-diagram__open"
              />
            );
          }
          return (
            <g key={index} data-testid="finger-dot">
              <circle
                cx={stringX(index)} cy={fretY(fret) - fretGap * 0.5}
                r={stringGap * 0.28}
                className="chord-diagram__dot"
              />
              <text
                x={stringX(index)} y={fretY(fret) - fretGap * 0.5}
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
