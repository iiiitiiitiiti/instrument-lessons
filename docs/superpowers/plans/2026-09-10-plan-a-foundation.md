# instrument-lessons プランA（基盤）実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ウクレレ教材サイトの土台を作り、Lesson 01-02 が動く状態で GitHub Pages へ公開する。スマートフォンにインストールして、オフラインでも使える状態にする。

**Architecture:** Vite + React + TypeScript の SPA。レッスン本文は MDX で書き、React コンポーネントを本文中に埋め込む。楽器に依存しない基盤（音名・音の合成・レッスン基盤・進捗）を `src/core/` に、ウクレレ固有のもの（チューニング・コード・コード図）を `src/instruments/ukulele/` に置く。音は Karplus-Strong 法でブラウザ内合成し、音源ファイルを持たない。

**Tech Stack:** Vite 8 / React 19 / TypeScript / MDX 3 / react-router-dom 7 / Web Audio API / Vitest / vite-plugin-pwa

**Spec:** `docs/superpowers/specs/2026-09-10-instrument-lessons-design.md`

## Global Constraints

- リポジトリ名は `instrument-lessons`。Vite の `base` と React Router の `basename` は `/instrument-lessons/` で統一する
- Node は CI で 22 を使う
- 楽器の共通契約（`Instrument` 型）に弦・チューニング・コードを含めない。非弦楽器（オタマトーン）を後から追加できるようにするため
- ウクレレの前提は GCEA（High-G, re-entrant）。4弦 G4 / 3弦 C4 / 2弦 E4 / 1弦 A4
- 音高の基準は 12平均律、A4 = 440 Hz
- サイトの言語は日本語
- 外部の音源ファイル・音楽ライブラリを使わない
- テストは Vitest。UI は @testing-library/react + jsdom

---

## File Structure

| ファイル | 責務 |
|---|---|
| `package.json` / `vite.config.ts` / `tsconfig*.json` | ビルド設定 |
| `src/core/audio/pitch.ts` | 音名 ↔ MIDI ↔ 周波数の変換 |
| `src/core/audio/output/pluck.ts` | 撥弦音の波形生成（純関数） |
| `src/core/audio/output/context.ts` | AudioContext の遅延生成と使い回し |
| `src/core/audio/output/play.ts` | 生成した波形の再生 |
| `src/core/lesson/types.ts` | Instrument / Lesson / Curriculum の型 |
| `src/core/lesson/lessonModules.ts` | MDX 本文の読み込み |
| `src/core/widgets/TonePlayer.tsx` | 基準音を鳴らすボタン（楽器非依存） |
| `src/core/progress/store.ts` | 進捗の保存と読み出し、連続日数の計算 |
| `src/core/progress/useProgress.ts` | 進捗を React から使うフック |
| `src/instruments/ukulele/tuning.ts` | GCEA の弦定義 |
| `src/instruments/ukulele/chords.ts` | コードの押さえ方 |
| `src/instruments/ukulele/curriculum.ts` | レッスン一覧と課題曲のメタ情報 |
| `src/instruments/ukulele/widgets/ChordDiagram.tsx` | コード図の SVG |
| `src/instruments/ukulele/mdxComponents.tsx` | ウクレレの本文で使えるコンポーネント表 |
| `src/instruments/registry.ts` | 楽器の登録 |
| `src/routes.tsx` | ルーティング定義 |
| `src/pages/*.tsx` | トップ・コース概要・レッスンページ |
| `content/ukulele/lesson-01.mdx` 〜 | レッスン本文 |
| `.github/workflows/deploy.yml` | GitHub Pages へのデプロイ |
| `scripts/make-icons.mjs` / `public/icon*.png` | PWA のアイコン |

---

## Task 1: プロジェクトの初期化とビルドの疎通

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Test: `tests/smoke.test.tsx`

**Interfaces:**
- Consumes: なし
- Produces: `App` コンポーネント（`src/App.tsx` の default export）

- [ ] **Step 1: 依存をインストールする**

```bash
npm init -y
npm i react react-dom react-router-dom
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/node \
  vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom \
  @mdx-js/rollup @mdx-js/react @types/mdx remark-gfm
```

- [ ] **Step 2: `package.json` の scripts を書き換える**

```json
{
  "name": "instrument-lessons",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build && node scripts/copy-404.mjs",
    "lint": "tsc -b --noEmit",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: `vite.config.ts` を作る**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";

const base = "/instrument-lessons/";

export default defineConfig({
  base,
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm], providerImportSource: "@mdx-js/react" }) },
    react(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
```

- [ ] **Step 4: `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` を作る**

`tsconfig.json`:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vite/client", "mdx"]
  },
  "include": ["src", "tests", "content"]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "scripts"]
}
```

- [ ] **Step 5: `index.html`・`src/main.tsx`・`src/App.tsx`・`.gitignore` を作る**

`index.html`:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>楽器のはじめかた</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx`:

```tsx
export default function App() {
  return <h1>楽器のはじめかた</h1>;
}
```

`.gitignore`:

```
node_modules
dist
*.tsbuildinfo
```

- [ ] **Step 6: テストの下準備を作る**

`tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals を有効にしていないため、@testing-library/react の自動 cleanup が働かない。
// 登録しないと同じファイル内の render が DOM に積み上がり、getAllBy... の件数が狂う。
afterEach(cleanup);
```

- [ ] **Step 7: 疎通テストを書く**

`tests/smoke.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "../src/App";

test("トップに見出しが出る", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "楽器のはじめかた" })).toBeInTheDocument();
});
```

- [ ] **Step 8: テストとビルドを通す**

```bash
npm test
npm run lint
```

期待: テスト1件が PASS、型チェックがエラーなしで終わる。

- [ ] **Step 9: コミットする**

```bash
git add -A
git commit -m "chore: Vite + React + TypeScript + MDX のプロジェクトを初期化"
```

---

## Task 2: 音名と周波数の変換

**Files:**
- Create: `src/core/audio/pitch.ts`
- Test: `tests/core/pitch.test.ts`

**Interfaces:**
- Consumes: なし
- Produces:
  - `noteToMidi(note: string): number`
  - `midiToNote(midi: number): string`
  - `midiToFrequency(midi: number): number`
  - `noteToFrequency(note: string): number`
  - `transpose(note: string, semitones: number): string`

- [ ] **Step 1: 失敗するテストを書く**

`tests/core/pitch.test.ts`:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/core/pitch.test.ts
```

期待: FAIL（`src/core/audio/pitch` が見つからない）

- [ ] **Step 3: 実装する**

`src/core/audio/pitch.ts`:

```ts
const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const LETTER_SEMITONES: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

