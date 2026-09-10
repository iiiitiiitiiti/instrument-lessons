import { Route, Routes } from "react-router-dom";
import { CoursePage } from "./pages/CoursePage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:instrumentSlug" element={<CoursePage />} />
      {/* React Router は「lesson-:number」のような部分的な動的セグメントを解釈しない。
          セグメント全体を受け取り、LessonPage 側で解釈する。 */}
      <Route path="/:instrumentSlug/:lessonSlug" element={<LessonPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
