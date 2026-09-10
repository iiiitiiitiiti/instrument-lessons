import { describe, expect, test } from "vitest";
import { effectivePluckFrequency, renderPluck } from "../../src/core/audio/output/pluck";

const SAMPLE_RATE = 44100;

/** 自動相関で基本周波数を推定する。 */
function estimateFrequency(buffer: Float32Array, sampleRate: number): number {
  const from = Math.floor(buffer.length * 0.1);
  const window = buffer.subarray(from, from + 4096);
  const minLag = Math.floor(sampleRate / 1200);
  const maxLag = Math.floor(sampleRate / 80);
  let bestLag = minLag;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let score = 0;
    for (let i = 0; i + lag < window.length; i++) score += window[i] * window[i + lag];
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  return sampleRate / bestLag;
}

describe("renderPluck", () => {
  test("指定した長さのバッファを返す", () => {
    const buffer = renderPluck(SAMPLE_RATE, 440, 0.5);
    expect(buffer.length).toBe(Math.floor(SAMPLE_RATE * 0.5));
  });

  test("申告した実効周波数どおりの波形になる", () => {
    for (const frequency of [261.63, 329.63, 392.0, 440.0]) {
      const effective = effectivePluckFrequency(SAMPLE_RATE, frequency);
      const buffer = renderPluck(SAMPLE_RATE, frequency, 1.0);
      const estimated = estimateFrequency(buffer, SAMPLE_RATE);
      expect(Math.abs(estimated - effective) / effective).toBeLessThan(0.02);
    }
  });

  test("時間とともに減衰する", () => {
    const buffer = renderPluck(SAMPLE_RATE, 440, 2.0);
    const peak = (from: number, to: number) => {
      let max = 0;
      for (let i = from; i < to; i++) max = Math.max(max, Math.abs(buffer[i]));
      return max;
    };
    const early = peak(SAMPLE_RATE * 0.1, SAMPLE_RATE * 0.2);
    const late = peak(SAMPLE_RATE * 1.5, SAMPLE_RATE * 1.6);
    expect(late).toBeLessThan(early * 0.5);
  });

  test("音割れしない", () => {
    const buffer = renderPluck(SAMPLE_RATE, 261.63, 1.0);
    for (const sample of buffer) expect(Math.abs(sample)).toBeLessThanOrEqual(1);
  });

  test("seed が同じなら同じ波形になる", () => {
    const a = renderPluck(SAMPLE_RATE, 440, 0.2, { seed: 7 });
    const b = renderPluck(SAMPLE_RATE, 440, 0.2, { seed: 7 });
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  test("先頭と末尾が無音から始まり無音で終わる", () => {
    const buffer = renderPluck(SAMPLE_RATE, 440, 0.5);
    expect(Math.abs(buffer[0])).toBeLessThan(0.05);
    expect(Math.abs(buffer[buffer.length - 1])).toBeLessThan(0.05);
  });

  test("damping に1以上を渡しても発散せず音割れしない", () => {
    const buffer = renderPluck(SAMPLE_RATE, 440, 1.0, { damping: 1.5 });
    for (const sample of buffer) expect(Math.abs(sample)).toBeLessThanOrEqual(1);
  });
});

describe("effectivePluckFrequency", () => {
  test("補正前のずれが30セント以内に収まる", () => {
    for (const frequency of [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 523.25]) {
      const cents = 1200 * Math.log2(effectivePluckFrequency(SAMPLE_RATE, frequency) / frequency);
      expect(Math.abs(cents), `${frequency} Hz のずれ`).toBeLessThan(30);
    }
  });

  test("再生速度の補正値が音色を損なわない範囲に収まる", () => {
    for (const frequency of [261.63, 329.63, 392.0, 440.0]) {
      const rate = frequency / effectivePluckFrequency(SAMPLE_RATE, frequency);
      expect(rate).toBeGreaterThan(0.97);
      expect(rate).toBeLessThan(1.03);
    }
  });
});
