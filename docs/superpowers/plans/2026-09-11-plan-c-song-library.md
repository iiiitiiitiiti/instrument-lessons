# プランC 楽譜ライブラリ

- 日付: 2026-09-11
- 前提: プランA（基盤）・プランB相当（練習ツール7種 + 全15レッスン）は公開済み。`main` = `81c53ca`
- 正本: `docs/superpowers/specs/2026-09-10-instrument-lessons-design.md` §5・§6・§10

## 1. 何を作るか

`/ukulele/songs` に、権利の裏取りを通った曲だけを一覧するページと、曲ごとの個別ページを置く。

**成功条件**（すべて満たして完了とする）

- 曲データに権利の検証記録が必須で、欠けるとテストが落ちてビルドできない
- `/ukulele/songs` が進捗連動の絞り込み（今の自分が弾ける曲）で動く
- Lesson 11・14 について、**進行を出典付きで確定させて譜面を入れる。または確定できない理由を
  `docs/songs-licensing.md` の保留節へ記録する**（どちらかを必ず満たす）
- `docs/songs-licensing.md` に、人が読める形で同じ検証記録が残る
- 仕様 §5・§6 を実装に合わせて改訂し、DDR を1本書く

**使う人**: 全15レッスンを終えたあと、あるいは途中で「今習ったコードで弾ける曲」を探す学習者。

## 2. 調べて分かっている事実

推測ではなく実物を読んで確認した。

### 実装側

- **ルーティングを2本足す必要がある。** 現在 `src/routes.tsx` の `/:instrumentSlug/:lessonSlug` は
  `/ukulele/songs` にも当たるが、LessonPage 側の判定に外れて NotFound 表示になる。
  `/ukulele/songs/saints`（深さ3）は `*` にだけ当たる。react-router 7.18.3 の `computeScore` は
  静的セグメント10・動的3なので、`/:instrumentSlug/songs` を足せば `/:lessonSlug` に勝つ
- `/otamatone/songs` も新ルートに当たる。**曲を持たない楽器の場合の表示をページ側で書く**
- **「今の自分が弾ける曲」は既存データで組める。** uk-05 C / uk-06 F / uk-07 G7 / uk-10 C7 /
  uk-13 D7 / uk-15 Am・Em・Dm・A7。進捗の `completedLessonIds` と突き合わせれば習得済みコードになる
- **`UKULELE_CHORDS` は10種しか持たない**（C, F, G7, C7, D7, Am, Em, Dm, A7, Bb）。G・E7・A・D などは無い。
  曲を足すたびに `chords.ts` へ形を追加する作業が発生する。**レッスンで導入しないコードを使う曲は、
  「今の自分が弾ける曲」へ永久に出ない**（それでよい。一覧には出る）
- **課題曲3曲は `curriculum.ts` の `Lesson.song`（`SongRef`）に既にある。** 持っているのは
  `id` / `title` / `chords` だけ。**`songs.ts` と二重管理になるので、一致をテストで検査する**
- **`SongSheet` は完成済み**（DDR 013）。記法は `[C]歌詞` だけで、小節線と拍を持たない

### 権利側（実際に引いた）

権利判定は DDR 004 の二重基準。**日本: 作詞者・作曲者の全員が1967年12月31日までに没**、
**米国: 初出版が1929年より前**。

| 曲 | 分かったこと | 残る不明 |
|---|---|---|
| Aloha ʻOe | 詞・曲ともに Liliʻuokalani（1838-1917）。1884年出版。huapala.org が「Words and music by Queen Liliʻuokalani」と記録 | なし |
| Kaimana Hila | huapala.org と UH Mānoa 図書館はどちらも作者を Charles E. King（1874-1950）単独と記録。1916年刊 `King's Book of Hawaiian Melodies`（Honolulu: Charles E. King）に "Kaimana hila = Diamond head" が収録（UW-Madison 目録の内容細目） | 仕様が書く補作者（下記） |
| On the Beach at Waikiki | 作曲 Henry Kailimai は1948年没。楽譜は Sherman, Clay & Co. から1915〜1916年 | **作詞 G. H. Stover の没年が不明。判明しなければ掲載しない** |
| Kāua i ka Huahuaʻi | 詞・曲ともに Prince Leleiohoku II（1854-1877）。1860年代の作 | **初出版年が不明。作曲年は出版年ではない** |

#### 仕様 §6 の記述に疑義が1つある

