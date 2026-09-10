import { describe, expect, test } from "vitest";
import { UKULELE_CHORDS } from "../../src/instruments/ukulele/chords";
import { UKULELE_CURRICULUM } from "../../src/instruments/ukulele/curriculum";

const { lessons, stages } = UKULELE_CURRICULUM;

describe("カリキュラムの整合性", () => {
  test("レッスンは15本ある", () => {
    expect(lessons).toHaveLength(15);
  });

  test("レッスンIDが重複しない", () => {
    const ids = lessons.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("レッスン番号が1から通し番号になっている", () => {
    expect(lessons.map((lesson) => lesson.number)).toEqual(
      Array.from({ length: lessons.length }, (_, i) => i + 1),
    );
  });

  test("練習日が途切れず連続する", () => {
    let expectedStart = 1;
    for (const lesson of lessons) {
      expect(lesson.days[0], `${lesson.id} の開始日`).toBe(expectedStart);
      expect(lesson.days[1]).toBeGreaterThanOrEqual(lesson.days[0]);
      expectedStart = lesson.days[1] + 1;
    }
  });

  test("すべてのレッスンが定義済みのステージに属する", () => {
    const stageNumbers = new Set(stages.map((stage) => stage.number));
    for (const lesson of lessons) {
      expect(stageNumbers.has(lesson.stage), `${lesson.id} のステージ`).toBe(true);
    }
  });

  test("導入するコードがすべて定義済みである", () => {
    for (const lesson of lessons) {
      for (const chord of lesson.newChords) {
        expect(UKULELE_CHORDS[chord], `${lesson.id} の ${chord}`).toBeDefined();
      }
    }
  });

  test("同じコードを二度導入しない", () => {
    const introduced = lessons.flatMap((lesson) => lesson.newChords);
    expect(new Set(introduced).size).toBe(introduced.length);
  });

  test("課題曲は、その時点までに導入済みのコードだけを使う", () => {
    const learned = new Set<string>();
    for (const lesson of lessons) {
      for (const chord of lesson.newChords) learned.add(chord);
      if (!lesson.song) continue;
      for (const chord of lesson.song.chords) {
        expect(
          learned.has(chord),
          `${lesson.song.title}（${lesson.id}）で使う ${chord} がまだ導入されていない`,
        ).toBe(true);
      }
    }
  });

  test("Coming Soon のステージにはレッスンを置かない", () => {
    const comingSoon = stages.filter((stage) => stage.comingSoon).map((stage) => stage.number);
    for (const lesson of lessons) {
      expect(comingSoon).not.toContain(lesson.stage);
    }
  });
});