const NOTE_PATTERN = /^([A-G])(#|b)?(-?\d+)$/;

/** 音名（"A4"、"F#3"、"Bb4"）を MIDI ノート番号へ変換する。 */
export function noteToMidi(note: string): number {
  const matched = NOTE_PATTERN.exec(note);
  if (!matched) throw new Error(`音名として解釈できません: ${note}`);
  const [, letter, accidental, octave] = matched;
  const offset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (Number(octave) + 1) * 12 + LETTER_SEMITONES[letter] + offset;
}

/** MIDI ノート番号を音名へ変換する。異名同音はシャープで表す。 */
export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${SHARP_NAMES[((midi % 12) + 12) % 12]}${octave}`;
}

/** MIDI ノート番号を周波数へ変換する。12平均律、A4 = 440 Hz。 */
export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** 音名を周波数へ変換する。 */
export function noteToFrequency(note: string): number {
  return midiToFrequency(noteToMidi(note));
}

/** 音名を半音単位で移動する。 */
export function transpose(note: string, semitones: number): string {
  return midiToNote(noteToMidi(note) + semitones);
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run tests/core/pitch.test.ts
```

期待: PASS（全件）

- [ ] **Step 5: コミットする**

```bash
git add src/core/audio/pitch.ts tests/core/pitch.test.ts
git commit -m "feat: 音名・MIDI・周波数の変換を追加"
```

---

## Task 3: 撥弦音の合成

Karplus-Strong 法で弦をはじいた音の波形を作る。波形生成は Web Audio に依存しない純関数として切り出し、テスト可能にする。

**Files:**
- Create: `src/core/audio/output/pluck.ts`
- Create: `src/core/audio/output/context.ts`
- Create: `src/core/audio/output/play.ts`
- Test: `tests/core/pluck.test.ts`

**Interfaces:**
- Consumes: `noteToFrequency` (Task 2)
- Produces:
  - `renderPluck(sampleRate: number, frequency: number, seconds: number, options?: { damping?: number; seed?: number }): Float32Array`
  - `effectivePluckFrequency(sampleRate: number, frequency: number): number`
  - `getAudioContext(): AudioContext`
  - `playNotes(notes: string[], options?: { spreadMs?: number; seconds?: number }): void`

- [ ] **Step 1: 失敗するテストを書く**

自動相関で波形の基本周期を測り、狙った周波数になっているかを検査する。

`tests/core/pluck.test.ts`:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/core/pluck.test.ts
```

期待: FAIL（`src/core/audio/output/pluck` が見つからない）

- [ ] **Step 3: `pluck.ts` を実装する**

```ts
/** 再現性のある擬似乱数（mulberry32）。テストで波形を固定するために使う。 */
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Karplus-Strong の遅延線の長さ（サンプル数）。 */
function delayLength(sampleRate: number, frequency: number): number {
  return Math.max(2, Math.round(sampleRate / frequency) - 1);
}

/**
 * renderPluck が実際に出す音の周波数。
 *
 * 遅延線は整数サンプル単位でしか作れないため、狙った周波数からずれる。
 * さらに平均化フィルタが半サンプル分の遅れを足すので、実効の周期は delay + 0.5 になる。
 * 再生側はこの値をもとに再生速度を補正する。
 */
export function effectivePluckFrequency(sampleRate: number, frequency: number): number {
  return sampleRate / (delayLength(sampleRate, frequency) + 0.5);
}

export type PluckOptions = {
  /** 1周ごとの減衰率。1に近いほど長く鳴る。 */
  damping?: number;
  /** 擬似乱数の種。省略すると毎回わずかに違う音になる。 */
  seed?: number;
};

/**
 * Karplus-Strong 法で撥弦音の波形を作る。
 *
 * ノイズバーストで遅延線を満たし、平均化フィルタを通しながら
 * 繰り返すことで、弦をはじいた音に近い減衰音が得られる。
 */
export function renderPluck(
  sampleRate: number,
  frequency: number,
  seconds: number,
  options: PluckOptions = {},
): Float32Array {
  const damping = options.damping ?? 0.996;
  const random = makeRandom(options.seed ?? Math.floor(Math.random() * 2 ** 31));
  const total = Math.floor(sampleRate * seconds);
  const delay = delayLength(sampleRate, frequency);
  const buffer = new Float32Array(total);

  for (let i = 0; i <= delay && i < total; i++) {
    buffer[i] = random() * 2 - 1;
  }
  for (let i = delay + 1; i < total; i++) {
    buffer[i] = damping * 0.5 * (buffer[i - delay] + buffer[i - delay - 1]);
  }

  applyEnvelope(buffer, sampleRate);
  return buffer;
}

/** 立ち上がりと終わりにフェードをかけ、プチッというノイズを防ぐ。 */
function applyEnvelope(buffer: Float32Array, sampleRate: number): void {
  const attack = Math.min(Math.floor(sampleRate * 0.005), buffer.length);
  const release = Math.min(Math.floor(sampleRate * 0.05), buffer.length);
  for (let i = 0; i < attack; i++) buffer[i] *= i / attack;
  for (let i = 0; i < release; i++) {
    const index = buffer.length - 1 - i;
    buffer[index] *= i / release;
  }
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run tests/core/pluck.test.ts
```

期待: PASS（全件）。もし「申告した実効周波数どおりの波形になる」が落ちる場合、`effectivePluckFrequency` の `+ 0.5` が実装と合っていない。実測値に合わせて補正項を調整する。

- [ ] **Step 5: `context.ts` を実装する**

ブラウザはユーザー操作なしに音を出せないため、最初の操作時に `AudioContext` を作って以降は使い回す。この扱いをここ1箇所へ集約する。

```ts
let context: AudioContext | null = null;

/** AudioContext を遅延生成して使い回す。最初の呼び出しはユーザー操作の中から行う。 */
export function getAudioContext(): AudioContext {
  if (!context) {
    context = new AudioContext();
  }
  if (context.state === "suspended") {
    void context.resume();
  }
  return context;
}
```

- [ ] **Step 6: `play.ts` を実装する**

```ts
import { noteToFrequency } from "../pitch";
import { getAudioContext } from "./context";
import { effectivePluckFrequency, renderPluck } from "./pluck";

export type PlayNotesOptions = {
  /** 音を鳴らす間隔（ミリ秒）。0ならコード、100前後ならアルペジオになる。 */
  spreadMs?: number;
  /** 1音の長さ（秒）。 */
  seconds?: number;
};

/** 音名の並びを撥弦音で鳴らす。 */
export function playNotes(notes: string[], options: PlayNotesOptions = {}): void {
  const spreadMs = options.spreadMs ?? 0;
  const seconds = options.seconds ?? 2.5;
  const audio = getAudioContext();
  const gain = audio.createGain();
  gain.gain.value = 1 / Math.max(1, Math.sqrt(notes.length));
  gain.connect(audio.destination);

  notes.forEach((note, index) => {
    const frequency = noteToFrequency(note);
    const samples = renderPluck(audio.sampleRate, frequency, seconds);
    const buffer = audio.createBuffer(1, samples.length, audio.sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = audio.createBufferSource();
    source.buffer = buffer;
    // 遅延線の丸めで生じる音高のずれを、再生速度で打ち消す
    source.playbackRate.value = frequency / effectivePluckFrequency(audio.sampleRate, frequency);
    source.connect(gain);
    source.start(audio.currentTime + (index * spreadMs) / 1000);
  });
}
```

- [ ] **Step 7: 型チェックを通す**

```bash
npm run lint
```

期待: エラーなし

- [ ] **Step 8: コミットする**

```bash
git add src/core/audio tests/core/pluck.test.ts
git commit -m "feat: Karplus-Strong 法による撥弦音の合成を追加"
```

---

## Task 4: ウクレレのチューニングとコード定義

**Files:**
- Create: `src/instruments/ukulele/tuning.ts`
- Create: `src/instruments/ukulele/chords.ts`
- Test: `tests/ukulele/chords.test.ts`

**Interfaces:**
- Consumes: `noteToFrequency`, `transpose` (Task 2)
- Produces:
  - `UKULELE_TUNING: Tuning`（`{ strings: { label: string; note: string }[] }`、4弦から1弦の順）
  - `type ChordShape = { name: string; frets: (number | "x")[]; fingers: (number | null)[]; barre?: { fret: number; from: number; to: number } }`
  - `UKULELE_CHORDS: Record<string, ChordShape>`
  - `chordNotes(chord: ChordShape): string[]`

- [ ] **Step 1: 失敗するテストを書く**

`tests/ukulele/chords.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { UKULELE_TUNING } from "../../src/instruments/ukulele/tuning";
import { UKULELE_CHORDS, chordNotes } from "../../src/instruments/ukulele/chords";

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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/ukulele/chords.test.ts
```

期待: FAIL（モジュールが見つからない）

- [ ] **Step 3: `tuning.ts` を実装する**

```ts
export type Tuning = {
  strings: { label: string; note: string }[];
};

/** ウクレレの標準チューニング GCEA（High-G）。4弦から1弦の順に並べる。 */
export const UKULELE_TUNING: Tuning = {
  strings: [
    { label: "4弦", note: "G4" },
    { label: "3弦", note: "C4" },
    { label: "2弦", note: "E4" },
    { label: "1弦", note: "A4" },
  ],
};
```

- [ ] **Step 4: `chords.ts` を実装する**

```ts
import { transpose } from "../../core/audio/pitch";
import { UKULELE_TUNING } from "./tuning";

export type ChordShape = {
  name: string;
  /** 4弦から1弦の順。0 は開放弦、"x" はミュート。 */
  frets: (number | "x")[];
  /** 押さえる指の番号（1=人差し指 〜 4=小指）。押さえない弦は null。 */
  fingers: (number | null)[];
  /** セーハ（同じフレットを1本の指で複数弦押さえる）。 */
  barre?: { fret: number; from: number; to: number };
};

export const UKULELE_CHORDS: Record<string, ChordShape> = {
  C: { name: "C", frets: [0, 0, 0, 3], fingers: [null, null, null, 3] },
  F: { name: "F", frets: [2, 0, 1, 0], fingers: [2, null, 1, null] },
  G7: { name: "G7", frets: [0, 2, 1, 2], fingers: [null, 2, 1, 3] },
  C7: { name: "C7", frets: [0, 0, 0, 1], fingers: [null, null, null, 1] },
  // ハワイアン D7。根音の D を含まないが2本指で押さえられ、ヴァンプでは定番。
  D7: { name: "D7", frets: [2, 0, 2, 0], fingers: [1, null, 2, null] },
  Am: { name: "Am", frets: [2, 0, 0, 0], fingers: [2, null, null, null] },
  Em: { name: "Em", frets: [0, 4, 3, 2], fingers: [null, 3, 2, 1] },
  Dm: { name: "Dm", frets: [2, 2, 1, 0], fingers: [2, 3, 1, null] },
  A7: { name: "A7", frets: [0, 1, 0, 0], fingers: [null, 1, null, null] },
  // カリキュラムでは扱わないが、コード一覧と外部コード譜のために定義しておく。
  Bb: { name: "Bb", frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1], barre: { fret: 1, from: 2, to: 3 } },
};

/** コードを鳴らしたときに出る音を、4弦から1弦の順に返す。ミュートした弦は含めない。 */
export function chordNotes(chord: ChordShape): string[] {
  const notes: string[] = [];
  chord.frets.forEach((fret, index) => {
    if (fret === "x") return;
    notes.push(transpose(UKULELE_TUNING.strings[index].note, fret));
  });
  return notes;
}
```

- [ ] **Step 5: テストが通ることを確認する**

```bash
npx vitest run tests/ukulele/chords.test.ts
```

期待: PASS（全件）

- [ ] **Step 6: コミットする**

```bash
git add src/instruments/ukulele tests/ukulele
git commit -m "feat: ウクレレのチューニングとコード定義を追加"
```

---

## Task 5: コード図（ChordDiagram）

**Files:**
- Create: `src/instruments/ukulele/widgets/ChordDiagram.tsx`
- Create: `src/instruments/ukulele/widgets/ChordDiagram.css`
- Test: `tests/ukulele/ChordDiagram.test.tsx`

**Interfaces:**
- Consumes: `UKULELE_CHORDS`, `UKULELE_TUNING`, `ChordShape` (Task 4)
- Produces: `<ChordDiagram name="C" />`（props は `{ name: string; size?: "sm" | "md" | "lg" }`）

- [ ] **Step 1: 失敗するテストを書く**

`tests/ukulele/ChordDiagram.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ChordDiagram } from "../../src/instruments/ukulele/widgets/ChordDiagram";

describe("ChordDiagram", () => {
  test("コード名を表示する", () => {
    render(<ChordDiagram name="C" />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  test("押さえる位置に指番号を出す", () => {
    render(<ChordDiagram name="G7" />);
    expect(screen.getAllByTestId("finger-dot")).toHaveLength(3);
  });

  test("開放弦に印を出す", () => {
    render(<ChordDiagram name="C" />);
    expect(screen.getAllByTestId("open-string")).toHaveLength(3);
  });

  test("セーハを横棒で描く", () => {
    render(<ChordDiagram name="Bb" />);
    expect(screen.getByTestId("barre")).toBeInTheDocument();
  });

  test("セーハのないコードには横棒を描かない", () => {
    render(<ChordDiagram name="D7" />);
    expect(screen.queryByTestId("barre")).not.toBeInTheDocument();
  });

  test("未定義のコードは例外を投げる", () => {
    expect(() => render(<ChordDiagram name="Xmaj9" />)).toThrow();
  });

  test("読み上げ用の説明を持つ", () => {
    render(<ChordDiagram name="C" />);
    expect(screen.getByRole("img", { name: /C コード/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/ukulele/ChordDiagram.test.tsx
```

期待: FAIL（モジュールが見つからない）

- [ ] **Step 3: 実装する**

`src/instruments/ukulele/widgets/ChordDiagram.tsx`:

```tsx
import { UKULELE_CHORDS } from "../chords";
import { UKULELE_TUNING } from "../tuning";
import "./ChordDiagram.css";

const FRET_COUNT = 5;
const SIZES = { sm: 96, md: 140, lg: 200 } as const;

export type ChordDiagramProps = {
  name: string;
  size?: keyof typeof SIZES;
};

/** ウクレレのコードの押さえ方を SVG で描く。 */
export function ChordDiagram({ name, size = "md" }: ChordDiagramProps) {
  const chord = UKULELE_CHORDS[name];
  if (!chord) throw new Error(`未定義のコードです: ${name}`);

  const width = SIZES[size];
  const height = width * 1.25;
  const padding = width * 0.16;
  const gridWidth = width - padding * 2;
  const gridHeight = height - padding * 2.2;
  const stringCount = UKULELE_TUNING.strings.length;
  const stringGap = gridWidth / (stringCount - 1);
  const fretGap = gridHeight / FRET_COUNT;
  const stringX = (index: number) => padding + index * stringGap;
  const fretY = (fret: number) => padding * 1.2 + fret * fretGap;

  return (
    <figure className="chord-diagram">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        role="img"
        aria-label={`${name} コードの押さえ方`}
      >
        <line
          x1={stringX(0)} y1={fretY(0)} x2={stringX(stringCount - 1)} y2={fretY(0)}
          className="chord-diagram__nut"
        />
        {Array.from({ length: FRET_COUNT }, (_, i) => i + 1).map((fret) => (
          <line
            key={fret}
            x1={stringX(0)} y1={fretY(fret)} x2={stringX(stringCount - 1)} y2={fretY(fret)}
            className="chord-diagram__fret"
          />
        ))}
        {UKULELE_TUNING.strings.map((_, index) => (
          <line
            key={index}
            x1={stringX(index)} y1={fretY(0)} x2={stringX(index)} y2={fretY(FRET_COUNT)}
            className="chord-diagram__string"
          />
        ))}

        {chord.barre && (
          <rect
            data-testid="barre"
            x={stringX(chord.barre.from) - stringGap * 0.22}
            y={fretY(chord.barre.fret) - fretGap * 0.72}
            width={(chord.barre.to - chord.barre.from) * stringGap + stringGap * 0.44}
            height={fretGap * 0.44}
            rx={fretGap * 0.22}
            className="chord-diagram__barre"
          />
        )}

        {chord.frets.map((fret, index) => {
          if (fret === "x") {
            return (
              <text
                key={index}
                data-testid="muted-string"
                x={stringX(index)} y={fretY(0) - fretGap * 0.3}
                className="chord-diagram__mark"
              >
                ✕
              </text>
            );
          }
          if (fret === 0) {
            return (
              <circle
                key={index}
                data-testid="open-string"
                cx={stringX(index)} cy={fretY(0) - fretGap * 0.45}
                r={stringGap * 0.16}
                className="chord-diagram__open"
              />
            );
          }
          return (
            <g key={index} data-testid="finger-dot">
              <circle
                cx={stringX(index)} cy={fretY(fret) - fretGap * 0.5}
                r={stringGap * 0.28}
                className="chord-diagram__dot"
              />
              <text
                x={stringX(index)} y={fretY(fret) - fretGap * 0.5}
                className="chord-diagram__finger"
              >
                {chord.fingers[index]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="chord-diagram__name">{name}</figcaption>
    </figure>
  );
}
```

`src/instruments/ukulele/widgets/ChordDiagram.css`:

```css
.chord-diagram {
  display: inline-block;
  margin: 0;
  text-align: center;
}
.chord-diagram__nut { stroke: currentColor; stroke-width: 4; }
.chord-diagram__fret,
.chord-diagram__string { stroke: currentColor; stroke-width: 1; opacity: 0.45; }
.chord-diagram__dot,
.chord-diagram__barre { fill: currentColor; }
.chord-diagram__open { fill: none; stroke: currentColor; stroke-width: 1.5; }
.chord-diagram__finger {
  fill: var(--chord-diagram-finger-color, #fff);
  font-size: 0.72em;
  text-anchor: middle;
  dominant-baseline: central;
}
.chord-diagram__mark {
  fill: currentColor;
  font-size: 0.72em;
  text-anchor: middle;
}
.chord-diagram__name {
  font-size: 1.1em;
  font-weight: 700;
  margin-top: 0.2em;
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run tests/ukulele/ChordDiagram.test.tsx
```

期待: PASS（全件）

- [ ] **Step 5: コミットする**

```bash
git add src/instruments/ukulele/widgets tests/ukulele/ChordDiagram.test.tsx
git commit -m "feat: コード図コンポーネントを追加"
```

---

## Task 6: レッスンの型とカリキュラムデータ

カリキュラムの破綻を機械検出するテストを、この段階で入れる。以降レッスンを足すたびに守られる。

**Files:**
- Create: `src/core/lesson/types.ts`
- Create: `src/instruments/ukulele/curriculum.ts`
- Create: `src/instruments/ukulele/instrument.ts`
- Create: `src/instruments/registry.ts`
- Test: `tests/ukulele/curriculum.test.ts`

**Interfaces:**
- Consumes: `UKULELE_CHORDS` (Task 4)
- Produces:
  - `type Lesson = { id: string; number: number; title: string; stage: number; days: [number, number]; newChords: string[]; goal: string; song?: SongRef }`
  - `type SongRef = { id: string; title: string; chords: string[] }`
  - `type Curriculum = { stages: Stage[]; lessons: Lesson[] }`
  - `type Stage = { number: number; title: string; comingSoon?: boolean }`
  - `type Instrument = { id: string; slug: string; name: string; tagline: string; curriculum: Curriculum }`
  - `UKULELE: Instrument`
  - `INSTRUMENTS: Instrument[]`, `findInstrument(slug: string): Instrument | undefined`

- [ ] **Step 1: 失敗するテストを書く**

`tests/ukulele/curriculum.test.ts`:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/ukulele/curriculum.test.ts
```

期待: FAIL（モジュールが見つからない）

- [ ] **Step 3: `src/core/lesson/types.ts` を実装する**

```ts
import type { MDXComponents } from "mdx/types";

export type SongRef = {
  id: string;
  title: string;
  chords: string[];
};

export type Lesson = {
  id: string;
  number: number;
  title: string;
  stage: number;
  /** コース開始からの練習日の範囲（開始日, 終了日）。 */
  days: [number, number];
  /** このレッスンで新しく導入するコード。 */
  newChords: string[];
  goal: string;
  song?: SongRef;
};

export type Stage = {
  number: number;
  title: string;
  /** 枠だけ置いて内容は準備中のステージ。 */
  comingSoon?: boolean;
  /** 準備中のステージで予告として並べる項目。 */
  plannedTopics?: string[];
};

export type Curriculum = {
  stages: Stage[];
  lessons: Lesson[];
};

/**
 * 楽器の共通契約。弦・チューニング・コードはここに含めない。
 * 非弦楽器（オタマトーンなど）を後から追加できるようにするため。
 */
export type Instrument = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  curriculum: Curriculum;
  /** レッスン本文（MDX）から使えるコンポーネント。中身は楽器ごとに違う。 */
  mdxComponents: MDXComponents;
};
```

- [ ] **Step 4: `src/instruments/ukulele/curriculum.ts` を実装する**

```ts
import type { Curriculum } from "../../core/lesson/types";

export const UKULELE_CURRICULUM: Curriculum = {
  stages: [
    { number: 0, title: "準備" },
    { number: 1, title: "最初の音" },
    { number: 2, title: "コードを増やす" },
    { number: 3, title: "リズムを作る" },
    { number: 4, title: "歌と合わせる" },
    {
      number: 5,
      title: "人と合わせる",
      comingSoon: true,
      plannedTopics: [
        "移調とカポ：歌いやすいキーへ移す",
        "イントロ・エンディングとターンアラウンド",
        "他の楽器や歌に合わせる伴奏",
        "耳コピ入門",
      ],
    },
  ],
  lessons: [
    { id: "uk-01", number: 1, title: "ウクレレの各部と持ち方", stage: 0, days: [1, 1], newChords: [], goal: "構えが安定し、音が出る" },
    { id: "uk-02", number: 2, title: "チューニング", stage: 0, days: [2, 2], newChords: [], goal: "4本の弦を自力で合わせられる" },
    { id: "uk-03", number: 3, title: "右手：弦を1本ずつ鳴らす", stage: 1, days: [3, 3], newChords: [], goal: "4本すべてを均等に鳴らせる" },
    { id: "uk-04", number: 4, title: "ダウンストロークと4拍のカウント", stage: 1, days: [4, 5], newChords: [], goal: "メトロノームに合わせて4拍刻める" },
    { id: "uk-05", number: 5, title: "はじめてのコード C", stage: 1, days: [6, 7], newChords: ["C"], goal: "C を鳴らしながら4拍刻める" },
    { id: "uk-06", number: 6, title: "F と、コードチェンジの練習法", stage: 2, days: [8, 10], newChords: ["F"], goal: "C と F を1小節ごとに替えられる" },
    { id: "uk-07", number: 7, title: "G7 とスリーコード", stage: 2, days: [11, 13], newChords: ["G7"], goal: "C・F・G7 を止まらず回せる" },
    {
      id: "uk-08", number: 8, title: "課題曲① 聖者の行進", stage: 2, days: [14, 16], newChords: [],
      goal: "1曲を通して演奏できる",
      song: { id: "saints", title: "聖者の行進", chords: ["C", "F", "G7"] },
    },
    { id: "uk-09", number: 9, title: "アップストロークと8ビート", stage: 3, days: [17, 19], newChords: [], goal: "ダウンとアップを均等に刻める" },
    { id: "uk-10", number: 10, title: "定番パターン D-DU-UDU", stage: 3, days: [20, 22], newChords: ["C7"], goal: "パターンを保ったままコードを替えられる" },
    {
      id: "uk-11", number: 11, title: "課題曲② Aloha ʻOe", stage: 3, days: [23, 25], newChords: [],
      goal: "ストロークパターンで1曲通る",
      song: { id: "aloha-oe", title: "Aloha ʻOe", chords: ["C", "C7", "F", "G7"] },
    },
    { id: "uk-12", number: 12, title: "歌詞にコードを乗せて読む", stage: 4, days: [26, 27], newChords: [], goal: "コード譜を見ながら演奏できる" },
    { id: "uk-13", number: 13, title: "ハワイアン・ヴァンプと D7", stage: 4, days: [28, 30], newChords: ["D7"], goal: "D7・G7・C を2拍2拍4拍で弾ける" },
    {
      id: "uk-14", number: 14, title: "課題曲③ Kaimana Hila", stage: 4, days: [31, 33], newChords: [],
      goal: "ヴァンプ入りで1曲通る",
      song: { id: "kaimana-hila", title: "Kaimana Hila", chords: ["C", "C7", "F", "G7", "D7"] },
    },
    { id: "uk-15", number: 15, title: "よく出るコードと、止まらずに通す練習法", stage: 4, days: [34, 35], newChords: ["Am", "Em", "Dm", "A7"], goal: "外部のコード譜を自力で使える" },
  ],
};
```

- [ ] **Step 5: `instrument.ts` と `registry.ts` を実装する**

`src/instruments/ukulele/instrument.ts`:

```ts
レッスン本文はまだ無いため、`mdxComponents` は空で置く。Task 8 の Step 4 で中身を入れる。

```ts
import type { Instrument } from "../../core/lesson/types";
import { UKULELE_CURRICULUM } from "./curriculum";

export const UKULELE: Instrument = {
  id: "ukulele",
  slug: "ukulele",
  name: "ウクレレ",
  tagline: "5週間で弾き語り3曲",
  curriculum: UKULELE_CURRICULUM,
  mdxComponents: {},
};
```

`src/instruments/registry.ts`:

```ts
import type { Instrument } from "../core/lesson/types";
import { UKULELE } from "./ukulele/instrument";

export const INSTRUMENTS: Instrument[] = [UKULELE];

export function findInstrument(slug: string): Instrument | undefined {
  return INSTRUMENTS.find((instrument) => instrument.slug === slug);
}
```

- [ ] **Step 6: テストが通ることを確認する**

```bash
npx vitest run tests/ukulele/curriculum.test.ts
```

期待: PASS（全件）

- [ ] **Step 7: コミットする**

```bash
git add src/core/lesson src/instruments tests/ukulele/curriculum.test.ts
git commit -m "feat: レッスンの型とウクレレのカリキュラムを追加"
```

---

## Task 7: 進捗ストア

日付をまたぐ判定を確実にするため、「今日」は引数で受け取る純関数にする。

**Files:**
- Create: `src/core/progress/store.ts`
- Test: `tests/core/progress.test.ts`

**Interfaces:**
- Consumes: なし
- Produces:
  - `type InstrumentProgress = { completedLessonIds: string[]; lastLessonId: string | null; practiceDates: string[] }`
  - `loadProgress(): ProgressState`
  - `saveProgress(state: ProgressState): void`
  - `markCompleted(state, instrumentId, lessonId, today): ProgressState`
  - `unmarkCompleted(state, instrumentId, lessonId): ProgressState`
  - `currentStreak(practiceDates: string[], today: string): number`
  - `todayString(date?: Date): string`

- [ ] **Step 1: 失敗するテストを書く**

`tests/core/progress.test.ts`:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/core/progress.test.ts
```

期待: FAIL（モジュールが見つからない）

- [ ] **Step 3: 実装する**

`src/core/progress/store.ts`:

```ts
const STORAGE_KEY = "instrument-lessons:progress:v1";
const DAY_MS = 24 * 60 * 60 * 1000;

export type InstrumentProgress = {
  completedLessonIds: string[];
  lastLessonId: string | null;
  /** 練習した日（"YYYY-MM-DD"）。 */
  practiceDates: string[];
};

export type ProgressState = Record<string, InstrumentProgress>;

const EMPTY_INSTRUMENT: InstrumentProgress = {
  completedLessonIds: [],
  lastLessonId: null,
  practiceDates: [],
};

/** ローカル日付を "YYYY-MM-DD" で返す。UTC ではなく利用者の手元の日付を使う。 */
export function todayString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** レッスンを完了として記録する。既に完了していれば練習日だけを足す。 */
export function markCompleted(
  state: ProgressState,
  instrumentId: string,
  lessonId: string,
  today: string,
): ProgressState {
  const current = state[instrumentId] ?? EMPTY_INSTRUMENT;
  return {
    ...state,
    [instrumentId]: {
      completedLessonIds: current.completedLessonIds.includes(lessonId)
        ? current.completedLessonIds
        : [...current.completedLessonIds, lessonId],
      lastLessonId: lessonId,
      practiceDates: current.practiceDates.includes(today)
        ? current.practiceDates
        : [...current.practiceDates, today],
    },
  };
}

/** 完了の記録を取り消す。練習した事実は残す。 */
export function unmarkCompleted(
  state: ProgressState,
  instrumentId: string,
  lessonId: string,
): ProgressState {
  const current = state[instrumentId];
  if (!current) return state;
  return {
    ...state,
    [instrumentId]: {
      ...current,
      completedLessonIds: current.completedLessonIds.filter((id) => id !== lessonId),
    },
  };
}

/**
 * 連続練習日数を数える。
 * 今日まだ練習していない場合も、昨日までの連続は途切れていないものとして扱う。
 */
export function currentStreak(practiceDates: string[], today: string): number {
  const days = new Set(practiceDates);
  const todayMs = parseDate(today);
  let cursor = days.has(today) ? todayMs : todayMs - DAY_MS;
  let streak = 0;
  while (days.has(formatUtc(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

function formatUtc(ms: number): string {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 保存された進捗を読み出す。読めない場合は空を返す。 */
export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as ProgressState;
  } catch {
    return {};
  }
}

/** 進捗を保存する。保存できない環境では黙って何もしない。 */
export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // プライベートウィンドウなど、保存できない環境では進捗なしで動かす
  }
}
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
npx vitest run tests/core/progress.test.ts
```

期待: PASS（全件）

- [ ] **Step 5: コミットする**

```bash
git add src/core/progress tests/core/progress.test.ts
git commit -m "feat: 進捗ストアと連続練習日数の計算を追加"
```

---

## Task 8: MDX のレッスン本文とレッスン画面

**Files:**
- Create: `src/core/lesson/LessonLayout.tsx`
- Create: `src/core/lesson/mdxComponents.tsx`
- Create: `src/core/lesson/lessonModules.ts`
- Create: `content/ukulele/lesson-01.mdx`, `content/ukulele/lesson-02.mdx`
- Test: `tests/ukulele/lessonContent.test.tsx`

**Interfaces:**
- Consumes: `UKULELE_CURRICULUM` (Task 6), `ChordDiagram` (Task 5), `playNotes` (Task 3), `UKULELE_TUNING` (Task 4)
- Produces:
  - `getLessonComponent(instrumentSlug: string, lessonNumber: number): ComponentType | undefined`
  - `listLessonNumbers(instrumentSlug: string): number[]`
  - `<TonePlayer tones={[{ label, note }]} />`（core、楽器非依存）
  - `ukuleleMdxComponents: MDXComponents`（`ChordDiagram` と `TonePlayer` を登録）
  - `<LessonLayout lesson={lesson} instrument={instrument} />`

- [ ] **Step 1: 失敗するテストを書く**

`tests/ukulele/lessonContent.test.tsx`:

```tsx
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
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/ukulele/lessonContent.test.tsx
```

期待: FAIL（モジュールが見つからない）

- [ ] **Step 3: `lessonModules.ts` を実装する**

Vite の `import.meta.glob` でレッスン本文をまとめて読み込む。ファイル名は `lesson-<番号2桁>.mdx`、レッスンIDは `uk-<番号2桁>` の対応にする。

本文のファイル名は `content/<楽器スラッグ>/lesson-<番号2桁>.mdx` に統一する。番号は core の `Lesson.number` から作れるため、楽器ごとの対応表を持たずに済む。

```ts
import type { ComponentType } from "react";

type MdxModule = { default: ComponentType };

const modules = import.meta.glob<MdxModule>("../../../content/*/lesson-*.mdx", { eager: true });

function pathFor(instrumentSlug: string, lessonNumber: number): string {
  return `../../../content/${instrumentSlug}/lesson-${String(lessonNumber).padStart(2, "0")}.mdx`;
}

/** レッスン本文の MDX コンポーネントを返す。本文が未執筆なら undefined。 */
export function getLessonComponent(
  instrumentSlug: string,
  lessonNumber: number,
): ComponentType | undefined {
  return modules[pathFor(instrumentSlug, lessonNumber)]?.default;
}

/** 本文ファイルが存在するレッスン番号を返す。カリキュラムに無い本文の検出に使う。 */
export function listLessonNumbers(instrumentSlug: string): number[] {
  const prefix = `../../../content/${instrumentSlug}/lesson-`;
  return Object.keys(modules)
    .filter((path) => path.startsWith(prefix))
    .map((path) => Number(path.slice(prefix.length, prefix.length + 2)))
    .sort((a, b) => a - b);
}
```

- [ ] **Step 4: core 側の汎用 `TonePlayer` と、ウクレレ側のコンポーネント表を実装する**

core は楽器を知らないため、`TonePlayer` は鳴らす音を props で受け取る。ウクレレ固有の値を渡す役目は `src/instruments/ukulele/` が持つ。

`src/core/widgets/TonePlayer.tsx`:

```tsx
import { playNotes } from "../audio/output/play";

export type Tone = { label: string; note: string };

/** 基準音を鳴らすボタンを並べる。チューニングや音程の確認に使う。 */
export function TonePlayer({ tones }: { tones: Tone[] }) {
  return (
    <div className="tone-player">
      {tones.map((tone) => (
        <button
          key={tone.label}
          type="button"
          onClick={() => playNotes([tone.note], { seconds: 3 })}
        >
          {tone.label}（{tone.note.replace(/\d/, "")}）
        </button>
      ))}
    </div>
  );
}
```

`src/instruments/ukulele/mdxComponents.tsx`:

```tsx
import type { MDXComponents } from "mdx/types";
import { TonePlayer } from "../../core/widgets/TonePlayer";
import { UKULELE_TUNING } from "./tuning";
import { ChordDiagram } from "./widgets/ChordDiagram";

/** ウクレレの4本の弦の基準音を鳴らす。 */
function UkuleleTuner() {
  return <TonePlayer tones={UKULELE_TUNING.strings} />;
}

export const ukuleleMdxComponents: MDXComponents = {
  ChordDiagram,
  TonePlayer: UkuleleTuner,
};
```

続けて `src/instruments/ukulele/instrument.ts` の `mdxComponents: {}` を差し替える。

```ts
import { ukuleleMdxComponents } from "./mdxComponents";
// ...
  mdxComponents: ukuleleMdxComponents,
```

- [ ] **Step 5: `LessonLayout.tsx` を実装する**

```tsx
import { MDXProvider } from "@mdx-js/react";
import type { Instrument, Lesson } from "./types";
import { getLessonComponent } from "./lessonModules";

export type LessonLayoutProps = {
  instrument: Instrument;
  lesson: Lesson;
};

export function LessonLayout({ instrument, lesson }: LessonLayoutProps) {
  const Body = getLessonComponent(instrument.slug, lesson.number);
  const stage = instrument.curriculum.stages.find((item) => item.number === lesson.stage);

  return (
    <article className="lesson">
      <header className="lesson__header">
        <p className="lesson__stage">
          Stage {lesson.stage} {stage?.title} ・ {lesson.days[0]}〜{lesson.days[1]}日目
        </p>
        <h1>
          Lesson {String(lesson.number).padStart(2, "0")} {lesson.title}
        </h1>
        <p className="lesson__goal">このレッスンの到達点：{lesson.goal}</p>
      </header>
      <div className="lesson__body">
        {Body ? (
          <MDXProvider components={instrument.mdxComponents}>
            <Body />
          </MDXProvider>
        ) : (
          <p>このレッスンは準備中です。</p>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 6: `content/ukulele/lesson-01.mdx` を書く**

```mdx
はじめまして。これから5週間、1日15分でウクレレを弾けるようにしていきます。

今日やることは2つだけです。ウクレレの各部の名前を覚えることと、構え方を体に入れること。きれいな音を出すのは明日以降なので、今日は鳴りさえすれば十分です。

## 各部の名前

覚えるのは4つです。

- **ヘッド** — 一番上。糸巻き（ペグ）が付いている部分
- **ネック** — 左手で握る細い部分。表面に金属の棒が並んでいる
- **フレット** — ネックに打たれた金属の棒。この間を押さえて音の高さを変える
- **ボディ** — 丸い胴体。ここが鳴って音が大きくなる

これから「3フレットを押さえて」という言い方が何度も出てきます。3フレットとは、ヘッド側から数えて3本目の金属の棒の**手前**という意味です。棒の上ではありません。

## 弦の数え方

ここが最初のつまずきポイントです。ウクレレの弦は、**下から**数えます。

構えたときに一番下（床に近い側）に来る細い弦が **1弦**、そこから上へ 2弦、3弦、4弦です。一番上の弦が4弦になります。

## 構え方

椅子に浅く腰かけて、次の順で構えます。

1. ボディを右腕の内側で軽く胸に抱える
2. 左手はネックを下から支える。握り込まない
3. 左手の親指はネックの裏の真ん中あたりに軽く添える
4. 右手は、ネックとボディのつなぎ目のあたりに置く（ギターのようにサウンドホールの上ではありません）

**力を入れないこと**が唯一のコツです。ウクレレは軽いので、右腕で挟むだけで落ちません。左手はネックを支えるのではなく、あくまで指を置くために添えるだけです。

左手でネックを握り込んでしまうと、指が立たずコードが押さえられません。これが初心者が最初に詰まる原因のほとんどです。

## 今日の練習

構えたまま、右手の親指で一番上の弦（4弦）を上から下へ撫でるように鳴らしてみてください。音が出れば十分です。きれいな音でなくて構いません。

5分ほど構えたり下ろしたりを繰り返して、構え方に慣れてください。今日はこれで終わりです。
```

- [ ] **Step 7: `content/ukulele/lesson-02.mdx` を書く**

```mdx
今日はチューニングです。音が合っていない楽器で練習すると、正しい音を覚えられません。毎回弾く前に必ず合わせる習慣をつけます。

## ウクレレの4本の音

ウクレレの標準チューニングは、4弦から順に **G・C・E・A** です。

ここで多くの人が驚くのですが、**4弦（一番上）が3弦より高い音**です。ギターのように上から順に低くなっていくわけではありません。この並びを re-entrant tuning（リエントラント・チューニング）と呼びます。

なぜこうなっているかというと、ウクレレのコロコロした明るい響きは、この不揃いな音の並びから生まれているからです。仕様ではなく個性です。

## 基準の音を聴く

下のボタンで、それぞれの弦の正しい音が鳴ります。

<TonePlayer />

4弦（G）と3弦（C）を続けて鳴らしてみてください。4弦のほうが高いことが分かるはずです。

### 4弦が低い場合（Low-G）

4弦を鳴らしたとき、上のボタンの音より**明らかに低い**なら、その楽器は Low-G という別の張り方です。4弦だけ1オクターブ低い、太い弦が張られています。

この教材は High-G（4弦が高いほう）を前提に書いていますが、押さえ方は Low-G でもまったく同じです。響きが少し落ち着いて聞こえる、という違いだけです。そのまま進めて構いません。

## 合わせ方

1. クリップチューナーをヘッドに挟む（持っていなければスマホのチューナーアプリでも構いません）
2. 3弦から順に鳴らす
3. 表示された音名が目標と違えば、ペグを回す
4. **音が低いときは弦を巻く方向**、高いときは緩める方向

ペグを回すときは、必ず**少しずつ**動かしてください。一気に巻くと弦が切れます。1回の操作は「ほんの少し」で十分です。

弦を張り替えた直後や、買ったばかりのウクレレは、弾いているうちにどんどん音が下がります。これは弦が伸びているためで、故障ではありません。1〜2週間は毎回合わせ直すことになります。

## 今日の練習

4本すべてを合わせてください。合わせ終わったら、4弦から1弦まで順に鳴らして、音の並びを耳で覚えます。

慣れれば1分で終わります。明日からは、練習の最初に必ずこれをやります。
```

- [ ] **Step 8: テストが通ることを確認する**

```bash
npx vitest run tests/ukulele/lessonContent.test.tsx
npm run lint
```

期待: PASS（全件）、型エラーなし

- [ ] **Step 9: コミットする**

```bash
git add src/core/lesson content tests/ukulele/lessonContent.test.tsx
git commit -m "feat: MDX のレッスン本文と Lesson 01-02 を追加"
```

---

## Task 9: ルーティングと画面

**Files:**
- Create: `src/routes.tsx`
- Create: `src/pages/HomePage.tsx`, `src/pages/CoursePage.tsx`, `src/pages/LessonPage.tsx`, `src/pages/NotFoundPage.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `tests/routing.test.tsx`

**Interfaces:**
- Consumes: `INSTRUMENTS`, `findInstrument` (Task 6), `LessonLayout` (Task 8), 進捗ストア (Task 7)
- Produces: `<App />` がルーティングを持つ。ルートは `/`, `/:instrumentSlug`, `/:instrumentSlug/:lessonSlug`（`lessonSlug` は `lesson-01` の形を `LessonPage` が解釈する）

- [ ] **Step 1: 失敗するテストを書く**

`tests/routing.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";
import { AppRoutes } from "../src/routes";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("ルーティング", () => {
  beforeEach(() => localStorage.clear());

  test("トップに楽器の一覧が出る", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: /ウクレレ/ })).toBeInTheDocument();
  });

  test("コース概要にレッスンが15本並ぶ", () => {
    renderAt("/ukulele");
    expect(screen.getAllByRole("link", { name: /Lesson \d\d/ })).toHaveLength(15);
  });

  test("コース概要に Coming Soon のステージが出る", () => {
    renderAt("/ukulele");
    expect(screen.getByText(/人と合わせる/)).toBeInTheDocument();
    expect(screen.getByText(/準備中/)).toBeInTheDocument();
  });

  test("レッスンページに本文と到達点が出る", () => {
    renderAt("/ukulele/lesson-01");
    expect(screen.getByRole("heading", { name: /Lesson 01/ })).toBeInTheDocument();
    expect(screen.getByText(/構えが安定し、音が出る/)).toBeInTheDocument();
  });

  test("存在しない楽器は 404 になる", () => {
    renderAt("/trumpet");
    expect(screen.getByText(/ページが見つかりません/)).toBeInTheDocument();
  });

  test("存在しないレッスン番号は 404 になる", () => {
    renderAt("/ukulele/lesson-99");
    expect(screen.getByText(/ページが見つかりません/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
npx vitest run tests/routing.test.tsx
```

期待: FAIL（`src/routes` が見つからない）

- [ ] **Step 3: ページを実装する**

`src/pages/HomePage.tsx`:

```tsx
import { Link } from "react-router-dom";
import { INSTRUMENTS } from "../instruments/registry";

export function HomePage() {
  return (
    <main className="home">
      <h1>楽器のはじめかた</h1>
      <p>楽器に触れたことのない人が、独習で弾けるようになるための教材です。</p>
      <ul className="home__instruments">
        {INSTRUMENTS.map((instrument) => (
          <li key={instrument.id}>
            <Link to={`/${instrument.slug}`}>
              {instrument.name} — {instrument.tagline}
            </Link>
          </li>
        ))}
      </ul>
      <h2>これから追加する楽器</h2>
      <ul className="home__upcoming">
        <li>オタマトーン（準備中）</li>
      </ul>
      <p className="home__note">
        進捗はこのブラウザにだけ保存されます。別のブラウザや端末では引き継がれません。
      </p>
    </main>
  );
}
```

`src/pages/CoursePage.tsx`:

```tsx
import { Link, useParams } from "react-router-dom";
import { findInstrument } from "../instruments/registry";
import { NotFoundPage } from "./NotFoundPage";
import { useProgress } from "../core/progress/useProgress";
import { currentStreak, todayString } from "../core/progress/store";

export function CoursePage() {
  const { instrumentSlug = "" } = useParams();
  const instrument = findInstrument(instrumentSlug);
  const { progress } = useProgress(instrument?.id ?? "");

  if (!instrument) return <NotFoundPage />;

  const { stages, lessons } = instrument.curriculum;
  const completed = new Set(progress.completedLessonIds);
  // toISOString は UTC を返すため使わない。記録側と同じローカル日付で数える。
  const streak = currentStreak(progress.practiceDates, todayString());

  return (
    <main className="course">
      <h1>{instrument.name}</h1>
      <p>{instrument.tagline}</p>
      <p className="course__progress">
        {completed.size} / {lessons.length} レッスン完了・連続 {streak} 日練習中
      </p>
      <progress value={completed.size} max={lessons.length} />

      {stages.map((stage) => (
        <section key={stage.number}>
          <h2>
            Stage {stage.number} {stage.title}
            {stage.comingSoon && <span className="course__coming-soon">準備中</span>}
          </h2>
          {stage.comingSoon ? (
            <ul>
              {(stage.plannedTopics ?? []).map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          ) : (
            <ol className="course__lessons">
              {lessons
                .filter((lesson) => lesson.stage === stage.number)
                .map((lesson) => (
                  <li key={lesson.id}>
                    <Link to={`/${instrument.slug}/lesson-${String(lesson.number).padStart(2, "0")}`}>
                      Lesson {String(lesson.number).padStart(2, "0")} {lesson.title}
                    </Link>
                    {completed.has(lesson.id) && <span aria-label="完了"> ✓</span>}
                  </li>
                ))}
            </ol>
          )}
        </section>
      ))}
    </main>
  );
}
```

`src/pages/LessonPage.tsx`:

```tsx
import { Link, useParams } from "react-router-dom";
import { LessonLayout } from "../core/lesson/LessonLayout";
import { findInstrument } from "../instruments/registry";
import { NotFoundPage } from "./NotFoundPage";
import { useProgress } from "../core/progress/useProgress";

const LESSON_SLUG_PATTERN = /^lesson-(\d{2})$/;

export function LessonPage() {
  const { instrumentSlug = "", lessonSlug = "" } = useParams();
  const instrument = findInstrument(instrumentSlug);
  const matched = LESSON_SLUG_PATTERN.exec(lessonSlug);
  const lesson = matched
    ? instrument?.curriculum.lessons.find((item) => item.number === Number(matched[1]))
    : undefined;
  const { progress, toggleCompleted } = useProgress(instrument?.id ?? "");

  if (!instrument || !lesson) return <NotFoundPage />;

  const isCompleted = progress.completedLessonIds.includes(lesson.id);
  const lessons = instrument.curriculum.lessons;
  const previous = lessons[lesson.number - 2];
  const next = lessons[lesson.number];
  const toPath = (n: number) => `/${instrument.slug}/lesson-${String(n).padStart(2, "0")}`;

  return (
    <>
      <LessonLayout instrument={instrument} lesson={lesson} />
      <div className="lesson__footer">
        <button type="button" onClick={() => toggleCompleted(lesson.id)}>
          {isCompleted ? "完了を取り消す" : "完了にする"}
        </button>
        <nav className="lesson__nav">
          {previous && <Link to={toPath(previous.number)}>前のレッスン</Link>}
          <Link to={`/${instrument.slug}`}>レッスン一覧</Link>
          {next && <Link to={toPath(next.number)}>次のレッスン</Link>}
        </nav>
      </div>
    </>
  );
}
```

`src/pages/NotFoundPage.tsx`:

```tsx
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>ページが見つかりません</h1>
      <p>
        <Link to="/">トップへ戻る</Link>
      </p>
    </main>
  );
}
```

- [ ] **Step 4: `useProgress.ts` を実装する**

`src/core/progress/useProgress.ts`:

```tsx
import { useCallback, useState } from "react";
import {
  loadProgress, markCompleted, saveProgress, todayString, unmarkCompleted,
  type InstrumentProgress, type ProgressState,
} from "./store";

const EMPTY: InstrumentProgress = { completedLessonIds: [], lastLessonId: null, practiceDates: [] };

/** 楽器ごとの進捗を読み書きする。 */
export function useProgress(instrumentId: string) {
  const [state, setState] = useState<ProgressState>(() => loadProgress());

  const toggleCompleted = useCallback(
    (lessonId: string) => {
      setState((current) => {
        const done = current[instrumentId]?.completedLessonIds.includes(lessonId) ?? false;
        const next = done
          ? unmarkCompleted(current, instrumentId, lessonId)
          : markCompleted(current, instrumentId, lessonId, todayString());
        saveProgress(next);
        return next;
      });
    },
    [instrumentId],
  );

  return { progress: state[instrumentId] ?? EMPTY, toggleCompleted };
}
```

- [ ] **Step 5: `routes.tsx` と `App.tsx` を実装する**

`src/routes.tsx`:

```tsx
import { Route, Routes } from "react-router-dom";
import { CoursePage } from "./pages/CoursePage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:instrumentSlug" element={<CoursePage />} />
      {/* React Router は「lesson-:number」のような部分的な動的セグメントを解釈しない。
          セグメント全体を受け取り、LessonPage 側で解釈する。 */}
      <Route path="/:instrumentSlug/:lessonSlug" element={<LessonPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

`src/App.tsx`（既存を置き換える）:

```tsx
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  );
}
```

- [ ] **Step 6: 古い疎通テストを差し替える**

`tests/smoke.test.tsx` は `App` が `<h1>楽器のはじめかた</h1>` だけを返す前提だった。ルーティングを持つようになったため削除し、`tests/routing.test.tsx` に役割を移す。

```bash
git rm tests/smoke.test.tsx
```

- [ ] **Step 7: 最低限のスタイルを置く**

`src/styles.css`:

```css
:root {
  color-scheme: light dark;
  --text: #1f2933;
  --bg: #fcfbf7;
  --accent: #1d6f6a;
}
body {
  margin: 0;
  padding: 1.5rem 1rem 4rem;
  max-width: 42rem;
  margin-inline: auto;
  font-family: system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif;
  line-height: 1.85;
  color: var(--text);
  background: var(--bg);
}
a { color: var(--accent); }
h1, h2 { line-height: 1.4; }
.lesson__goal {
  border-left: 3px solid var(--accent);
  padding-left: 0.8em;
  font-weight: 600;
}
.course__coming-soon {
  margin-left: 0.6em;
  font-size: 0.7em;
  padding: 0.15em 0.6em;
  border: 1px solid currentColor;
  border-radius: 999px;
  opacity: 0.7;
}
.tone-player {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tone-player button {
  padding: 0.6em 1.1em;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
}
```

- [ ] **Step 8: テストと型チェックを通す**

```bash
npm test
npm run lint
```

期待: PASS（全件）、型エラーなし

- [ ] **Step 9: 手元で目視確認する**

```bash
npm run dev
```

確認すること:

- `http://localhost:5173/instrument-lessons/` にウクレレのリンクが出る
- コース概要にレッスンが15本、Stage 5 が「準備中」で出る
- Lesson 02 のボタンを押すと音が鳴り、4弦が3弦より高い
- 「完了にする」を押してリロードしても完了が残る

- [ ] **Step 10: コミットする**

```bash
git add -A
git commit -m "feat: ルーティングとトップ・コース概要・レッスン画面を追加"
```

---

## Task 10: GitHub Pages へのデプロイ

**Files:**
- Create: `scripts/copy-404.mjs`
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: Task 1 の `npm run build`
- Produces: `dist/` に `index.html` と `404.html` が並ぶビルド成果物

このタスクにテストは書かない。`dist/` を検査するテストは、ビルド前は何も検査しない空回りになるうえ、`node:fs` の型が `tsconfig.app.json` の `types` に含まれず `npm run lint` を落とす。Step 3 の目視確認で足りる。

- [ ] **Step 1: `scripts/copy-404.mjs` を実装する**

GitHub Pages はサーバ側のルーティングを持たないため、`/instrument-lessons/ukulele/lesson-01` へ直接アクセスすると 404 を返す。`404.html` に `index.html` を置くことで、SPA のルーティングへ処理を渡す。

```js
import { copyFileSync, existsSync } from "node:fs";

const source = "dist/index.html";
const destination = "dist/404.html";

if (!existsSync(source)) {
  console.error(`${source} がありません。先に vite build を実行してください。`);
  process.exit(1);
}

copyFileSync(source, destination);
console.log(`${source} を ${destination} へコピーしました`);
```

- [ ] **Step 3: ビルドして成果物を確認する**

```bash
npm run build
ls dist/index.html dist/404.html
diff dist/index.html dist/404.html && echo "404.html は index.html と同一"
```

期待: 両方のファイルが存在し、`diff` が差分なしで終わる

- [ ] **Step 4: `.github/workflows/deploy.yml` を作る**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Type-check
        run: npm run lint
      - name: Test
        run: npm test
      - name: Build
        run: npm run build
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: `README.md` を書く**

```markdown
# instrument-lessons

楽器に触れたことのない人が、独習で弾けるようになるための教材サイト。

現在の対象はウクレレ。5週間・1日15分で、弾き語り3曲を通せる状態を目指す。

## 開発

    npm install
    npm run dev      # 開発サーバ
    npm test         # テスト
    npm run lint     # 型チェック
    npm run build    # 本番ビルド

## 設計と方針

- 設計仕様: `docs/superpowers/specs/`
- 実装プラン: `docs/superpowers/plans/`

## 掲載曲の著作権

サイト内に掲載する曲は、日本と米国の両方で保護期間が満了したものに限る。
判定基準と各曲の根拠は `docs/songs-licensing.md` に記録し、テストで機械的に検査する。
```

- [ ] **Step 6: GitHub にリポジトリを作って push する**

公開リポジトリを作る操作なので、実行前に依頼者へ確認する。

```bash
gh repo create instrument-lessons --public --source=. --remote=origin --push
```

- [ ] **Step 7: Pages を有効にする**

GitHub のリポジトリ設定で Settings → Pages → Source を「GitHub Actions」にする。その後 Actions のワークフローが緑になることを確認する。

- [ ] **Step 8: 公開されたサイトを目視で確認する**

`https://<ユーザー名>.github.io/instrument-lessons/` を開き、次を確認する。

- トップが表示される
- `/instrument-lessons/ukulele/lesson-01` へ直接アクセスしても 404 にならない
- スマートフォンでコード図が読める大きさで出る
- Lesson 02 のボタンで音が鳴る

- [ ] **Step 9: コミットする**

```bash
git add -A
git commit -m "ci: GitHub Pages へのデプロイを追加"
git push
```

---

## Task 11: PWA 対応（スマートフォンへのインストールとオフライン再生）

練習中はスマートフォンを譜面台代わりに見るため、ホーム画面から全画面で開けるようにする。音は合成なので音源の取得が要らず、オフラインでもレッスンと練習ツールがそのまま動く。

**Files:**
- Create: `public/icon.svg`
- Create: `scripts/make-icons.mjs`
- Create: `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`, `public/apple-touch-icon.png`（スクリプトが生成）
- Modify: `vite.config.ts`
- Modify: `index.html`

**Interfaces:**
- Consumes: Task 10 のビルドとデプロイ
- Produces: `dist/manifest.webmanifest` と `dist/sw.js` を含むビルド成果物

- [ ] **Step 1: 依存を追加する**

```bash
npm i -D vite-plugin-pwa sharp
```

- [ ] **Step 2: `public/icon.svg` を作る**

ウクレレのヘッドとペグを模した図形にする。マスカブル領域（中央80%）に収まるよう余白を取る。

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#1d6f6a"/>
  <g fill="none" stroke="#fcfbf7" stroke-width="18" stroke-linecap="round">
    <path d="M256 128 v256"/>
    <path d="M212 128 v256"/>
    <path d="M300 128 v256"/>
    <path d="M168 160 h176" stroke-width="26"/>
    <path d="M168 232 h176"/>
    <path d="M168 304 h176"/>
  </g>
  <circle cx="256" cy="196" r="22" fill="#fcfbf7"/>
</svg>
```

- [ ] **Step 3: `scripts/make-icons.mjs` を作る**

```js
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const source = "public/icon.svg";
const outputs = [
  { file: "public/icon-192.png", size: 192, pad: 0 },
  { file: "public/icon-512.png", size: 512, pad: 0 },
  { file: "public/apple-touch-icon.png", size: 180, pad: 0 },
  // マスカブルは端が切り取られるため、内側に余白を作る
  { file: "public/icon-maskable-512.png", size: 512, pad: 64 },
];

mkdirSync("public", { recursive: true });

for (const { file, size, pad } of outputs) {
  const inner = size - pad * 2;
  await sharp(source)
    .resize(inner, inner)
    .extend({
      top: pad, bottom: pad, left: pad, right: pad,
      background: "#1d6f6a",
    })
    .png()
    .toFile(file);
  console.log(`${file} を書き出しました（${size}x${size}）`);
}
```

- [ ] **Step 4: アイコンを生成する**

```bash
node scripts/make-icons.mjs
```

期待: `public/` に PNG が4つ生成される

- [ ] **Step 5: `vite.config.ts` に PWA プラグインを足す**

`plugins` 配列の末尾に `VitePWA({...})` を追加し、`import { VitePWA } from "vite-plugin-pwa";` を足す。

```ts
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      manifest: {
        id: base,
        name: "楽器のはじめかた",
        short_name: "楽器",
        description: "楽器に触れたことのない人が、独習で弾けるようになるための教材",
        lang: "ja",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        theme_color: "#1d6f6a",
        background_color: "#fcfbf7",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
```

`start_url` と `scope` を `base` と一致させること。ずれるとインストールできない、あるいは起動時に画面が真っ白になる。

- [ ] **Step 6: `index.html` に iOS 向けのタグを足す**

`<head>` に次を追加する。iOS は manifest の icons を見ないため、`apple-touch-icon` を明示する。

```html
    <meta name="theme-color" content="#1d6f6a" />
    <link rel="apple-touch-icon" href="/instrument-lessons/apple-touch-icon.png" />
```

- [ ] **Step 7: ビルドして成果物を確認する**

```bash
npm run build
ls dist/manifest.webmanifest dist/sw.js dist/icon-512.png
cat dist/manifest.webmanifest
```

期待: 3つのファイルが存在し、manifest の `start_url` と `scope` がどちらも `/instrument-lessons/` になっている

- [ ] **Step 8: ローカルで動作を確認する**

Service Worker は開発サーバでは動かないため、ビルド結果をプレビューして確認する。

```bash
npm run preview
```

ブラウザの DevTools で確認すること:

- Application → Manifest にアイコンとアプリ名が出る
- Application → Service Workers が activated になっている
- Network を Offline にしてリロードしても、レッスンが表示されて音も鳴る

- [ ] **Step 9: 公開後に実機で確認する**

push してデプロイが終わったら、スマートフォンで確認する。

- iOS（Safari）: 共有 → ホーム画面に追加 → アイコンが出て、開くとアドレスバーなしの全画面になる
- Android（Chrome）: メニュー → アプリをインストール
- 機内モードにしてもレッスンが開き、チューニングの音が鳴る

- [ ] **Step 10: コミットする**

```bash
git add -A
git commit -m "feat: PWA 対応を追加してスマホから全画面・オフラインで使えるようにする"
git push
```

---

## 後続のプラン

プランAの完了後、次の2つを別プランとして書く。Aの実装で分かることを反映するため、Aが終わってから着手する。

**プランB（練習ツールとレッスン本文）**

- 練習ツール5種: Metronome / StrumPattern / ChordPlayer / ChordChangeTrainer / SongSheet
- ChordPro 風記法のパーサとテスト
- Lesson 03-15 の本文
- 課題曲3曲のページ

**プランC（楽譜ライブラリ）**

- `Song` 型と `SongLicensing` 型
- 権利情報をビルド時に強制するテスト
- `/ukulele/songs` の一覧と絞り込み（今の自分が弾ける曲・コード数・セーハの有無）
- ハワイアン12曲の検証と収録
- `docs/songs-licensing.md`

---

## Self-Review

**1. 仕様の網羅**

| 仕様の項目 | 対応タスク |
|---|---|
| §5 楽器の抽象化（共通契約から弦を外す） | Task 6 |
| §7 技術構成（Vite / React / MDX / Router） | Task 1, 9 |
| §9 音声エンジン（Karplus-Strong、pitch、context 分離） | Task 2, 3 |
| §10 進捗記録 | Task 7, 9 |
| §11 ルーティングとデプロイ（base、404.html） | Task 9, 10 |
| PWA（仕様に追記済み。スマホへのインストールとオフライン） | Task 11 |
| §12 テスト戦略（カリキュラム整合・コード定義・pitch・進捗） | Task 2, 4, 6, 7 |
| §4 カリキュラム（15レッスンのメタ情報） | Task 6 |
| §8 練習ツール（TonePlayer のみ。残り6種はプランB） | Task 8 |
| §6 楽譜ライブラリ | プランC |
| §13 デザイン方針 | Task 9 で最低限。本格的な視覚方針はプランBで frontend-design を呼ぶ |

**2. プレースホルダの検査**

「TBD」「あとで実装」「Task N と同様」の類は使っていない。すべてのコード手順に実際のコードを置いた。

初稿では Task 7 に書きかけのコードを残す手順が混ざっていたため、修正済み。

**3. 型の一貫性**

- `Instrument` / `Lesson` / `Curriculum` / `Stage` / `SongRef` は Task 6 で定義し、Task 8・9 で同じ名前で使っている
- `ChordShape` は Task 4 で定義し、Task 5 で使っている
- `renderPluck` / `playNotes` / `getAudioContext` は Task 3 で定義し、Task 8 で `playNotes` を使っている
- `markCompleted` / `unmarkCompleted` / `currentStreak` / `todayString` は Task 7 で定義し、Task 9 の `useProgress` で使っている
- `getLessonComponent` は Task 8 で定義し、同 Task の `LessonLayout` で使っている
- 本文ファイル名（`lesson-01.mdx`）と URL（`/ukulele/lesson-01`）はどちらも `Lesson.number` から作られ、Task 6・8・9 で規則が一致している

---

## プランレビュー

**レビュアー:** fable-advisor サブエージェント（Fable。作成者は Opus 5）

**致命的な指摘（すべて反映）**

| 指摘 | 反映内容 |
|---|---|
| `path="/:instrumentSlug/lesson-:number"` は React Router が解釈しない。全レッスンが 404 になる | `/:instrumentSlug/:lessonSlug` に変更し、`LessonPage` で `lesson-NN` を解釈する形へ。React Router の部分的動的セグメント非対応を検索で裏取りしたうえで採用 |
| Vitest の `globals` を有効にしていないため、Testing Library の自動 cleanup が働かない。同一ファイル内の複数 render で DOM が積み上がり、件数を数えるテストが落ちる | `tests/setup.ts` に `afterEach(cleanup)` を明示 |
| `tests/build.test.ts` が `node:fs` の型を解決できず `npm run lint` を落とす。さらにビルド前は空回りするテスト | テストごと削除し、Task 10 Step 3 の目視確認に置き換え |

**設計上の指摘（すべて反映）**

| 指摘 | 反映内容 |
|---|---|
| `core/lesson/mdxComponents.tsx` が `instruments/ukulele` を import しており、仕様§5「core は楽器に依存しない」に反する。オタマトーン追加時に最初に破綻する | `TonePlayer` を props で音を受け取る core ウィジェットに分離し、コンポーネント表を `instruments/ukulele/mdxComponents.tsx` へ移動。`Instrument` に `mdxComponents` を持たせて `LessonLayout` が受け取る形へ。あわせて `lessonModules` の楽器別プレフィックス表を廃止し、`Lesson.number` から一意にファイル名を導く形にした |
| `CoursePage` が `toISOString()`（UTC）を使っており、記録側の `todayString()`（ローカル）と食い違う。JST の 0〜9 時に連続日数がずれる | `todayString()` に統一 |
| Karplus-Strong の遅延線の丸めで、A4 が +12.5 セントずれる。チューニングの基準音としては粗い | `effectivePluckFrequency()` を追加し、再生時に `playbackRate` で補正。テストも実効周波数との一致を見る形へ変更 |
| Lesson 02 の「頭文字をとって『ガット』」は根拠不明 | 削除。あわせて仕様§2 が求める Low-G の見分け方の節を追加 |

**軽微な指摘（反映したもの）**

- Stage 5 の予定項目が `CoursePage` にハードコードされていた → `Stage.plannedTopics` としてデータへ移動
- レッスン本文の存在確認テストが恒真だった → `listLessonNumbers()` を追加し、カリキュラムに無い本文ファイルを検出する向きへ変更
- Lesson 01 の「音はまだ出さなくて構いません」が到達点「音が出る」と矛盾 → 文言を修正
- 右手の位置は「サウンドホールの上」ではなくネックとボディのつなぎ目が一般的 → 修正
- D7 の 2223（セーハ）は Day 28 の初心者には段差が大きい → 2本指で押さえられるハワイアン D7（2020）へ変更。ヴァンプでの定番であることを検索で裏取り。セーハの描画テストは新設した `Bb` で行う

**見送った指摘**

| 指摘 | 見送る理由 |
|---|---|
| `lint: tsc -b --noEmit` の `-b` と `--noEmit` の併用は未確認 | 既存の flashcards リポで同じ指定が稼働している。実績があるため変更しない |
| `useProgress` が setState の更新関数の中で `saveProgress` を呼んでいる | StrictMode で二重実行されるが冪等で実害がない。レビュアー自身も実害なしと判断している |
| `core/audio/input/` の空ディレクトリは git に残らない | 仕様側の記述を「必要になった時点で作る」へ修正して対応済み。空ディレクトリは作らない |
| 連続日数の表示がトップではなくコース概要にある | レビュアーの指摘どおりコース概要のほうが筋が通るため、プランではなく仕様の記述を修正した |
