import { describe, expect, test } from "vitest";
import { midiToFrequency, midiToNote, noteToFrequency, noteToMidi, transpose } from "../../src/core/audio/pitch";

describe("noteToMidi", () => {
  test("A4 は 69", () => {
    expect(noteToMidi("A4")).toBe(69);
  });

  test("C4 は 60", () => {
    expect(noteToMidi("C4")).toBe(60);
  });

  test("シャープとフラットを解釈する", () => {
    expect(noteToMidi("A#4")).toBe(70);
    expect(noteToMidi("Bb4")).toBe(70);
  });

  test("オクターブの境界をまたぐ", () => {
    expect(noteToMidi("B3")).toBe(59);
    expect(noteToMidi("C4")).toBe(60);
  });

  test("不正な音名は例外を投げる", () => {
    expect(() => noteToMidi("H4")).toThrow();
    expect(() => noteToMidi("A")).toThrow();
  });
});

describe("midiToFrequency", () => {
  test("A4 は 440 Hz", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 6);
  });

  test("1オクターブ上は2倍", () => {
    expect(midiToFrequency(81)).toBeCloseTo(880, 6);
  });
});

describe("noteToFrequency", () => {
  test("ウクレレ GCEA の4弦分が実測値と一致する", () => {
    expect(noteToFrequency("G4")).toBeCloseTo(392.0, 1);
    expect(noteToFrequency("C4")).toBeCloseTo(261.63, 2);
    expect(noteToFrequency("E4")).toBeCloseTo(329.63, 2);
    expect(noteToFrequency("A4")).toBeCloseTo(440.0, 2);
  });
});

describe("midiToNote", () => {
  test("往復して元に戻る", () => {
    for (const note of ["C4", "E4", "G4", "A4", "C5", "F#3"]) {
      expect(midiToNote(noteToMidi(note))).toBe(note);
    }
  });
});

describe("transpose", () => {
  test("半音上げ下げできる", () => {
    expect(transpose("C4", 2)).toBe("D4");
    expect(transpose("C4", -1)).toBe("B3");
    expect(transpose("G4", 5)).toBe("C5");
  });
});
