import { describe, expect, test } from "vitest";
// Vite の ?raw で読む。node:fs を使うと @types/node が必要になる
import licensingDoc from "../../docs/songs-licensing.md?raw";
import { noteToMidi } from "../../src/core/audio/pitch";
import { clampBpm } from "../../src/core/audio/output/scheduler";
import { parseAbc } from "../../src/core/music/abc";
import { barChords, sheetAlignmentErrors } from "../../src/instruments/ukulele/performance";
import { UKULELE_CHORDS } from "../../src/instruments/ukulele/chords";
import { UKULELE_CURRICULUM } from "../../src/instruments/ukulele/curriculum";
import { parseSongSheet, songSheetChords } from "../../src/instruments/ukulele/songSheet";
import { UKULELE_SONGS, findSong } from "../../src/instruments/ukulele/songs";
import type { Song } from "../../src/instruments/ukulele/songs";

/*
 * 掲載できるのは日本と米国の両方で保護期間が満了した曲だけ（DDR 004）。
 * 検証記録が欠けた曲を公開面へ出さないため、ここで落とす。
 *
 * このテストが見られるのは記録の「存在」と「形」だけで、没年や出版年の
 * 「正しさ」は見られない。正しさは docs/songs-licensing.md の手順で担保する。
 */
const JP_DEATH_LIMIT = 1967;
const US_PUBLICATION_LIMIT = 1929;
/** 明らかな打ち間違い（195 や 19 など）を通さないための下限。 */
const EARLIEST_PLAUSIBLE_YEAR = 1700;

const each = (fn: (song: Song) => void) => {
  for (const song of UKULELE_SONGS) fn(song);
};

