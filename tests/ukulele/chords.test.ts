import { describe, expect, test } from "vitest";
import { UKULELE_TUNING } from "../../src/instruments/ukulele/tuning";
import { UKULELE_CHORDS, describeChord, chordNotes } from "../../src/instruments/ukulele/chords";

describe("UKULELE_TUNING", () => {
  test("4弦から1弦の順に GCEA が並ぶ", () => {
    expect(UKULELE_TUNING.strings.map((s) => s.note)).toEqual(["G4", "C4", "E4", "A4"]);
  });

  test("4弦が3弦より高い（re-entrant tuning）", () => {
    const [fourth, third] = UKULELE_TUNING.strings;
    expect(fourth.note).toBe("G4");
    expect(third.note).toBe("C4");
  });
});

describe("UKULELE_CHORDS", () => {
  test("カリキュラムで使うコードがすべて定義されている", () => {
    for (const name of ["C", "F", "G7", "C7", "D7", "Am", "Em", "Dm", "A7"]) {
      expect(UKULELE_CHORDS[name], `${name} が未定義`).toBeDefined();
    }
  });

  test("すべてのコードが弦の数と同じ数の押さえ方を持つ", () => {
    for (const [name, chord] of Object.entries(UKULELE_CHORDS)) {
      expect(chord.frets, `${name} の frets`).toHaveLength(UKULELE_TUNING.strings.length);
      expect(chord.fingers, `${name} の fingers`).toHaveLength(UKULELE_TUNING.strings.length);
    }
  });

  test("フレット番号が範囲内に収まる", () => {
    for (const [name, chord] of Object.entries(UKULELE_CHORDS)) {
      for (const fret of chord.frets) {
        if (fret === "x") continue;
        expect(fret, `${name} のフレット`).toBeGreaterThanOrEqual(0);
        expect(fret, `${name} のフレット`).toBeLessThanOrEqual(12);
      }
    }
  });

  test("押さえる弦にだけ指番号があり、開放弦にはない", () => {
    for (const [name, chord] of Object.entries(UKULELE_CHORDS)) {
      chord.frets.forEach((fret, index) => {
        const finger = chord.fingers[index];
        if (typeof fret === "number" && fret > 0) {
          expect(finger, `${name} の ${index} 番目に指番号がない`).not.toBeNull();
          expect(finger!).toBeGreaterThanOrEqual(1);
          expect(finger!).toBeLessThanOrEqual(4);
        } else {
          expect(finger, `${name} の ${index} 番目に余計な指番号`).toBeNull();
        }
      });
    }
  });

  test("name がキーと一致する", () => {
    for (const [key, chord] of Object.entries(UKULELE_CHORDS)) {
      expect(chord.name).toBe(key);
    }
  });
});

describe("chordNotes", () => {
  test("C コードは開放の G C E と3フレットの C を鳴らす", () => {
    expect(chordNotes(UKULELE_CHORDS.C)).toEqual(["G4", "C4", "E4", "C5"]);
  });

  test("F コードの構成音を返す", () => {
    expect(chordNotes(UKULELE_CHORDS.F)).toEqual(["A4", "C4", "F4", "A4"]);
  });
});

describe("describeChord", () => {
  test("1本指のコードは押さえる弦と開放弦を並べる", () => {
    expect(describeChord(UKULELE_CHORDS.C)).toBe(
      "1弦の3フレットを薬指で押さえる。4弦・3弦・2弦は開放のまま鳴らす。",
    );
  });

  test("複数の指を押さえる順に並べる", () => {
    expect(describeChord(UKULELE_CHORDS.G7)).toBe(
      "3弦の2フレットを中指、2弦の1フレットを人差し指、1弦の2フレットを薬指で押さえる。4弦は開放のまま鳴らす。",
    );
  });

  test("セーハは1本の指でまとめて押さえると書く", () => {
    const text = describeChord(UKULELE_CHORDS.Bb);
    expect(text).toContain("2弦から1弦までの1フレットを人差し指1本でまとめて押さえ（セーハ）");
    expect(text).toContain("4弦の3フレットを薬指");
    // セーハの弦を、個別に押さえる弦として二重に数えない
    expect(text).not.toContain("2弦の1フレットを");
  });

  test("すべてのコードで説明が作れる", () => {
    for (const [name, chord] of Object.entries(UKULELE_CHORDS)) {
      expect(describeChord(chord).length, `${name} の説明`).toBeGreaterThan(15);
    }
  });
});
