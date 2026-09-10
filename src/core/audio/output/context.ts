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
