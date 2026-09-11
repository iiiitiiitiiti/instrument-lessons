import { describe, expect, test } from "vitest";
import { parseAbc } from "../../src/core/music/abc";

const HEADER = "M:4/4\nL:1/16\nK:C";
const tune = (body: string, header = HEADER) => parseAbc(`${header}\n${body}`);

describe("parseAbc: 音の高さと長さ", () => {
  test("大文字が4オクターブ目、小文字が5オクターブ目", () => {
    expect(tune("C4 c4 C,4 c'4").notes.map((note) => note.midi)).toEqual([60, 72, 48, 84]);
  });

  test("臨時記号は ^ がシャープ、_ がフラット", () => {
    expect(tune("^F8 _B8").notes.map((note) => note.midi)).toEqual([66, 70]);
  });

  test("臨時記号は同じ小節の同じ高さの音に続けて効き、小節線で戻る", () => {
    expect(tune("^F4 F4 f4 F4 | F16").notes.map((note) => note.midi)).toEqual([
      66, 66, 77, 66, 65,
    ]);
  });

  test("= で臨時記号を打ち消す", () => {
    expect(tune("_B4 =B4 B8").notes.map((note) => note.midi)).toEqual([70, 71, 71]);
  });

  test("数字が無ければ16分音符1つ分", () => {
    expect(tune("C D E F G12").notes.map((note) => note.length)).toEqual([1, 1, 1, 1, 12]);
  });

  test("位置は長さを足していく。休符も位置を進める", () => {
    const parsed = tune("C4 z4 D8");
    expect(parsed.notes.map((note) => note.start)).toEqual([0, 8]);
    expect(parsed.length).toBe(16);
  });
});

describe("parseAbc: コード", () => {
  test("コード記号は次の音符の位置に付く", () => {
    expect(tune('"C"C8 "G7"D8').chords).toEqual([
      { start: 0, name: "C" },
      { start: 8, name: "G7" },
    ]);
  });

  test("休符の前にも置ける", () => {
    expect(tune('"C"z4 C12').chords).toEqual([{ start: 0, name: "C" }]);
  });

  test("コード記号の後に音符が無ければエラー", () => {
    expect(() => tune('C16 | "C" |')).toThrow(/音符がありません/);
    expect(() => tune('C16 "C"')).toThrow(/音符がありません/);
  });
});

describe("parseAbc: タイ", () => {
  test("タイの続きの音は tied になる。小節をまたいでもよい", () => {
    const parsed = tune("C8 D8- | D16");
    expect(parsed.notes.map((note) => note.tied)).toEqual([false, false, true]);
  });

  test("タイの前後で高さが違えばエラー", () => {
    expect(() => tune("C8- D8")).toThrow(/高さが違います/);
  });

  test("タイの後が休符ならエラー", () => {
    expect(() => tune("C8- z8")).toThrow(/休符/);
  });

  test("最後の音にタイが残ればエラー", () => {
    expect(() => tune("C16-")).toThrow(/タイの先/);
  });
});

describe("parseAbc: 小節", () => {
  test("小節の位置と長さを返す", () => {
    expect(tune("C16 | D16 |]").bars).toEqual([
      { start: 0, length: 16, capacity: 16 },
      { start: 16, length: 16, capacity: 16 },
    ]);
  });

  test("最初の小節は短くてよい（弱起）", () => {
    expect(tune("G4 | C16 | D16").bars[0]).toEqual({ start: 0, length: 4, capacity: 16 });
  });

  test("最後の小節は短くてよい", () => {
    expect(tune("C16 | D12 |]").bars[1].length).toBe(12);
  });

  test("途中の小節が短ければエラー", () => {
    expect(() => tune("C16 | D12 | E16")).toThrow(/2小節目: 短すぎます/);
  });

  test("長すぎればエラー", () => {
    expect(() => tune("C16 | D20 | E16")).toThrow(/2小節目: 長すぎます/);
  });

  test("行末の小節線と次の行の間に空の小節を作らない", () => {
    expect(tune("C16 |\nD16 |").bars).toHaveLength(2);
  });

  test("[M:2/4] で次の小節から拍子が変わる", () => {
    const parsed = tune("C16 | [M:2/4] D8 | [M:4/4] E16");
    expect(parsed.bars.map((bar) => bar.capacity)).toEqual([16, 8, 16]);
  });

  test("拍子の変更を小節の途中に書けばエラー", () => {
    expect(() => tune("C8 [M:2/4] D8")).toThrow(/小節の頭/);
  });
});

