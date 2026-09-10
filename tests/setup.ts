import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals を有効にしていないため、@testing-library/react の自動 cleanup が働かない。
// 登録しないと同じファイル内の render が DOM に積み上がり、getAllBy... の件数が狂う。
afterEach(cleanup);
