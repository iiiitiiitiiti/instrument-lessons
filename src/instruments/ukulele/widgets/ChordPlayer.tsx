import { playNotes } from "../../../core/audio/output/play";
import { UKULELE_CHORDS, chordNotes } from "../chords";
import { ChordDiagram, type ChordDiagramProps } from "./ChordDiagram";
import "./ChordPlayer.css";

export type ChordPlayerProps = {
  name: string;
  size?: ChordDiagramProps["size"];
};

/**
 * コード図に音を付ける。押さえた形が合っているかを耳で確かめるためのもの。
 *
 * 鳴らし方を2つ出す。ジャランと弾くと和音として合っているかが分かり、
 * 1本ずつ鳴らすと、どの弦が鳴っていないかが分かる。初心者がつまずくのは
 * たいてい後者で、隣の弦に指が触って1本だけ死んでいる。
 */
export function ChordPlayer({ name, size = "md" }: ChordPlayerProps) {
  const chord = UKULELE_CHORDS[name];
  if (!chord) throw new Error(`未定義のコードです: ${name}`);
  const notes = chordNotes(chord);

  return (
    <div className="chord-player">
      <ChordDiagram name={name} size={size} />
      <div className="chord-player__actions">
        <button
          type="button"
          className="btn chord-player__btn"
          onClick={() => playNotes(notes, { spreadMs: 22, seconds: 2.2 })}
        >
          ジャランと鳴らす
        </button>
        <button
          type="button"
          className="btn chord-player__btn"
          onClick={() => playNotes(notes, { spreadMs: 260, seconds: 2.4 })}
        >
          1本ずつ鳴らす
        </button>
      </div>
    </div>
  );
}
