# 002. 既存リポジトリと同じスタックを踏襲する

- 日付: 2026-09-10
- 対象: ビルド構成全体（`package.json`、`vite.config.ts`、CI）

## 背景

レッスン本文が中心のコンテンツサイトを作る。この形にはコンテンツ主導の静的サイトジェネレータが理論上よく合う。一方、同じユーザーの既存プロジェクト（flashcards、zoo-aquarium-log）は Vite + React 19 + TypeScript + Vitest + GitHub Pages で揃っている。

## 決定

Vite + React 19 + TypeScript + MDX + Vitest。CI ワークフローは flashcards の `deploy.yml` を踏襲する。

## 比較した代替案

- 却下: **Astro + MDX + React islands** — コンテンツサイトとしては最適に近い。ただし既存3プロジェクトと別スタックになるコストは確実に発生する。一方で静的出力の利点は、レッスン15〜30本の規模だと体感差として現れにくい
- 却下: **素の HTML / CSS / JS** — ビルドが要らない。ただしレッスンが増えると共通レイアウトの手作業複製が破綻し、楽器の抽象化（[001](001_instrument-contract-excludes-strings.md)）も表現できない
- 採用: **既存スタックの踏襲**

## 影響範囲

- 全タスクの実装手順
- テスト基盤（Vitest + @testing-library/react + jsdom）
- ユーザー自身が後からレッスン本文や設定を触るときの学習コスト

## 検証

flashcards と zoo-aquarium-log の `package.json` と `.github/workflows/` を実際に読み、同じ構成が稼働中であることを確認した。

**判断が間違いだったとわかる条件:** レッスン数が3桁へ達し、初回ロードの重さが実際の問題になったとき。その時点で静的生成へ移す。MDX 本文はそのまま移植できるため、撤退コストは中程度にとどまる。

## 関連ファイル

- `docs/superpowers/specs/2026-09-10-instrument-lessons-design.md` §7
