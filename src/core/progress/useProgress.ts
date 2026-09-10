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
