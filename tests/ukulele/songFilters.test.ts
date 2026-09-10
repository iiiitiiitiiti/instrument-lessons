import { describe, expect, test } from "vitest";
import {
  chordCountBucket,
  isPlayable,
  usesBarre,
} from "../../src/instruments/ukulele/songs/filters";
import { UKULELE_SONGS, findSong } from "../../src/instruments/ukulele/songs";
import type { Song } from "../../src/instruments/ukulele/songs";

const song = (chords: string[]): Song => ({
  id: "test",
  title: "test",
  chords,
  licensing: {
    authors: [{ name: "x", role: "both", died: "traditional" }],
    earliestPublication: "traditional",
    usBasis: "test",
    verifiedOn: "2026-01-01",
    sources: ["https://example.com"],
  },
});

describe("isPlayable", () => {
  test("必要なコードがすべて習得済みなら弾ける", () => {
    expect(isPlayable(song(["C", "F"]), ["C", "F", "G7"])).toBe(true);
  });

  test("1つでも欠けていれば弾けない", () => {
    expect(isPlayable(song(["C", "F", "G7"]), ["C", "F"])).toBe(false);
  });

  test("習得済みが空なら弾けない", () => {
    expect(isPlayable(song(["C"]), [])).toBe(false);
  });

  test("聖者の行進は C・F・G7 を覚えた時点で弾ける", () => {
    const saints = findSong("saints")!;
    expect(isPlayable(saints, ["C", "F", "G7"])).toBe(true);
    expect(isPlayable(saints, ["C", "F"])).toBe(false);
  });
});

describe("usesBarre", () => {
  test("セーハを含むコードがあれば true", () => {
    // Bb は1フレットを1本の指で2弦分押さえる
    expect(usesBarre(song(["Bb", "C"]))).toBe(true);
  });

  test("含まなければ false", () => {
    expect(usesBarre(song(["C", "F", "G7"]))).toBe(false);
  });

  test("掲載中の曲はどれもセーハを含まない", () => {
    for (const item of UKULELE_SONGS) {
      expect(usesBarre(item), item.id).toBe(false);
    }
  });
});

describe("chordCountBucket", () => {
  test("3コード以下は 3", () => {
    expect(chordCountBucket(song(["C", "F", "G7"]))).toBe("3");
    expect(chordCountBucket(song(["C"]))).toBe("3");
  });

  test("4コードは 4", () => {
    expect(chordCountBucket(song(["C", "C7", "F", "G7"]))).toBe("4");
  });

  test("5コード以上は 5+", () => {
    expect(chordCountBucket(song(["C", "C7", "D7", "F", "G7"]))).toBe("5+");
  });
});