仕様の課題曲表は Kaimana Hila を「Charles E. King（**Andrew Cummings 補作**）」としている。
**この補作者は没年を追えず、そのままでは日本側の判定が確定しない。** 調べた結果:

- 補作の記述の出どころは英語版 Wikipedia のスタブ記事で、その主張に典拠が付いていない。
  同記事が挙げる唯一の参考文献（kalena.com = huapala の作曲者索引）は King 単独と記録している
- 「Andy Cummings」（1913年生、ハワイの著名なミュージシャン。1947年に本曲を録音）は
  **1916年の曲を共作できない**。補作者の記述はこの人物との混同である可能性が高い

**判断: huapala.org と UH Mānoa の記録に従い King 単独として扱う。** ただし
`songs-licensing.md` にこの疑義と判断の根拠を書き残し、補作が裏付けられた場合は再検討する。
仕様 §6 の表も同様に改訂する。

**この1件が、プランが警告する「作者の1人が追えない」型の実例。** 外部曲ではなく課題曲で起きた。

## 3. 決めたこと

### 3-1. 収録は「検証を通った曲だけ」。12曲に届かなくてもよい

**曲数を目標にしない。** 裏取りできない曲は落とし、残った数で公開する。

理由: 掲載可否の判断を曲数の都合で緩めると、DDR 004 の二重基準が意味を失う。
仕様の「15曲」は候補の目標値であって、掲載の合格ラインではない。

未確定の曲は捨てずに `docs/songs-licensing.md` の「保留」節へ、**何が分からないかを書いて残す**。

### 3-2. 曲データは1曲1ファイル

```
src/instruments/ukulele/songs/
  index.ts        UKULELE_SONGS（配列）
  types.ts        Song / SongLicensing / SongAuthor
  saints.ts
  aloha-oe.ts
  kaimana-hila.ts
```

仕様 §5 の木は `content/ukulele/songs/*.ts` としているが **`src/` 側へ置く**。`content/` は
MDX 本文の置き場で、Vite の MDX プラグインが処理する対象。曲データは TypeScript の値で、
型検査とテストの対象になる。既存の `chords.ts` / `curriculum.ts` と同じ性質なので隣に置く。

1曲1ファイルにするのは、ステップ8を1曲＝1コミットで進めるため。差分がその曲に閉じる。

### 3-3. 型

```ts
export type SongAuthor = {
  name: string;
  /** 詞・曲・両方のどれを担ったか。 */
  role: "lyrics" | "music" | "both";
  /** 没年。伝承曲・作者不詳は "traditional"。 */
  died: number | "traditional";
};

export type SongLicensing = {
  /** 分かっている作者を全員。1人でも没年が追えなければ掲載しない。 */
  authors: SongAuthor[];
  /** 初出版年。伝承曲で特定できない場合は "traditional"。 */
  firstPublished: number | "traditional";
  /** firstPublished が "traditional" のときの、米国側の根拠を1文で。 */
  usBasis?: string;
  verifiedOn: string;   // "YYYY-MM-DD"
  sources: string[];    // 1件以上
  /** 判定に残る疑義。あれば songs-licensing.md にも同じことを書く。 */
  caveat?: string;
};

export type Song = {
  id: string;
  title: string;
  /** ハワイ語などの原題が別にある場合。 */
  altTitle?: string;
  /** 使うコード。名前順で持つ。 */
  chords: string[];
  /** 1小節ずつのコード。長さが小節数になる。この教材の進行（3-6）。 */
  progression?: string[];
  /** 歌詞コード譜（SongSheet の記法）。裏取りできた曲だけ持つ。 */
  sheet?: string;
  /** この教材の課題曲なら、そのレッスン ID。 */
  lessonId?: string;
  licensing: SongLicensing;
  /** 1〜2文の紹介。 */
  note?: string;
};
```

**`authors` を配列にしたのが要点。** 単数だと Kaimana Hila の補作者問題（§2）を書けず、
共作曲を1人に丸めてしまう。**`firstPublished` に `"traditional"` を許すのも必要**で、
聖者の行進のような伝承曲は初出版年が定まらない。その場合は `usBasis` で米国側の根拠を書かせる。

`progression` と `sheet` は**任意**。権利は通っても進行や歌詞を裏取りできない曲がありうる。

### 3-4. 権利検証はテストでビルドを落とす

`tests/ukulele/songs.test.ts` で全曲を検査する。

