import { midiToNote } from "../../core/audio/pitch";
import type { Tune } from "../../core/music/abc";
import type { SongLine } from "./songSheet";

/*
 * 楽譜ライブラリの「お手本の再生」で、曲データ（ABC）から「いつ何を鳴らすか」を組み立てる。
 * 再生はスケジューラが16分音符ごとに表を引くだけにして、ここは音を出さない純粋な計算に閉じる。
 */

export type StrumStyle = "down" | "d-du-udu";
export type Stroke = "D" | "U";
export type Click = "accent" | "beat";

/** 16分音符1つ分で鳴らすもの。 */
export type PerformanceStep = {
  stroke: Stroke | null;
  /** ここで歌い出す音。タイでつながる分まで含めた長さを持つ。 */
  melody: { note: string; steps: number } | null;
  /** カウントインの拍の合図。 */
  click: Click | null;
};

export type PerformancePlan = {
  steps: PerformanceStep[];
  /** ステップごとに、鳴っているコードの番号（Tune.chords の添字）。最初のコードより前は -1。 */
  chordAt: number[];
};

/** 8分音符ごとの並び。null は空振り。 */
const PATTERNS: Record<StrumStyle, (Stroke | null)[]> = {
  down: ["D", null],
  "d-du-udu": ["D", null, "D", "U", null, "U", "D", "U"],
};

const STEPS_PER_EIGHTH = 2;
const STEPS_PER_BEAT = 4;

export function buildPerformance(tune: Tune, strum: StrumStyle): PerformancePlan {
  const steps: PerformanceStep[] = Array.from({ length: tune.length }, () => ({
    stroke: null,
    melody: null,
    click: null,
  }));

  const chordAt: number[] = new Array(tune.length).fill(-1);
  tune.chords.forEach((chord, index) => {
    const end = tune.chords[index + 1]?.start ?? tune.length;
    for (let step = chord.start; step < end; step++) chordAt[step] = index;
  });

  const pattern = PATTERNS[strum];
  tune.bars.forEach((bar, index) => {
    // 弱起の小節ではストロークを鳴らさない。途中から入るとパターンのどこから始めるかが決まらない
    if (index === 0 && bar.length < bar.capacity) return;
    for (let offset = 0; offset < bar.length; offset += STEPS_PER_EIGHTH) {
      const step = bar.start + offset;
      if (chordAt[step] === -1) continue;
      steps[step].stroke = pattern[(offset / STEPS_PER_EIGHTH) % pattern.length];
    }
  });

  tune.notes.forEach((note, index) => {
    if (note.tied) return;
    let length = note.length;
    for (let next = index + 1; tune.notes[next]?.tied; next++) length += tune.notes[next].length;
    steps[note.start].melody = { note: midiToNote(note.midi), steps: length };
  });

  return { steps, chordAt };
}

/**
 * 再生の前に1小節分の拍の合図（カウントイン）を足した表を返す。元の表は変えない。
 *
 * 合図は「最初の小節を満たした仮の1小節」の各拍で鳴らす。弱起の曲では前に足す長さが弱起の分だけ短くなり、
 * 歌い出しの拍にも合図が重なる。弱起の小節はストロークを鳴らさないので、メロディを消していても
 * 自分で弾き始める拍が分かる。
 */
export function withCountIn(plan: PerformancePlan, tune: Tune): PerformancePlan {
  const first = tune.bars[0];
  const lead = first.capacity - first.length || first.capacity;
  const steps: PerformanceStep[] = [
    ...Array.from({ length: lead }, () => ({ stroke: null, melody: null, click: null })),
    ...plan.steps.map((step) => ({ ...step })),
  ];
  for (let step = 0; step < first.capacity; step += STEPS_PER_BEAT) {
    steps[step].click = step === 0 ? "accent" : "beat";
  }
  return { steps, chordAt: [...new Array<number>(lead).fill(-1), ...plan.chordAt] };
}

