import { noteToMidi } from "../audio/pitch";

/**
 * ABC 記法のごく小さなサブセットのパーサ。
 *
 * 楽譜ライブラリの「お手本の再生」で、メロディ・コード・歌詞の音節を1つの文字列に持つために使う。
 * ABC を選んだのは、同じ文字列を abcjs で五線譜に描いて原譜と見比べられるから（DDR 017）。
 * そのため、ここで受け付けるのは abcjs と同じ意味に読まれる書き方だけに絞っている。
 *
 * 時間の単位は16分音符。`L:1/16` だけを受け付け、長さは16分音符の整数倍に限る。
 * 32分音符や3連符が要る曲が出たら、その時点で単位を見直す。
 */

export type TuneNote = {
  /** 曲頭からの位置（16分音符の数）。 */
  start: number;
  length: number;
  midi: number;
  /** 前の音からタイでつながっている。新しく発音しない。 */
  tied: boolean;
  /** この音で鳴っている音節の番号（Tune.syllables の添字）。歌詞の無い曲では -1。 */
  syllable: number;
};

export type TuneChord = {
  start: number;
  name: string;
};

export type TuneBar = {
  start: number;
  length: number;
  /** その小節の拍子での、満たしたときの長さ（16分音符の数）。 */
  capacity: number;
};

export type Tune = {
  notes: TuneNote[];
  chords: TuneChord[];
  bars: TuneBar[];
  /** 歌詞の音節。`w:` 行に書いた順。 */
  syllables: string[];
  /** 各音節を歌い出す位置（16分音符の数）。 */
  syllableStarts: number[];
  /** 曲全体の長さ（16分音符の数）。 */
  length: number;
};

const NOTE = /^(\^|_|=)?([A-Ga-g])([,']*)(\d+)?(-)?/;
const REST = /^z(\d+)?/;
const CHORD = /^"([^"]*)"/;
const INLINE_METER = /^\[M:(\d+)\/4\]/;
const BAR = /^(\|\]|\|\||\|)/;

const UNITS_PER_BEAT = 4;

const HOLD = Symbol("hold");

