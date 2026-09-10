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
): Float32Array<ArrayBuffer> {
  // damping >= 1 だと減衰ループが発散し「出力が [-1, 1] に収まる」という不変条件が壊れるためクランプする
  const damping = Math.min(Math.max(options.damping ?? 0.996, 0), 0.999);
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
