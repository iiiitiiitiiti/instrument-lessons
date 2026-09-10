import { transpose } from "../../core/audio/pitch";
import { UKULELE_TUNING } from "./tuning";

export type ChordShape = {
  name: string;
  /** 4弦から1弦の順。0 は開放弦、"x" はミュート。 */
  frets: (number | "x")[];
  /** 押さえる指の番号（1=人差し指 〜 4=小指）。押さえない弦は null。 */
  fingers: (number | null)[];
  /** セーハ（同じフレットを1本の指で複数弦押さえる）。 */
  barre?: { fret: number; from: number; to: number };
};

export const UKULELE_CHORDS: Record<string, ChordShape> = {
  C: { name: "C", frets: [0, 0, 0, 3], fingers: [null, null, null, 3] },
  F: { name: "F", frets: [2, 0, 1, 0], fingers: [2, null, 1, null] },
  G7: { name: "G7", frets: [0, 2, 1, 2], fingers: [null, 2, 1, 3] },
  C7: { name: "C7", frets: [0, 0, 0, 1], fingers: [null, null, null, 1] },
  // ハワイアン D7。根音の D を含まないが2本指で押さえられ、ヴァンプでは定番。
  D7: { name: "D7", frets: [2, 0, 2, 0], fingers: [1, null, 2, null] },
  Am: { name: "Am", frets: [2, 0, 0, 0], fingers: [2, null, null, null] },
  Em: { name: "Em", frets: [0, 4, 3, 2], fingers: [null, 3, 2, 1] },
  Dm: { name: "Dm", frets: [2, 2, 1, 0], fingers: [2, 3, 1, null] },
  A7: { name: "A7", frets: [0, 1, 0, 0], fingers: [null, 1, null, null] },
  // カリキュラムでは扱わないが、コード一覧と外部コード譜のために定義しておく。
  Bb: { name: "Bb", frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1], barre: { fret: 1, from: 2, to: 3 } },
};

/** コードを鳴らしたときに出る音を、4弦から1弦の順に返す。ミュートした弦は含めない。 */
export function chordNotes(chord: ChordShape): string[] {
  const notes: string[] = [];
  chord.frets.forEach((fret, index) => {
    if (fret === "x") return;
    notes.push(transpose(UKULELE_TUNING.strings[index].note, fret));
  });
  return notes;
}
