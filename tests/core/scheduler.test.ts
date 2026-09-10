import { describe, expect, test } from "vitest";
import {
  MAX_BPM,
  MIN_BPM,
  bpmToInterval,
  clampBpm,
  planBeats,
} from "../../src/core/audio/output/scheduler";

const steady = (seconds: number) => () => seconds;

describe("clampBpm", () => {
  test("範囲内はそのまま", () => {
    expect(clampBpm(60)).toBe(60);
  });

  test("範囲外は端に丸める", () => {
    expect(clampBpm(10)).toBe(MIN_BPM);
    expect(clampBpm(400)).toBe(MAX_BPM);
  });

  test("小数は整数へ", () => {
    expect(clampBpm(72.4)).toBe(72);
  });

  test("数でない値は下限にする", () => {
    expect(clampBpm(Number.NaN)).toBe(MIN_BPM);
  });
});

describe("bpmToInterval", () => {
  test("60 BPM は1拍1秒", () => {
    expect(bpmToInterval(60)).toBe(1);
  });

  test("120 BPM は1拍0.5秒", () => {
    expect(bpmToInterval(120)).toBe(0.5);
  });

  test("範囲外でも 0 や無限にならない", () => {
    expect(bpmToInterval(0)).toBeCloseTo(60 / MIN_BPM);
    expect(bpmToInterval(Number.POSITIVE_INFINITY)).toBeCloseTo(60 / MAX_BPM);
  });
});

describe("planBeats", () => {
  test("先読み窓に入る拍だけを返す", () => {
    const { beats } = planBeats({ index: 0, time: 0 }, 2.5, steady(1));
    expect(beats).toEqual([
      { index: 0, time: 0 },
      { index: 1, time: 1 },
      { index: 2, time: 2 },
    ]);
  });

  test("次に鳴らす拍をカーソルとして返す", () => {
    const { cursor } = planBeats({ index: 0, time: 0 }, 2.5, steady(1));
    expect(cursor).toEqual({ index: 3, time: 3 });
  });

  test("窓に入る拍が無ければカーソルは動かない", () => {
    const start = { index: 7, time: 10 };
    const { beats, cursor } = planBeats(start, 9, steady(1));
    expect(beats).toEqual([]);
    expect(cursor).toEqual(start);
  });

  test("続けて呼ぶと拍が途切れずに並ぶ", () => {
    const first = planBeats({ index: 0, time: 0 }, 1.5, steady(0.5));
    const second = planBeats(first.cursor, 3, steady(0.5));
    const times = [...first.beats, ...second.beats].map((beat) => beat.time);
    expect(times).toEqual([0, 0.5, 1, 1.5, 2, 2.5]);
  });

  test("途中でテンポが変わっても、変わった先から新しい間隔になる", () => {
    // 2拍目以降を倍速にする
    const { beats } = planBeats({ index: 0, time: 0 }, 3, (index) => (index < 2 ? 1 : 0.5));
    expect(beats.map((beat) => beat.time)).toEqual([0, 1, 2, 2.5]);
  });

  test("間隔が 0 でも無限ループしない", () => {
    const { beats } = planBeats({ index: 0, time: 0 }, 1, steady(0));
    expect(beats.length).toBeLessThan(128);
    expect(beats.length).toBeGreaterThan(0);
  });

  test("間隔が負や数でない値でも進む", () => {
    expect(planBeats({ index: 0, time: 0 }, 1, steady(-5)).cursor.time).toBeGreaterThan(0);
    expect(planBeats({ index: 0, time: 0 }, 1, steady(Number.NaN)).cursor.time).toBeGreaterThan(0);
  });

  test("maxBeats で打ち切る", () => {
    const { beats } = planBeats({ index: 0, time: 0 }, 1000, steady(1), 5);
    expect(beats).toHaveLength(5);
  });
});