describe("掲載曲の権利", () => {
  test("曲がある", () => {
    expect(UKULELE_SONGS.length).toBeGreaterThan(0);
  });

  test("作者が1人以上いる", () => {
    each((song) => {
      expect(song.licensing.authors.length, song.id).toBeGreaterThan(0);
    });
  });

  test("作者全員の没年が1967年以下、または伝承曲", () => {
    each((song) => {
      for (const author of song.licensing.authors) {
        if (author.died === "traditional") continue;
        expect(author.died, `${song.id} / ${author.name}`).toBeLessThanOrEqual(JP_DEATH_LIMIT);
      }
    });
  });

  test("没年が年として妥当な範囲にある", () => {
    each((song) => {
      for (const author of song.licensing.authors) {
        if (author.died === "traditional") continue;
        expect(author.died, `${song.id} / ${author.name}`).toBeGreaterThanOrEqual(
          EARLIEST_PLAUSIBLE_YEAR,
        );
      }
    });
  });

  test("出版年が1929年より前、または伝承曲", () => {
    each((song) => {
      const year = song.licensing.earliestPublication;
      if (year === "traditional") return;
      expect(year, song.id).toBeLessThan(US_PUBLICATION_LIMIT);
      expect(year, song.id).toBeGreaterThanOrEqual(EARLIEST_PLAUSIBLE_YEAR);
    });
  });

  test("出版年が特定できない曲には、米国側の根拠が書かれている", () => {
    each((song) => {
      if (song.licensing.earliestPublication !== "traditional") return;
      expect(song.licensing.usBasis?.trim(), song.id).toBeTruthy();
    });
  });

  test("出典が1件以上あり、すべて https", () => {
    each((song) => {
      expect(song.licensing.sources.length, song.id).toBeGreaterThan(0);
      for (const source of song.licensing.sources) {
        expect(source.startsWith("https://"), `${song.id} / ${source}`).toBe(true);
      }
    });
  });

  test("検証日が YYYY-MM-DD の形で、未来ではない", () => {
    const today = new Date();
    each((song) => {
      const value = song.licensing.verifiedOn;
      expect(value, song.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // 未来の日付は「検証した」と言えない
      expect(new Date(`${value}T00:00:00`).getTime(), song.id).toBeLessThanOrEqual(
        today.getTime(),
      );
    });
  });

  test("全曲が docs/songs-licensing.md に記録されている", () => {
    each((song) => {
      // 見出しの書式は「### <曲名>（id: <song-id>）」
      expect(licensingDoc, song.id).toContain(`id: ${song.id}`);
    });
  });

  test("疑義のある曲は、記録側にも「疑義と判断」の項がある", () => {
    each((song) => {
      if (!song.licensing.caveat) return;
      const start = licensingDoc.indexOf(`id: ${song.id}`);
      // 次の見出しまでがその曲の節
      const rest = licensingDoc.slice(start);
      const end = rest.indexOf("\n### ", 1);
      const section = end === -1 ? rest : rest.slice(0, end);
      expect(section, song.id).toContain("疑義と判断");
    });
  });
});

describe("掲載曲の整合", () => {
  test("id が重複していない", () => {
    const ids = UKULELE_SONGS.map((song) => song.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("findSong が id で引ける", () => {
    expect(findSong("saints")?.title).toBe("聖者の行進");
    expect(findSong("nope")).toBeUndefined();
  });

  test("使うコードがすべて定義済み", () => {
    each((song) => {
      for (const name of song.chords) {
        expect(UKULELE_CHORDS[name], `${song.id} / ${name}`).toBeDefined();
      }
    });
  });

  test("使うコードが名前順に並んでいる", () => {
    each((song) => {
      expect(song.chords, song.id).toEqual([...song.chords].sort());
    });
  });

  /*
   * 部分集合ではなく一致を要求する。chords に余分なコードが残っていると、
   * 「今の自分が弾ける曲」の絞り込みが実際より厳しくなる。
   */
  test("進行に出るコードの集合が chords と一致する", () => {
    each((song) => {
      if (!song.progression) return;
      expect([...new Set(song.progression)].sort(), song.id).toEqual([...song.chords].sort());
    });
  });

  test("歌詞コード譜に出るコードの集合が chords と一致する", () => {
    each((song) => {
      if (!song.sheet) return;
      const used = songSheetChords(parseSongSheet(song.sheet));
      expect([...new Set(used)].sort(), song.id).toEqual([...song.chords].sort());
    });
  });

  /*
   * curriculum.ts の Lesson.song と二重管理になっている。順序は比べない
   * （カリキュラム側は導入順、曲データ側は名前順）。
   */
  test("課題曲がカリキュラムの記述と一致する", () => {
    each((song) => {
      if (!song.lessonId) return;
      const lesson = UKULELE_CURRICULUM.lessons.find((item) => item.id === song.lessonId);
      expect(lesson, song.id).toBeDefined();
      expect(lesson?.song?.id, song.id).toBe(song.id);
      expect([...(lesson?.song?.chords ?? [])].sort(), song.id).toEqual([...song.chords].sort());
    });
  });

  test("カリキュラムの課題曲すべてに曲データがある", () => {
    for (const lesson of UKULELE_CURRICULUM.lessons) {
      if (!lesson.song) continue;
      expect(findSong(lesson.song.id), lesson.id).toBeDefined();
    }
  });
});

/*
 * 1923年版から読んだ小節ごとのコード（初心者向けに変えた後）。曲ファイルのコメントにある表と同じ。
 * 歌詞コード譜との突き合わせは譜面を基準にしているので、譜面と ABC を同時に間違えると通ってしまう。
 * それを別の基準で止める。弱起の短い小節は含めない。
 */
const BAR_CHORDS: Record<string, string> = {
  "aloha-oe": "C F / C / G7 / G7 / C F / C / F G7 / C / F / C / G7 / C / F / C / G7 / C",
  "kaimana-hila": "C C7 / F / F / D7 / D7 G7 / G7 / G7 C / C / D7 G7 / C",
  "kuu-pua-i-paoakalani":
    "C C7 / F D7 / G7 / C / C C7 / F / C G7 / C / G7 / C / D7 / G7 / C C7 / F D7 / G7 / C",
  "na-lei-o-hawaii": "C / G7 / D7 G7 / C / C A7 / D7 / G7 / C",
  palolo: "C / A7 / A7 / D7 / D7 / G7 / G7 / C",
};

/** オクターブの書き間違い（, や ' の付け忘れ）を拾う範囲。 */
const LOWEST = noteToMidi("G3");
const HIGHEST = noteToMidi("C6");

describe("お手本の再生", () => {
  const eachPlayable = (fn: (song: Song, tune: ReturnType<typeof parseAbc>) => void) => {
    for (const song of UKULELE_SONGS) {
      if (!song.performance) continue;
      fn(song, parseAbc(song.performance.abc));
    }
  };

  test("再生を持つ曲は歌詞コード譜も持つ", () => {
    each((song) => {
      if (!song.performance) return;
      expect(song.sheet, song.id).toBeDefined();
    });
  });

  test("歌詞・コードの並び・コードの位置が歌詞コード譜と一致する", () => {
    eachPlayable((song, tune) => {
      expect(sheetAlignmentErrors(tune, parseSongSheet(song.sheet ?? "")), song.id).toEqual([]);
    });
  });

  test("小節ごとのコードが、進行表または原譜の小節表と一致する", () => {
    eachPlayable((song, tune) => {
      const bars = barChords(tune).filter(
        (_, index) => !(index === 0 && tune.bars[0].length < tune.bars[0].capacity),
      );
      if (song.progression) {
        // 進行表は1小節1コード。小節の途中で替わっていないことも含めて確かめる
        expect(bars, song.id).toEqual(song.progression.map((name) => [name]));
        return;
      }
      const table = BAR_CHORDS[song.id];
      expect(table, `${song.id} の小節表がテストにありません`).toBeDefined();
      expect(bars.map((names) => names.join(" ")).join(" / "), song.id).toBe(table);
    });
  });

  test("使うコードの集合が chords と一致する", () => {
    eachPlayable((song, tune) => {
      expect([...new Set(tune.chords.map((chord) => chord.name))].sort(), song.id).toEqual(
        [...song.chords].sort(),
      );
    });
  });

  test("メロディの音域が G3〜C6 に収まる", () => {
    eachPlayable((song, tune) => {
      for (const note of tune.notes) {
        expect(note.midi, song.id).toBeGreaterThanOrEqual(LOWEST);
        expect(note.midi, song.id).toBeLessThanOrEqual(HIGHEST);
      }
    });
  });

  test("最初のテンポが選べる範囲にある", () => {
    eachPlayable((song) => {
      const bpm = song.performance?.bpm ?? 0;
      expect(clampBpm(bpm), song.id).toBe(bpm);
    });
  });
});
