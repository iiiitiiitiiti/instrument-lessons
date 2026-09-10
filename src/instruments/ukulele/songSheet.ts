/**
 * 歌詞コード譜（ChordPro 風の記法）のパーサ。
 *
 * 仕様 §8「歌詞コード譜の記法」で決めた形を読む。
 *
 *   [C]Oh when the saints [F]go marching [C]in
 *
 * 角かっこの直後の文字でコードを替える、という規則だけを持つ。小節線・繰り返し・
 * 拍の情報は扱わない。Lesson 12 が教えている規則がこれ1つなので、
 * 読み手が知らない記法を表示に混ぜない。
 */

/** 歌詞のひと塊。chord が付いていれば、その塊の先頭でコードを替える。 */
export type SongSegment = {
  /** コード名。塊の途中でコードが変わらないなら null。 */
  chord: string | null;
  text: string;
};

/** 1行分。空配列は歌詞の空行（節の区切り）。 */
export type SongLine = SongSegment[];

/**
 * 歌詞コード譜を行と塊に分解する。
 *
 * 塊を単位にするのは表示のため。コードと歌詞を別々の行として持つと、
 * 幅の狭い画面で折り返した瞬間に対応が崩れる。コードを「その歌詞と同じ塊」に
 * 入れておけば、塊ごと折り返しても対応は動かない。
 */
export function parseSongSheet(source: string): SongLine[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");

  // MDX のテンプレート文字列は前後に改行が入るため、両端の空行だけ落とす
  while (lines.length > 0 && lines[0].trim() === "") lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();

  return lines.map(parseLine);
}

function parseLine(line: string): SongLine {
  const trimmed = line.replace(/\s+$/, "");
  if (trimmed.trim() === "") return [];

  const segments: SongSegment[] = [];
  let chord: string | null = null;
  let text = "";

  const push = () => {
    if (chord === null && text === "") return;
    segments.push({ chord, text });
  };

  let index = 0;
  while (index < trimmed.length) {
    const char = trimmed[index];
    if (char !== "[") {
      text += char;
      index += 1;
      continue;
    }

    const close = trimmed.indexOf("]", index + 1);
    if (close === -1) {
      // 閉じ忘れ。残りをそのまま歌詞として出す。黙って捨てると書き間違いが見えない
      text += trimmed.slice(index);
      break;
    }

    const name = trimmed.slice(index + 1, close).trim();
    index = close + 1;

    // 空の角かっこはコード指定として読まず、前後の歌詞をつなぐ
    if (name === "") continue;

    push();
    chord = name;
    text = "";
  }

  push();
  return segments;
}

/** 譜面に出てくるコード名を、最初に現れた順で重複なく返す。 */
export function songSheetChords(lines: SongLine[]): string[] {
  const seen: string[] = [];
  for (const line of lines) {
    for (const segment of line) {
      if (segment.chord && !seen.includes(segment.chord)) seen.push(segment.chord);
    }
  }
  return seen;
}
