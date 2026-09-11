import { noteToFrequency } from "../pitch";
import { getAudioContext } from "./context";

export type PlayVoiceOptions = {
  /** 音の長さ（秒）。 */
  seconds: number;
  /** 鳴らし始める時刻（AudioContext の時間軸）。省略すると即時。 */
  at?: number;
  volume?: number;
};

/** 短すぎる音は立ち上がりと消え際が重なって鳴らない。 */
const MIN_SECONDS = 0.06;
const ATTACK = 0.02;

/**
 * メロディの音を1つ鳴らす。
 *
 * 撥弦音（Karplus-Strong）は使わない。伴奏と同じ音色だと、どれが歌の旋律か聞き分けられない。
 * また撥弦音はすぐ減衰するので、歌で伸ばす音の長さが伝わらない。ここは三角波を持続させる。
 */
export function playVoice(note: string, { seconds, at, volume = 0.3 }: PlayVoiceOptions): void {
  const audio = getAudioContext();
  const start = at ?? audio.currentTime;
  const end = start + Math.max(seconds, MIN_SECONDS);
  // 同じ高さの音が続いたときに切れ目が聞こえるよう、長さの手前から下げ始める
  const release = Math.min(0.08, (end - start) / 3);

  const oscillator = audio.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = noteToFrequency(note);

  const gain = audio.createGain();
  // 0 から始めないと発音時にプツッと鳴る
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + ATTACK);
  gain.gain.linearRampToValueAtTime(volume * 0.75, end - release);
  gain.gain.linearRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}
