import { Route, Routes } from "react-router-dom";
import { CoursePage } from "./pages/CoursePage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import {
  SongLibraryDetailRoute,
  SongLibraryListRoute,
} from "./pages/SongLibraryRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:instrumentSlug" element={<CoursePage />} />
      {/* 静的セグメントは動的セグメントより優先されるため、下の :lessonSlug より先に当たる */}
      <Route path="/:instrumentSlug/songs" element={<SongLibraryListRoute />} />
      <Route path="/:instrumentSlug/songs/:songId" element={<SongLibraryDetailRoute />} />
      {/* React Router は「lesson-:number」のような部分的な動的セグメントを解釈しない。
          セグメント全体を受け取り、LessonPage 側で解釈する。 */}
      <Route path="/:instrumentSlug/:lessonSlug" element={<LessonPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
