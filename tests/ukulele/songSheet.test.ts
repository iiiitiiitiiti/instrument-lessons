import { describe, expect, test } from "vitest";
import { parseSongSheet, songSheetChords } from "../../src/instruments/ukulele/songSheet";

describe("parseSongSheet", () => {
  test("仕様の例をコードと歌詞の塊に分ける", () => {
    expect(parseSongSheet("[C]Oh when the saints [F]go marching [C]in")).toEqual([
      [
        { chord: "C", text: "Oh when the saints " },
        { chord: "F", text: "go marching " },
        { chord: "C", text: "in" },
      ],
    ]);
  });

  test("行頭のコードが無い歌詞は、コードなしの塊で始まる", () => {
    expect(parseSongSheet("Oh when the [F]saints")).toEqual([
      [
        { chord: null, text: "Oh when the " },
        { chord: "F", text: "saints" },
      ],
    ]);
  });

  test("複数行をそれぞれ分ける", () => {
    const lines = parseSongSheet("[C]one\n[F]two");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toEqual([{ chord: "F", text: "two" }]);
  });

  test("途中の空行は節の区切りとして残す", () => {
    expect(parseSongSheet("[C]one\n\n[F]two")).toEqual([
      [{ chord: "C", text: "one" }],
      [],
      [{ chord: "F", text: "two" }],
    ]);
  });

  test("前後の空行は落とす", () => {
    // MDX のテンプレート文字列は前後に改行が入る
    expect(parseSongSheet("\n  \n[C]one\n\n")).toEqual([[{ chord: "C", text: "one" }]]);
  });

  test("空文字列は空の譜面になる", () => {
    expect(parseSongSheet("")).toEqual([]);
    expect(parseSongSheet("   \n  ")).toEqual([]);
  });

  test("コード名の前後の空白は落とす", () => {
    expect(parseSongSheet("[ G7 ]sing")).toEqual([[{ chord: "G7", text: "sing" }]]);
  });

  test("空の角かっこはコードとして読まず、歌詞をつなぐ", () => {
    expect(parseSongSheet("go[]ing")).toEqual([[{ chord: null, text: "going" }]]);
    expect(parseSongSheet("go[  ]ing")).toEqual([[{ chord: null, text: "going" }]]);
  });

  test("閉じ忘れた角かっこは歌詞としてそのまま出す", () => {
    // 黙って捨てると書き間違いに気づけない
    expect(parseSongSheet("[C]oh [F go marching")).toEqual([
      [{ chord: "C", text: "oh [F go marching" }],
    ]);
  });

  test("コードが連続していても、それぞれ別の塊になる", () => {
    expect(parseSongSheet("[C][F]in")).toEqual([
      [
        { chord: "C", text: "" },
        { chord: "F", text: "in" },
      ],
    ]);
  });

  test("行末がコードだけでも塊として残す", () => {
    expect(parseSongSheet("in [C]")).toEqual([
      [
        { chord: null, text: "in " },
        { chord: "C", text: "" },
      ],
    ]);
  });

  test("行末の空白は落とすが、塊の途中の空白は残す", () => {
    expect(parseSongSheet("[C]oh  when   \n")).toEqual([[{ chord: "C", text: "oh  when" }]]);
  });

  test("日本語や絵文字を含む歌詞もそのまま通る", () => {
    expect(parseSongSheet("[C]あかとんぼ🎵の[F]うた")).toEqual([
      [
        { chord: "C", text: "あかとんぼ🎵の" },
        { chord: "F", text: "うた" },
      ],
    ]);
  });

  test("CRLF 改行でも行が分かれる", () => {
    expect(parseSongSheet("[C]one\r\n[F]two")).toHaveLength(2);
  });

  test("コードが1つも無い歌詞も読める", () => {
    expect(parseSongSheet("just words")).toEqual([[{ chord: null, text: "just words" }]]);
  });
});

describe("songSheetChords", () => {
  test("最初に出てきた順で、重複なく返す", () => {
    const lines = parseSongSheet("[C]a [F]b [C]c\n[G7]d [F]e");
    expect(songSheetChords(lines)).toEqual(["C", "F", "G7"]);
  });

  test("コードが無ければ空", () => {
    expect(songSheetChords(parseSongSheet("words only"))).toEqual([]);
  });
});
