import { playNotes } from "../audio/output/play";

export type Tone = { label: string; note: string };

/** 基準音を鳴らすボタンを並べる。チューニングや音程の確認に使う。 */
export function TonePlayer({ tones }: { tones: Tone[] }) {
  return (
    <div className="tone-player">
      {tones.map((tone) => (
        <button
          key={tone.label}
          type="button"
          onClick={() => playNotes([tone.note], { seconds: 3 })}
        >
          {tone.label}（{tone.note.replace(/\d/, "")}）
        </button>
      ))}
    </div>
  );
}
