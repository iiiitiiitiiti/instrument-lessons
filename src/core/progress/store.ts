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

function formatUtc(ms: number): string {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