describe("parseAbc: 歌詞", () => {
  test("空白と - で音節に分け、休符は飛ばす", () => {
    const parsed = tune("C4 z4 D4 E4 |\nw: Ha-ʻa heo");
    expect(parsed.syllables).toEqual(["Ha", "ʻa", "heo"]);
    expect(parsed.syllableStarts).toEqual([0, 8, 12]);
    expect(parsed.notes.map((note) => note.syllable)).toEqual([0, 1, 2]);
  });

  test("行をまたいで続く。行末の - は無視する", () => {
    const parsed = tune("C8 D8 |\nw: E u-\nE16 |\nw: hai");
    expect(parsed.syllables).toEqual(["E", "u", "hai"]);
  });

  test("_ は前の音節を次の音符へ伸ばす", () => {
    const parsed = tune("C4 D4 E8 |\nw: ma _ i");
    expect(parsed.notes.map((note) => note.syllable)).toEqual([0, 0, 1]);
    expect(parsed.syllableStarts).toEqual([0, 8]);
  });

  test("タイの続きには _ を書く", () => {
    const parsed = tune("C8- C4 D4 |\nw: la _ i");
    expect(parsed.notes.map((note) => note.syllable)).toEqual([0, 0, 1]);
  });

  test("タイの続きに音節を書けばエラー（abcjs と割り当てがずれる）", () => {
    expect(() => tune("C8- C4 D4 |\nw: la i ka")).toThrow(/タイの続き/);
  });

  test("音節と音符の数が合わなければエラー", () => {
    expect(() => tune("C8 D8 |\nw: la")).toThrow(/合いません/);
  });

  test("最初に _ は置けない", () => {
    expect(() => tune("C8 D8 |\nw: _ la")).toThrow(/最初の音節/);
  });

  test("句読点と長音符号は音節に残す", () => {
    expect(tune("C8 D8 |\nw: ʻoe, nā").syllables).toEqual(["ʻoe,", "nā"]);
  });

  test("歌詞が無ければ音節は空で、音符の syllable は -1", () => {
    const parsed = tune("C8 D8");
    expect(parsed.syllables).toEqual([]);
    expect(parsed.notes.every((note) => note.syllable === -1)).toBe(true);
  });
});

describe("parseAbc: 受け付けない書き方", () => {
  test("L:1/16 以外はエラー", () => {
    expect(() => tune("C4", "M:4/4\nL:1/8\nK:C")).toThrow(/L:1\/16/);
  });

  test("K:C 以外はエラー", () => {
    expect(() => tune("C4", "M:4/4\nL:1/16\nK:G")).toThrow(/K:C/);
  });

  test("ヘッダが欠けていればエラー", () => {
    expect(() => tune("C4", "L:1/16\nK:C")).toThrow(/M:/);
  });

  test("16分音符より短い長さはエラー", () => {
    expect(() => tune("C/2 C3")).toThrow(/16分音符より短い/);
  });

  test("読めない文字はエラー", () => {
    expect(() => tune("C4 (D4)")).toThrow(/読めない文字/);
  });

  test("% 以降はコメント", () => {
    expect(tune("C16 % メモ").notes).toHaveLength(1);
  });

  test("音符が無ければエラー", () => {
    expect(() => parseAbc(HEADER)).toThrow(/音符がありません/);
  });
});
