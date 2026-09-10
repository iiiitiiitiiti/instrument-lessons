import { midiToFrequency, midiToNote, noteToMidi } from "../../../../core/audio/pitch";
import { Figure } from "../../../../core/widgets/Figure";
import { UKULELE_TUNING } from "../../tuning";

const BOX_W = 320;
const BOX_H = 190;
const PLOT_TOP = 26;
const PLOT_BOTTOM = 138;
const PLOT_LEFT = 56;
const PLOT_RIGHT = 300;

export type PitchMapProps = {
  /** 4弦を1オクターブ下げた Low-G の並びを描く。 */
  lowG?: boolean;
};

/**
 * 4本の弦の音の高さを縦位置で示す。
 *
 * 高さは `UKULELE_TUNING` と `noteToMidi` から計算する。図に数値を書き写さないのは、
 * チューニングを変えたときに図だけが古くなるのを避けるため。
 */
export function PitchMap({ lowG = false }: PitchMapProps) {
  const strings = UKULELE_TUNING.strings.map((string, index) => {
    const midi = noteToMidi(string.note) - (lowG && index === 0 ? 12 : 0);
    return { label: string.label, midi, note: midiToNote(midi) };
  });

  // 目盛りは両端に半音1つ分の余白を持たせる。点が枠線に乗ると読みにくい
  const lows = strings.map((s) => s.midi);
  const min = Math.min(...lows) - 2;
  const max = Math.max(...lows) + 2;
  const y = (midi: number) => PLOT_BOTTOM - ((midi - min) / (max - min)) * (PLOT_BOTTOM - PLOT_TOP);
  const step = (PLOT_RIGHT - PLOT_LEFT) / strings.length;
  const x = (index: number) => PLOT_LEFT + step * (index + 0.5);

  const path = strings.map((s, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(s.midi)}`).join(" ");
  const highest = strings.reduce((a, b) => (b.midi > a.midi ? b : a));
  const lowest = strings.reduce((a, b) => (b.midi < a.midi ? b : a));

  const alt = lowG
    ? `Low-G の音の高さ。${strings.map((s) => `${s.label}が${s.note}`).join("、")}で、4弦が一番低い。`
    : `High-G の音の高さ。${strings.map((s) => `${s.label}が${s.note}`).join("、")}で、${highest.label}が一番高く、${lowest.label}が一番低い。`;

  return (
    <Figure
      alt={alt}
      caption={
        lowG
          ? "Low-G は4弦だけが1オクターブ低い。左端から右へ順に高くなる並びになる。"
          : "左端の4弦が3弦より高い位置にある。この不揃いな並びが re-entrant tuning。"
      }
    >
      <svg viewBox={`0 0 ${BOX_W} ${BOX_H}`}>
        <text x={4} y={PLOT_TOP - 10} className="fig-label fig-label--quiet">
          高い
        </text>
        <text x={4} y={PLOT_BOTTOM + 14} className="fig-label fig-label--quiet">
          低い
        </text>
        <line
          x1={PLOT_LEFT - 12}
          y1={PLOT_TOP - 4}
          x2={PLOT_LEFT - 12}
          y2={PLOT_BOTTOM + 4}
          className="fig-leader"
        />

        {/* 弦をまたぐ折れ線。高さの上下がそのまま並びの形になる */}
        <path d={path} className="fig-mark-line" />

        {strings.map((string, index) => (
          <g key={string.label}>
            <line
              x1={x(index)}
              y1={y(string.midi)}
              x2={x(index)}
              y2={PLOT_BOTTOM + 4}
              className="fig-leader"
            />
            <circle cx={x(index)} cy={y(string.midi)} r={7} className="fig-mark" />
            <text
              x={x(index)}
              y={y(string.midi) - 14}
              className="fig-label fig-label--accent fig-center"
            >
              {string.note.replace(/-?\d+$/, "")}
            </text>
            <text x={x(index)} y={PLOT_BOTTOM + 24} className="fig-label fig-center">
              {string.label}
            </text>
            <text
              x={x(index)}
              y={PLOT_BOTTOM + 42}
              className="fig-label fig-label--num fig-center"
            >
              {Math.round(midiToFrequency(string.midi))} Hz
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  );
}
