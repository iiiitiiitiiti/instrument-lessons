import type { Curriculum } from "../lesson/types";

/**
 * 完了したレッスンで導入されたコードを集める。
 *
 * 進捗はレッスン単位でしか記録していない（`completedLessonIds`）。「今の自分が弾ける曲」は
 * コード単位で決まるので、カリキュラムの `newChords` を通して変換する。
 *
 * 楽器を知らない処理なので core に置く。コードという概念を持たない楽器では
 * `newChords` が空のままなので、結果も空になる。
 */
export function learnedChords(curriculum: Curriculum, completedLessonIds: string[]): string[] {
  const completed = new Set(completedLessonIds);
  const learned: string[] = [];
  for (const lesson of curriculum.lessons) {
    if (!completed.has(lesson.id)) continue;
    for (const chord of lesson.newChords) {
      if (!learned.includes(chord)) learned.push(chord);
    }
  }
  return learned;
}
