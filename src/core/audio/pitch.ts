const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const LETTER_SEMITONES: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

const NOTE_PATTERN = /^([A-G])(#|b)?(-?\d+)$/;

/** 音名（"A4"、"F#3"、"Bb4"）を MIDI ノート番号へ変換する。 */
export function noteToMidi(note: string): number {
  const matched = NOTE_PATTERN.exec(note);
  if (!matched) throw new Error(`音名として解釈できません: ${note}`);
  const [, letter, accidental, octave] = matched;
  const offset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (Number(octave) + 1) * 12 + LETTER_SEMITONES[letter] + offset;
}

/** MIDI ノート番号を音名へ変換する。異名同音はシャープで表す。 */
export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${SHARP_NAMES[((midi % 12) + 12) % 12]}${octave}`;
}

/** MIDI ノート番号を周波数へ変換する。12平均律、A4 = 440 Hz。 */
export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** 音名を周波数へ変換する。 */
export function noteToFrequency(note: string): number {
  return midiToFrequency(noteToMidi(note));
}

/** 音名を半音単位で移動する。 */
export function transpose(note: string, semitones: number): string {
  return midiToNote(noteToMidi(note) + semitones);
}
