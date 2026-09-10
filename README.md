# instrument-lessons

楽器に触れたことのない人が、独習で弾けるようになるための教材サイト。

現在の対象はウクレレ。5週間・1日15分で、弾き語り3曲を通せる状態を目指す。

## 開発

    npm install
    npm run dev      # 開発サーバ
    npm test         # テスト
    npm run lint     # 型チェック
    npm run build    # 本番ビルド

## 設計と方針

- 設計仕様: `docs/superpowers/specs/`
- 実装プラン: `docs/superpowers/plans/`

## 掲載曲の著作権

サイト内に掲載する曲は、日本と米国の両方で保護期間が満了したものに限る。
判定基準と各曲の根拠は `docs/songs-licensing.md`（楽譜ライブラリを作るプランCで追加）に
記録し、テストで機械的に検査する。