export function parseAbc(source: string): Tune {
  const notes: TuneNote[] = [];
  const chords: TuneChord[] = [];
  const bars: TuneBar[] = [];
  const lyricItems: (string | typeof HOLD)[] = [];
  let hasLyrics = false;

  let capacity: number | null = null;
  let unitOk = false;
  let keyOk = false;
  let musicStarted = false;

  let position = 0;
  let barStart = 0;
  let pendingChord: string | null = null;
  let pendingTie: number | null = null;
  // 臨時記号は、同じ小節の同じ高さの音に続けて効く（ABC 2.1 の規則）
  const accidentals = new Map<string, number>();

  const closeBar = () => {
    if (position > barStart) {
      bars.push({ start: barStart, length: position - barStart, capacity: capacity ?? 0 });
    }
    barStart = position;
    accidentals.clear();
  };

  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  lines.forEach((raw, lineIndex) => {
    const line = raw.replace(/%.*$/, "").trim();
    const where = `${lineIndex + 1}行目`;
    if (line === "") return;

    if (line.startsWith("w:")) {
      hasLyrics = true;
      for (const token of line.slice(2).trim().split(/\s+/)) {
        if (token === "") continue;
        if (token === "_") {
          lyricItems.push(HOLD);
          continue;
        }
        if (token.includes("_")) throw new Error(`${where}: _ は音節と離して書きます: ${token}`);
        for (const part of token.split("-")) {
          if (part !== "") lyricItems.push(part);
        }
      }
      return;
    }

    const field = /^([A-Za-z]):(.*)$/.exec(line);
    if (field) {
      const [, name, value] = field;
      const content = value.trim();
      if (name === "X" || name === "T") return;
      if (musicStarted) {
        throw new Error(`${where}: 曲の途中で ${name}: は書けません（拍子の変更は [M:2/4] と書く）`);
      }
      if (name === "M") {
        const meter = /^(\d+)\/4$/.exec(content);
        if (!meter || Number(meter[1]) === 0) throw new Error(`${where}: 拍子は n/4 だけを扱います: ${content}`);
        capacity = Number(meter[1]) * UNITS_PER_BEAT;
        return;
      }
      if (name === "L") {
        if (content !== "1/16") throw new Error(`${where}: 単位の長さは L:1/16 だけを扱います: ${content}`);
        unitOk = true;
        return;
      }
      if (name === "K") {
        if (content !== "C") throw new Error(`${where}: キーは K:C だけを扱います（C へ移して書く）: ${content}`);
        keyOk = true;
        return;
      }
      throw new Error(`${where}: 扱わないヘッダです: ${name}:`);
    }

    if (capacity === null || !unitOk || !keyOk) {
      throw new Error(`${where}: 音符より前に M: と L:1/16 と K:C を書きます`);
    }
    musicStarted = true;

    let rest = line;
    while (rest.length > 0) {
      const column = `${where} ${line.length - rest.length + 1}文字目`;

      if (/^\s/.test(rest)) {
        rest = rest.replace(/^\s+/, "");
        continue;
      }

      const chord = CHORD.exec(rest);
      if (chord) {
        const name = chord[1].trim();
        if (name === "") throw new Error(`${column}: コード名が空です`);
        if (pendingChord !== null) throw new Error(`${column}: コード記号が続いています`);
        pendingChord = name;
        rest = rest.slice(chord[0].length);
        continue;
      }

      const meter = INLINE_METER.exec(rest);
      if (meter) {
        if (position !== barStart) throw new Error(`${column}: 拍子の変更は小節の頭に書きます`);
        if (Number(meter[1]) === 0) throw new Error(`${column}: 拍子が 0 です`);
        capacity = Number(meter[1]) * UNITS_PER_BEAT;
        rest = rest.slice(meter[0].length);
        continue;
      }

      const bar = BAR.exec(rest);
      if (bar) {
        if (pendingChord !== null) throw new Error(`${column}: コード記号の後に音符がありません`);
        closeBar();
        rest = rest.slice(bar[0].length);
        continue;
      }

      const restMatch = REST.exec(rest);
      if (restMatch) {
        const length = readLength(restMatch[1], rest.slice(restMatch[0].length), column);
        if (pendingTie !== null) throw new Error(`${column}: タイの後が休符です`);
        attachChord(position);
        position += length;
        rest = rest.slice(restMatch[0].length);
        continue;
      }

      const note = NOTE.exec(rest);
      if (note) {
        const [whole, accidental, letter, octaveMarks, digits, tie] = note;
        const length = readLength(digits, rest.slice(whole.length), column);
        const midi = pitchOf(accidental, letter, octaveMarks, accidentals);
        const tied = pendingTie !== null;
        if (tied && pendingTie !== midi) throw new Error(`${column}: タイの前後で音の高さが違います`);
        attachChord(position);
        notes.push({ start: position, length, midi, tied, syllable: -1 });
        pendingTie = tie ? midi : null;
        position += length;
        rest = rest.slice(whole.length);
        continue;
      }

      throw new Error(`${column}: 読めない文字です: ${rest[0]}`);
    }
  });

  function attachChord(at: number) {
    if (pendingChord === null) return;
    chords.push({ start: at, name: pendingChord });
    pendingChord = null;
  }

  if (!musicStarted) throw new Error("音符がありません");
  if (pendingChord !== null) throw new Error("最後のコード記号の後に音符がありません");
  if (pendingTie !== null) throw new Error("最後の音のタイの先に音符がありません");
  closeBar();

  bars.forEach((bar, index) => {
    const label = `${index + 1}小節目`;
    if (bar.length > bar.capacity) {
      throw new Error(`${label}: 長すぎます（${bar.length} / ${bar.capacity}）`);
    }
    // 弱起で始まる最初の小節と、伸ばして終わる最後の小節だけは短くてよい
    const edge = index === 0 || index === bars.length - 1;
    if (bar.length < bar.capacity && !edge) {
      throw new Error(`${label}: 短すぎます（${bar.length} / ${bar.capacity}）`);
    }
  });

  const syllables: string[] = [];
  const syllableStarts: number[] = [];
  if (hasLyrics) {
    if (lyricItems.length !== notes.length) {
      throw new Error(`歌詞の数（${lyricItems.length}）と音符の数（${notes.length}）が合いません`);
    }
    let current = -1;
    notes.forEach((note, index) => {
      const item = lyricItems[index];
      const label = `${index + 1}番目の音符`;
      if (note.tied && item !== HOLD) {
        // abcjs はタイの続きの音符にも音節を割り当てる。_ を書かないと描画と再生で歌詞がずれる
        throw new Error(`${label}はタイの続きなので、歌詞は _ にします（${String(item)}）`);
      }
      if (item === HOLD) {
        if (current === -1) throw new Error(`${label}: 最初の音節の前に _ は置けません`);
        note.syllable = current;
        return;
      }
      syllables.push(item);
      syllableStarts.push(note.start);
      current = syllables.length - 1;
      note.syllable = current;
    });
  }

  return { notes, chords, bars, syllables, syllableStarts, length: position };
}

function readLength(digits: string | undefined, after: string, column: string): number {
  if (after.startsWith("/")) throw new Error(`${column}: 16分音符より短い長さは扱いません`);
  if (digits === undefined) return 1;
  const length = Number(digits);
  if (length === 0) throw new Error(`${column}: 長さが 0 です`);
  return length;
}

function pitchOf(
  accidental: string | undefined,
  letter: string,
  octaveMarks: string,
  accidentals: Map<string, number>,
): number {
  let octave = letter === letter.toUpperCase() ? 4 : 5;
  for (const mark of octaveMarks) octave += mark === "," ? -1 : 1;
  const name = `${letter.toUpperCase()}${octave}`;
  if (accidental !== undefined) {
    accidentals.set(name, accidental === "^" ? 1 : accidental === "_" ? -1 : 0);
  }
  return noteToMidi(name) + (accidentals.get(name) ?? 0);
}