権利:

- `authors` が1件以上。全員の `died` が 1967 以下、または `"traditional"`
- `firstPublished` が 1929 未満、**かつ 1700 以上**（`195` のような打ち間違いを通さない）。
  `"traditional"` の場合は `usBasis` が非空
- `died` も同じ範囲検査（1700〜1967）
- `sources` が1件以上、かつすべて `https://` で始まる
- `verifiedOn` が `YYYY-MM-DD` の形で、**未来の日付でない**
- `caveat` があるなら `songs-licensing.md` にも同じ曲の節がある

整合:

- `id` が重複していない
- `chords` のすべてが `UKULELE_CHORDS` に定義済み、**かつ名前順に並んでいる**
- `progression` / `sheet` があるなら、そこに出てくるコードの集合が `chords` と**一致**する
  （部分集合ではなく一致。余分なコードが `chords` にあると絞り込みが狂う）
- `lessonId` があるなら、そのレッスンが `curriculum.ts` にある。
  さらに `lesson.song.id === song.id` かつ `lesson.song.chords` と `song.chords` が一致する
  （二重管理の破れを検出）
- **`docs/songs-licensing.md` に全曲の `id` が現れている**（記録漏れの検出）

### 3-5. 画面

**一覧 `/ukulele/songs`**

- 絞り込み3つ: **今の自分が弾ける曲**（進捗から習得済みコードを出す）/ コード数（3 / 4 / 5以上）/
  セーハを含むか
- 各行に、曲名・使うコード・小節数・課題曲バッジ
- 絞り込みは URL や localStorage へ持たせない。1画面で完結する道具なので、
  状態を持ち回る利点が薄い
- 曲を持たない楽器では「この楽器の曲はまだありません」を出す
- **一覧の冒頭に「権利の検証を通った曲だけを載せている」と明記する**

**個別 `/ukulele/songs/:songId`**

- 曲名・紹介・使うコードの図（`ChordRow` + `ChordDiagram`）
- `sheet` があれば `SongSheet`、無ければ `progression` の表、両方無ければコードだけ
- **権利情報を畳んだ状態で常に載せる**（`<details>`）。作者・役割・没年・初出版年・出典・疑義
- 見つからない `songId` は NotFound へ

権利情報をサイト側にも置くのは、掲載根拠を読み手が確かめられるようにするため。
`docs/songs-licensing.md` はリポジトリを見る人向けで、サイトの読み手には届かない。

### 3-6. 「進行の裏取り」の意味を決める

**進行は原譜（PD の楽譜）を出典に、小節への割り振りはこの教材が決める。**

Web のコード譜サイトの譜は**他人の編曲**で、写すとそれ自体が問題になる。一方、原譜から
初心者キーへ移して小節へ割り振る作業は編曲そのもので、引用元は存在しない。

したがって Lesson 08 と同じ扱いに揃える。**「この教材の進行」と明記し、歌に合わせてずれたら
歌のほうに合わせてよいと書き添える。** 出典欄には原譜（1884年版など）を記録する。

これは DDR 011 が心配した「裏取りのない表を正解として練習してしまう」への答えでもある。
正解として出さず、この教材の型として出す。

## 4. ファイル構成

| ファイル | 変更 |
|---|---|
| `src/instruments/ukulele/songs/types.ts` | 新規。`Song` / `SongLicensing` / `SongAuthor` |
| `src/instruments/ukulele/songs/index.ts` | 新規。`UKULELE_SONGS` |
| `src/instruments/ukulele/songs/<id>.ts` | 新規。1曲1ファイル |
| `src/core/progress/learnedChords.ts` | 新規。進捗＋カリキュラム→習得済みコード（純関数） |
| `src/pages/SongsPage.tsx` / `.css` | 新規。一覧 |
| `src/pages/SongPage.tsx` / `.css` | 新規。個別 |
| `src/routes.tsx` | ルート2本を追加 |
| `src/pages/CoursePage.tsx` | 一覧への入口を追加 |
| `docs/songs-licensing.md` | 新規 |
| `tests/ukulele/songs.test.ts` | 新規。権利と整合の検査 |
| `tests/core/learnedChords.test.ts` | 新規 |
| `tests/routing.test.tsx` | ルート2本の検査を追加 |
| 仕様 §5・§6 | 実装に合わせて改訂 |
| `docs/decisions/014_*.md` | 新規 |

