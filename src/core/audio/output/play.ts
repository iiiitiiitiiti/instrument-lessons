import { noteToFrequency } from "../pitch";
import { getAudioContext } from "./context";
import { effectivePluckFrequency, renderPluck } from "./pluck";

export type PlayNotesOptions = {
  /** 音を鳴らす間隔（ミリ秒）。0ならコード、100前後ならアルペジオになる。 */
  spreadMs?: number;
  /** 1音の長さ（秒）。 */
  seconds?: number;
  /** 全体の音量（0〜1）。弱く弾く表現に使う。 */
  volume?: number;
  /** 鳴らし始める時刻（AudioContext の時間軸）。省略すると即時。 */
  at?: number;
};

/** 音名の並びを撥弦音で鳴らす。 */
export function playNotes(notes: string[], options: PlayNotesOptions = {}): void {
  const spreadMs = options.spreadMs ?? 0;
  const seconds = options.seconds ?? 2.5;
  const volume = options.volume ?? 1;
  const audio = getAudioContext();
  const startAt = options.at ?? audio.currentTime;
  const gain = audio.createGain();
  gain.gain.value = volume / Math.max(1, Math.sqrt(notes.length));
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
    source.start(startAt + (index * spreadMs) / 1000);
  });
}