/**
 * 小節ごとに、その小節で鳴るコードを順に返す。小節の頭で鳴り続けているコードも含める。
 *
 * テストで、曲データの小節表（Lesson 08 の進行表や、原譜から読んだ表）と突き合わせるために使う。
 */
export function barChords(tune: Tune): string[][] {
  return tune.bars.map((bar) => {
    const names: string[] = [];
    for (const chord of tune.chords) {
      if (chord.start >= bar.start + bar.length) break;
      if (chord.start <= bar.start) {
        names.length = 0;
        names.push(chord.name);
      } else if (names[names.length - 1] !== chord.name) {
        names.push(chord.name);
      }
    }
    return names;
  });
}

const normalize = (text: string) => text.normalize("NFC").replace(/\s+/g, "");

/**
 * 歌詞コード譜と ABC の食い違いを列挙する。空なら一致。
 *
 * 記法を変えずに拍を別データで持つと、両者がずれても画面では気づけない。
 * 次の3つを確かめる。
 *
 * 1. 歌詞の文字列が同じ（空白は無視、ʻ や長音符号は区別する）
 * 2. コードの並びが同じ
 * 3. k 番目のコードの文字位置が、そのコードが鳴り始める時刻の音節に合っている。
 *    その時刻に歌い出す音節があればそれだけを許す。伸ばしている途中ならその音節か次の音節、
 *    休符の途中なら次の音節を許す
 */
export function sheetAlignmentErrors(tune: Tune, lines: SongLine[]): string[] {
  const errors: string[] = [];

  const sheetChords: { name: string; offset: number }[] = [];
  let sheetText = "";
  for (const line of lines) {
    for (const segment of line) {
      if (segment.chord) sheetChords.push({ name: segment.chord, offset: sheetText.length });
      sheetText += normalize(segment.text);
    }
  }

  const syllableOffsets: number[] = [];
  let lyricText = "";
  for (const syllable of tune.syllables) {
    syllableOffsets.push(lyricText.length);
    lyricText += normalize(syllable);
  }

  if (lyricText !== sheetText) {
    let at = 0;
    while (at < lyricText.length && lyricText[at] === sheetText[at]) at++;
    errors.push(
      `歌詞が違います: 譜面「${sheetText.slice(at, at + 12)}」／ABC「${lyricText.slice(at, at + 12)}」（${at}文字目）`,
    );
    return errors;
  }

  const sheetNames = sheetChords.map((chord) => chord.name);
  const tuneNames = tune.chords.map((chord) => chord.name);
  if (sheetNames.join(" ") !== tuneNames.join(" ")) {
    errors.push(`コードの並びが違います: 譜面 ${sheetNames.join(" ")}／ABC ${tuneNames.join(" ")}`);
    return errors;
  }

  const offsetOf = (syllable: number) => syllableOffsets[syllable] ?? lyricText.length;

  tune.chords.forEach((chord, index) => {
    const onset = tune.syllableStarts.indexOf(chord.start);
    let allowed: number[];
    if (onset !== -1) {
      allowed = [offsetOf(onset)];
    } else {
      const sounding = tune.notes.find(
        (note) => note.start <= chord.start && chord.start < note.start + note.length,
      );
      if (sounding && sounding.syllable !== -1) {
        allowed = [offsetOf(sounding.syllable), offsetOf(sounding.syllable + 1)];
      } else {
        const next = tune.syllableStarts.findIndex((start) => start > chord.start);
        allowed = [next === -1 ? lyricText.length : offsetOf(next)];
      }
    }

    const actual = sheetChords[index].offset;
    if (!allowed.includes(actual)) {
      const expected = allowed.map((offset) => `「${lyricText.slice(offset, offset + 6)}」`).join("か");
      errors.push(
        `${index + 1}番目のコード ${chord.name}: 譜面は「${lyricText.slice(actual, actual + 6)}」の前、ABC では${expected}の前`,
      );
    }
  });

  return errors;
}
