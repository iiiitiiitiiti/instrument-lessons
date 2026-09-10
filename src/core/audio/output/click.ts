import { getAudioContext } from "./context";

export type ClickOptions = {
  /** 1拍目のアクセント。高く、少し大きく鳴らす。 */
  accent?: boolean;
  /** 鳴らす時刻（AudioContext の時間軸）。省略すると即時。 */
  at?: number;
};

const DECAY_SECONDS = 0.05;

/**
 * メトロノームのクリック音を予約する。
 *
 * 撥弦音（Karplus-Strong）は使わない。弦の音は減衰が長く、拍の頭が立たないため
 * 拍を数える用には向かない。ここは短い正弦波を鋭く減衰させて「点」にする。
 */
export function playClick({ accent = false, at }: ClickOptions = {}): void {
  const audio = getAudioContext();
  const start = at ?? audio.currentTime;

  const oscillator = audio.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = accent ? 1600 : 1000;

  const gain = audio.createGain();
  // 立ち上がりを一瞬で作る。0 から始めないと発音時にプツッと鳴る
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(accent ? 0.5 : 0.32, start + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + DECAY_SECONDS);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + DECAY_SECONDS + 0.01);
}
