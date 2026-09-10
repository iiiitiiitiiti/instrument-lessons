import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";
import { AppRoutes } from "../src/routes";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("ルーティング", () => {
  beforeEach(() => localStorage.clear());

  test("トップに楽器の一覧が出る", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: /ウクレレ/ })).toBeInTheDocument();
  });

  test("コース概要にレッスンが15本並ぶ", () => {
    renderAt("/ukulele");
    expect(screen.getAllByRole("link", { name: /Lesson \d\d/ })).toHaveLength(15);
  });

  test("コース概要に Coming Soon のステージが出る", () => {
    renderAt("/ukulele");
    expect(screen.getByText(/人と合わせる/)).toBeInTheDocument();
    expect(screen.getByText(/準備中/)).toBeInTheDocument();
  });

  test("レッスンページに本文と到達点が出る", () => {
    renderAt("/ukulele/lesson-01");
    expect(screen.getByRole("heading", { name: /Lesson 01/ })).toBeInTheDocument();
    expect(screen.getByText(/構えが安定し、音が出る/)).toBeInTheDocument();
  });

  test("存在しない楽器は 404 になる", () => {
    renderAt("/trumpet");
    expect(screen.getByText(/ページが見つかりません/)).toBeInTheDocument();
  });

  test("存在しないレッスン番号は 404 になる", () => {
    renderAt("/ukulele/lesson-99");
    expect(screen.getByText(/ページが見つかりません/)).toBeInTheDocument();
  });
});