### 主な関数

```ts
/** 完了したレッスンで導入されたコードを集める。 */
export function learnedChords(curriculum: Curriculum, completedLessonIds: string[]): string[];

/** 曲が、習得済みコードだけで弾けるか。 */
export function isPlayable(song: Song, learned: string[]): boolean;

/** 曲がセーハを含むか。UKULELE_CHORDS の barre から判定する。 */
export function usesBarre(song: Song): boolean;
```

`learnedChords` を `core/` に置くのは、進捗とカリキュラムだけを見る処理で楽器を知らないため。
`isPlayable` と `usesBarre` はコードを知るので `instruments/ukulele/` 側。

## 5. 実装ステップ

1ステップごとに検証してから次へ進む。

| # | やること | 完了確認 |
|---|---|---|
| 1 | 型と `docs/songs-licensing.md` の枠。課題曲3曲を**裏取りしながら**書く（仕様 §6 は初出版年も出典 URL も持っていないので「移す」では済まない） | `npx vitest run` |
| 2 | `songs.test.ts`。**わざと違反データを入れて各検査が落ちることを確認** | 落ちる → 直す → 通る |
| 3 | ルート2本 + 殻だけのページ2枚。**LessonPage に食われないことをテストで確認** | `tests/routing.test.tsx` |
| 4 | `learnedChords` / `isPlayable` / `usesBarre` を書いてテスト | 単体テスト |
| 5 | 一覧ページの中身 + 絞り込み | 実ブラウザ 320px・進捗あり／なし |
| 6 | 個別ページの中身 | 実ブラウザで3曲 |
| 7 | Aloha ʻOe・Kaimana Hila の進行を原譜から起こし、レッスンへ譜面を追加（3-6 の扱い） | 実ブラウザ・出典を記録 |
| 8 | ハワイアン曲を1曲ずつ裏取りして追加。**1曲＝1コミット**。必要なコード形は `chords.ts` へ足す | 曲ごとにテストが通る |
| 9 | コース概要から一覧への入口。仕様 §5・§6 の改訂と DDR 014 | 実ブラウザ・textlint |

ステップ8は**通った曲だけ**を足す。落とした曲は `songs-licensing.md` の保留節へ。

### 裏取りの手順（ステップ1・7・8で毎回これを踏む）

1. **作者を全員洗い出す。** 1人でも没年が追えなければ掲載しない
2. 没年・出版年の**数値は生 HTML か Playwright で確かめる**（WebFetch は数値を作る。
   per-machine memory `webfetch-hallucination-risk`）
3. 出典は**機関の記録を優先する**（図書館目録・LoC・Smithsonian・huapala.org）。
   Wikipedia のスタブや典拠なしの記述は、それ単独では根拠にしない
4. 初出版年は楽譜の出版記録で取る。**作曲年を出版年として使わない**
5. 歌詞は歌詞アーカイブを出典として記録する
6. 日本1967 / 米国1929 の両方を満たすことを確認してから書く
7. 判定に残る疑義は `caveat` と `songs-licensing.md` の両方へ書く

### `docs/songs-licensing.md` の書式

曲ごとに `### <title>（id: <song-id>）` の節を作る。`id:` の形で書くのは、
ステップ2の記録漏れ検査がこの文字列を探すため。節の中に作者・没年・初出版年・出典・疑義を書く。

## 6. 却下した案

- 却下: **曲数を15に合わせるため、判定を「日本のみ」に緩める** — サイトは GitHub Pages
  （米国ホスト）で公開している。DDR 004 の二重基準はそのための判定なので、緩めると
  判定そのものが無意味になる
- 却下: **権利を実行時に検査する** — 画面へ警告を出す形。だが公開されてからでは遅い。
  ビルドを落とすほうが、間違ったデータが公開面に出ない
- 却下: **曲データを MDX にする** — レッスン本文と同じ流儀に見える。しかし曲は構造化データで、
  絞り込みのために機械が読む。MDX では型検査とテストが効かない
- 却下: **1ファイルに全曲を書く** — 見通しはよい。しかし1曲＝1コミットで進めると、
  毎回同じファイルが膨らんで差分が読めなくなる
- 却下: **`SongRef.chords` を廃止して曲データから引く** — 二重管理は消える。しかし
  `curriculum.ts` は core の型だけで完結しており、曲データへ依存させると
  レッスン一覧の描画が曲データの読み込みを待つ。**一致をテストで担保するほうが軽い**
