import { describe, expect, test } from "vitest";
import { parseAbc } from "../../src/core/music/abc";
import {
  barChords,
  buildPerformance,
  sheetAlignmentErrors,
  withCountIn,
} from "../../src/instruments/ukulele/performance";
import { parseSongSheet } from "../../src/instruments/ukulele/songSheet";

const tune = (body: string) => parseAbc(`M:4/4\nL:1/16\nK:C\n${body}`);
const strokesOf = (body: string, strum: "down" | "d-du-udu") =>
  buildPerformance(tune(body), strum)
    .steps.map((step, index) => (step.stroke ? `${index}${step.stroke}` : null))
    .filter(Boolean);

describe("buildPerformance: ストローク", () => {
  test("ダウンだけは4分音符ごと", () => {
    expect(strokesOf('"C"C16', "down")).toEqual(["0D", "4D", "8D", "12D"]);
  });

  test("D-DU-UDU は2か所を空振りにする", () => {
    expect(strokesOf('"C"C16', "d-du-udu")).toEqual(["0D", "4D", "6U", "10U", "12D", "14U"]);
  });

  test("弱起の小節では鳴らさず、次の小節の頭からパターンを始める", () => {
    expect(strokesOf('"C"G4 | C16', "down")).toEqual(["4D", "8D", "12D", "16D"]);
  });

  test("2拍の小節ではパターンの前半だけを鳴らし、次の小節で頭に戻る", () => {
    expect(strokesOf('"C"C16 | [M:2/4] C8 | [M:4/4] C4', "d-du-udu")).toEqual([
      "0D", "4D", "6U", "10U", "12D", "14U", "16D", "20D", "22U", "24D",
    ]);
  });

  test("最初のコードより前は鳴らさない", () => {
    expect(strokesOf('z8 "C"C8', "down")).toEqual(["8D", "12D"]);
  });
});

describe("buildPerformance: メロディとコード", () => {
  test("歌い出す位置に音名と長さを置き、タイの続きでは鳴らし直さない", () => {
    const plan = buildPerformance(tune('"C"C8- C4 E4'), "down");
    expect(plan.steps[0].melody).toEqual({ note: "C4", steps: 12 });
    expect(plan.steps[8].melody).toBeNull();
    expect(plan.steps[12].melody).toEqual({ note: "E4", steps: 4 });
  });

  test("ステップごとに鳴っているコードの番号を持つ", () => {
    const plan = buildPerformance(tune('z4 "C"C4 "G7"D8'), "down");
    expect(plan.chordAt.slice(0, 16)).toEqual([
      -1, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
    ]);
  });
});

describe("withCountIn", () => {
  const counted = (body: string, strum: "down" | "d-du-udu" = "down") => {
    const parsed = tune(body);
    const plan = buildPerformance(parsed, strum);
    return { plan, counted: withCountIn(plan, parsed) };
  };
  const clicksOf = (steps: { click: string | null }[]) =>
    steps.map((step, index) => (step.click ? `${index}${step.click}` : null)).filter(Boolean);

  test("最初の小節が満ちていれば、1小節の合図の後に曲が始まる", () => {
    const { counted: result } = counted('"C"C16');
    expect(clicksOf(result.steps)).toEqual(["0accent", "4beat", "8beat", "12beat"]);
    expect(result.steps[16].stroke).toBe("D");
    expect(result.steps[16].melody).toEqual({ note: "C4", steps: 16 });
    expect(result.chordAt.slice(15, 17)).toEqual([-1, 0]);
  });

  test("1拍の弱起は、合図の4拍目で歌い出す", () => {
    const { counted: result } = counted('"C"G4 | C16');
    expect(clicksOf(result.steps)).toEqual(["0accent", "4beat", "8beat", "12beat"]);
    expect(result.steps[12].melody).toEqual({ note: "G4", steps: 4 });
    // 弱起の小節はストロークを鳴らさず、1小節目の頭から鳴らす
    expect(result.steps.findIndex((step) => step.stroke)).toBe(16);
  });

  test("拍に乗らない弱起でも、合図は仮の1小節の拍に鳴る", () => {
    const { counted: result } = counted('"C"G2 | C16');
    expect(clicksOf(result.steps)).toEqual(["0accent", "4beat", "8beat", "12beat"]);
    expect(result.steps[14].melody).toEqual({ note: "G4", steps: 2 });
    expect(result.steps.findIndex((step) => step.stroke)).toBe(16);
  });

  test("元の表は変えない", () => {
    const { plan } = counted('"C"G4 | C16');
    expect(plan.steps.every((step) => step.click === null)).toBe(true);
    expect(plan.steps).toHaveLength(20);
  });
});

describe("barChords", () => {
  test("小節の頭で鳴り続けているコードと、小節の中で替わるコードを並べる", () => {
    expect(barChords(tune('"C"C8 "F"C8 | C16 | "G7"C4 "C"C12'))).toEqual([
      ["C", "F"],
      ["F"],
      ["G7", "C"],
    ]);
  });
});

describe("sheetAlignmentErrors", () => {
  const check = (abc: string, sheet: string) =>
    sheetAlignmentErrors(tune(abc), parseSongSheet(sheet));

  test("一致すれば空", () => {
    expect(check('"C"C8 "F"D8 |\nw: Oh saints', "[C]Oh [F]saints")).toEqual([]);
  });

  test("歌詞が違えば、その場所を示す", () => {
    expect(check('"C"C8 D8 |\nw: Oh how', "[C]Oh Lord")[0]).toMatch(/歌詞が違います.*Lord/);
  });

  test("ʻ の有無も違いとして扱う", () => {
    expect(check('"C"C16 |\nw: oe', "[C]ʻoe")).not.toEqual([]);
  });

  test("コードの並びが違えばエラー", () => {
    expect(check('"C"C8 "G7"D8 |\nw: Oh saints', "[C]Oh [F]saints")[0]).toMatch(/並び/);
  });

  test("歌い出しと同時に替わるなら、その音節の前にだけ置ける", () => {
    expect(check('"C"C8 "F"D4 E4 |\nw: Oh sa-ints', "[C]Oh sa[F]ints")[0]).toMatch(/F/);
  });

  test("伸ばしている途中で替わるなら、その音節か次の音節の前", () => {
    const abc = '"C"C8- "F"C4 D4 |\nw: nei _ Hoo';
    expect(check(abc, "[C]nei [F]Hoo")).toEqual([]);
    expect(check(abc, "[C][F]nei Hoo")).toEqual([]);
  });

  test("休符の途中で替わるなら、次の音節の前だけ", () => {
    expect(check('"C"z4 C4 "F"z4 D4 |\nw: Oh saints', "[C]Oh [F]saints")).toEqual([]);
    expect(check('"C"z4 C4 "F"z4 D4 |\nw: Oh saints', "[C][F]Oh saints")[0]).toMatch(/F/);
  });

  test("曲頭の休符に置いたコードは、最初の音節の前", () => {
    expect(check('"C"z4 C12 |\nw: Oh', "[C]Oh")).toEqual([]);
  });
});
