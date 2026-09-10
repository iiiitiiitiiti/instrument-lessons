let context: AudioContext | null = null;

/** AudioContext を遅延生成して使い回す。最初の呼び出しはユーザー操作の中から行う。 */
export function getAudioContext(): AudioContext {
  if (!context) {
    context = new AudioContext();
  }
  if (context.state === "suspended") {
    // iOS では通話などで interrupted になっていると reject する。
    // 拾わないと unhandled rejection になるが、ここでできることは何もない
    void context.resume().catch(() => {});
  }
  return context;
}