- 却下: **一覧の絞り込み状態を URL クエリに持たせる** — 共有できる利点はある。だが1画面で
  完結する道具なので、共有する動機が薄い。ルーティングの複雑さだけが増える
- 却下: **Web のコード譜サイトから進行を写す** — 早い。しかしそれは他人の編曲で、
  写すこと自体が権利の問題になる。原譜から起こして「この教材の進行」と明記する（3-6）
- 却下: **裏取りをまとめて12曲分やってから実装する** — 効率的に見える。だが1曲でも
  判定を間違えると全体を見直すことになる
- 却下: **`progression` と `sheet` を必須にする** — データが揃って見える。しかし権利は通っても
  進行や歌詞を裏取りできない曲を捨てることになり、一覧の価値が下がる

## 7. リスク

- **最大のリスクは、裏取りが甘くなって保護期間中の曲を載せること。** 特に「作者の1人が追えない」型。
  Kaimana Hila で実際に起きた（§2）。歯止めはステップ2のテスト（全作者の没年が必須）と、
  手順1の「1人でも追えなければ掲載しない」の2つ。テストは没年の**存在**しか見られず
  **正しさ**は見られないので、最後は手順の遵守にかかる
- 収録が数曲に留まる可能性がある。そのときは一覧ページに検証の方針を明記する
- 曲を足すたびに `chords.ts` へコード形を追加する作業が発生する。レッスンで導入しない
  コードを使う曲は「今の自分が弾ける曲」へ出ないままになる（仕様どおりで、不具合ではない）

## 8. この判断が間違いだったと分かる条件

一覧ページを作っても、掲載できる曲が課題曲3曲だけだったとき。その場合、ライブラリという
形自体が過剰で、課題曲を並べるだけの節をコース概要に置けば足りた。

## プランレビュー

- レビュアー: fable-advisor（Fable 5。作成は Opus 5 なので別モデル。`model-routing` に従う）
- 主な指摘と反映:
  - **`lyricist` と `composer` が単数で、仕様 §6 自身が書く Kaimana Hila の補作者を表現できない。**
    ステップ1で最初に躓く → `authors: SongAuthor[]` へ変更（3-3）。あわせて補作者問題を
    自分で調べ直し、§2 に判断と根拠を書いた
  - **`firstPublished: number` は伝承曲で値が定まらない** → `number | "traditional"` にし、
    `"traditional"` のときは `usBasis` を必須にした（3-3・3-4）
  - **`SongRef.chords` との二重管理** → `lessonId` 経由の一致検査をテストへ追加（3-4）。
    `SongRef.chords` の廃止は却下（§6 に理由）
  - **機械検査できるのに無い項目** → 年の範囲・`verifiedOn` が未来でない・コード集合の一致
    （部分集合でなく）・`chords` の名前順・`lessonId` の整合を追加（3-4）
  - **`UKULELE_CHORDS` が10種しかない** → §2 と §7 に明記し、ステップ8へ作業として書いた
  - **ルーティングのテストは描画先が要る** → 「ルート2本 + 殻ページ2枚」をステップ3へ前倒しし、
    中身は5・6に分けた
  - **ステップ1は「移す」ではなく裏取りそのもの**（仕様 §6 は Aloha ʻOe の初出版年と出典 URL を
    持たない） → ステップ1へ裏取り手順を適用すると明記
  - **成功条件「Lesson 11・14 の断り書きが消える」は裏取り失敗で達成不能** →
    「確定させる、または確定できない理由を記録する」へ変更（§1）
  - **「進行の裏取り」が未定義。Web のコード譜は他人の編曲で写すと問題** → 3-6 を新設し、
    原譜を出典に割り振りは自作、Lesson 08 と同じ「この教材の進行」表記に揃えた
  - **プランAにある File Structure と Interfaces の節が無い** → §4 を新設
  - **`/otamatone/songs` も新ルートに当たる** → 曲を持たない楽器の表示を 3-5 に追加
  - **`songs-licensing.md` の書式（id をどう検出するか）が未定義** → §5 末尾に追加
  - 「`/ukulele/songs` が LessonPage に**食われる**は言い過ぎ（実際は LessonPage 内で
    NotFound 表示）」 → §2 の記述を事実に合わせて直した
- 見送った指摘: `SongRef.chords` の廃止のみ。理由は §6 に書いた
