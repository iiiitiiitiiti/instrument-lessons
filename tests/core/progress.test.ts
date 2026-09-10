import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  currentStreak, loadProgress, markCompleted, saveProgress, todayString, unmarkCompleted,
} from "../../src/core/progress/store";

const EMPTY = {};

describe("markCompleted / unmarkCompleted", () => {
  test("完了を記録し、練習日を残す", () => {
    const next = markCompleted(EMPTY, "ukulele", "uk-01", "2026-09-10");
    expect(next.ukulele.completedLessonIds).toEqual(["uk-01"]);
    expect(next.ukulele.practiceDates).toEqual(["2026-09-10"]);
    expect(next.ukulele.lastLessonId).toBe("uk-01");
  });

  test("同じレッスンを二重に記録しない", () => {
    let state = markCompleted(EMPTY, "ukulele", "uk-01", "2026-09-10");
    state = markCompleted(state, "ukulele", "uk-01", "2026-09-11");
    expect(state.ukulele.completedLessonIds).toEqual(["uk-01"]);
  });

  test("同じ日の練習日を二重に記録しない", () => {
    let state = markCompleted(EMPTY, "ukulele", "uk-01", "2026-09-10");
    state = markCompleted(state, "ukulele", "uk-02", "2026-09-10");
    expect(state.ukulele.practiceDates).toEqual(["2026-09-10"]);
  });

  test("楽器ごとに独立している", () => {
    let state = markCompleted(EMPTY, "ukulele", "uk-01", "2026-09-10");
    state = markCompleted(state, "otamatone", "ot-01", "2026-09-10");
    expect(state.ukulele.completedLessonIds).toEqual(["uk-01"]);
    expect(state.otamatone.completedLessonIds).toEqual(["ot-01"]);
  });

  test("完了を取り消しても練習日は消えない", () => {
    let state = markCompleted(EMPTY, "ukulele", "uk-01", "2026-09-10");
    state = unmarkCompleted(state, "ukulele", "uk-01");
    expect(state.ukulele.completedLessonIds).toEqual([]);
    expect(state.ukulele.practiceDates).toEqual(["2026-09-10"]);
  });

  test("元の状態を書き換えない", () => {
    const before = markCompleted(EMPTY, "ukulele", "uk-01", "2026-09-10");
    markCompleted(before, "ukulele", "uk-02", "2026-09-11");
    expect(before.ukulele.completedLessonIds).toEqual(["uk-01"]);
  });
});

describe("currentStreak", () => {
  test("練習していなければ0", () => {
    expect(currentStreak([], "2026-09-10")).toBe(0);
  });

  test("今日だけなら1", () => {
    expect(currentStreak(["2026-09-10"], "2026-09-10")).toBe(1);
  });

  test("連続した3日を数える", () => {
    expect(currentStreak(["2026-09-08", "2026-09-09", "2026-09-10"], "2026-09-10")).toBe(3);
  });

  test("今日まだ練習していなくても、昨日までの連続は保つ", () => {
    expect(currentStreak(["2026-09-08", "2026-09-09"], "2026-09-10")).toBe(2);
  });

  test("2日以上空いたら途切れる", () => {
    expect(currentStreak(["2026-09-01", "2026-09-02"], "2026-09-10")).toBe(0);
  });

  test("月をまたいで数える", () => {
    expect(currentStreak(["2026-08-30", "2026-08-31", "2026-09-01"], "2026-09-01")).toBe(3);
  });

  test("うるう年の2月末をまたいで数える", () => {
    expect(currentStreak(["2028-02-28", "2028-02-29", "2028-03-01"], "2028-03-01")).toBe(3);
  });

  test("順不同でも重複があっても数えられる", () => {
    expect(currentStreak(["2026-09-10", "2026-09-08", "2026-09-09", "2026-09-09"], "2026-09-10")).toBe(3);
  });
});

describe("todayString", () => {
  test("ローカル日付を YYYY-MM-DD で返す", () => {
    expect(todayString(new Date(2026, 8, 10, 23, 30))).toBe("2026-09-10");
  });

  test("UTC ではなくローカルの日付で判定する", () => {
    expect(todayString(new Date(2026, 0, 1, 0, 30))).toBe("2026-01-01");
  });
});

describe("loadProgress / saveProgress", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("保存した内容を読み出せる", () => {
    const state = markCompleted(EMPTY, "ukulele", "uk-01", "2026-09-10");
    saveProgress(state);
    expect(loadProgress()).toEqual(state);
  });

  test("保存がなければ空を返す", () => {
    expect(loadProgress()).toEqual({});
  });

  test("壊れた内容が入っていても空を返す", () => {
    localStorage.setItem("instrument-lessons:progress:v1", "{壊れている");
    expect(loadProgress()).toEqual({});
  });

  test("localStorage が使えなくても例外を投げない", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(loadProgress()).toEqual({});
    expect(() => saveProgress({})).not.toThrow();
  });
});
