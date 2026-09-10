import { describe, expect, test } from "vitest";
import { learnedChords } from "../../src/core/progress/learnedChords";
import { UKULELE_CURRICULUM } from "../../src/instruments/ukulele/curriculum";
import type { Curriculum } from "../../src/core/lesson/types";

describe("learnedChords", () => {
  test("完了が無ければ空", () => {
    expect(learnedChords(UKULELE_CURRICULUM, [])).toEqual([]);
  });

  test("完了したレッスンで導入されたコードを返す", () => {
    expect(learnedChords(UKULELE_CURRICULUM, ["uk-05", "uk-06"])).toEqual(["C", "F"]);
  });

  test("カリキュラムの順で返す（完了した順ではない）", () => {
    expect(learnedChords(UKULELE_CURRICULUM, ["uk-07", "uk-05"])).toEqual(["C", "G7"]);
  });

  test("コードを導入しないレッスンは何も足さない", () => {
    expect(learnedChords(UKULELE_CURRICULUM, ["uk-01", "uk-08"])).toEqual([]);
  });

  test("全レッスン完了で10コードのうち導入分がすべて出る", () => {
    const all = UKULELE_CURRICULUM.lessons.map((lesson) => lesson.id);
    expect(learnedChords(UKULELE_CURRICULUM, all)).toEqual([
      "C", "F", "G7", "C7", "D7", "Am", "Em", "Dm", "A7",
    ]);
  });

  test("知らないレッスン ID は無視する", () => {
    expect(learnedChords(UKULELE_CURRICULUM, ["uk-05", "nope"])).toEqual(["C"]);
  });

  test("同じコードを2度導入しても重複しない", () => {
    const curriculum: Curriculum = {
      stages: [],
      lessons: [
        { id: "a", number: 1, title: "a", stage: 0, days: [1, 1], newChords: ["C"], goal: "" },
        { id: "b", number: 2, title: "b", stage: 0, days: [2, 2], newChords: ["C", "F"], goal: "" },
      ],
    };
    expect(learnedChords(curriculum, ["a", "b"])).toEqual(["C", "F"]);
  });
});
