import { describe, expect, test } from "vitest";
import { getLessonComponent, listLessonNumbers } from "../../src/core/lesson/lessonModules";
import { UKULELE_CURRICULUM } from "../../src/instruments/ukulele/curriculum";

describe("レッスン本文", () => {
  test("Lesson 01 と 02 の本文が読み込める", () => {
    expect(getLessonComponent("ukulele", 1)).toBeDefined();
    expect(getLessonComponent("ukulele", 2)).toBeDefined();
  });

  test("存在しないレッスン番号は undefined を返す", () => {
    expect(getLessonComponent("ukulele", 99)).toBeUndefined();
  });

  test("存在しない楽器は undefined を返す", () => {
    expect(getLessonComponent("trumpet", 1)).toBeUndefined();
  });

  test("カリキュラムに無い本文ファイルが混ざっていない", () => {
    const known = new Set(UKULELE_CURRICULUM.lessons.map((lesson) => lesson.number));
    for (const number of listLessonNumbers("ukulele")) {
      expect(known.has(number), `lesson-${String(number).padStart(2, "0")}.mdx に対応するレッスンが無い`).toBe(true);
    }
  });
});
