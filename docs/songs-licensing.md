# 掲載曲の権利検証記録

このサイトに掲載する曲は、**日本と米国の両方で保護期間が満了したものだけ**に限る。
判定の根拠は `docs/decisions/004_public-domain-requires-both-jp-and-us.md`。

- **日本** — 分かっている作詞者・作曲者の**全員**が1967年12月31日までに死亡している、または伝承曲
- **米国** — 1929年より前に出版されている

作曲者だけを見て判断すると事故る。**作詞・作曲の両方**を確認する。

## この記録の使い方

曲データ（`src/instruments/ukulele/songs/`）と、この文書は対で維持する。
`tests/ukulele/songs.test.ts` は、曲データの `id` がこの文書へ現れているかを検査する。
書き漏らすとビルドが落ちる。節の見出しは `### <曲名>（id: <song-id>）` の形で書く。

判定に疑義が残る曲は、その節に `- 疑義と判断 —` で始まる項を必ず置く。
曲データ側の `caveat` と対になっていることをテストが検査する。

出典は**機関の記録を優先する**（図書館目録・議会図書館・huapala.org など）。
Wikipedia のスタブや典拠のない記述は、それ単独では根拠にしない。

## 掲載中

### 聖者の行進（id: saints）

- 作者: 不詳（黒人霊歌）。伝承曲として扱う
- 出版: 単一の初出版を特定できない
- 米国側の根拠: 現行の歌は1900年代初頭に、同じ題を持つ複数のゴスペル曲から派生した。
  派生元は次の2曲とされる。
  - 1896年 "When the Saints Are Marching In"（詞 Katharine Purvis・曲 James Milton Black）
  - 1908年 "When the Saints March In for Crowning"

  録音は1923年の Paramount Jubilee Singers（Paramount 12073）が最初に知られている。
  そこから1928年まで商業録音が続いた。**どの経路でも1929年より前に世へ出ている**
- 出典:
  - <https://en.wikipedia.org/wiki/When_the_Saints_Go_Marching_In>
  - <https://www.umcdiscipleship.org/articles/history-of-hymns-when-the-saints-go-marching-in>
- 検証日: 2026-09-11

### Aloha ʻOe（id: aloha-oe）

- 作者: Queen Liliʻuokalani（1838-1917）。**詞・曲ともに本人**
- 出版: 確認できた最古は1915年（Century Music Pub. Co., Philadelphia）
- 補足: 1884年の出版が広く言われているが、こちらで確認できたのは1915年版。
  より古い出版はありうる。米国側の判定はこの年で足りる
- 出典:
  - <https://www.huapala.org/Aloha/Aloha_Oe.html>（Words and music by Queen Liliʻuokalani）
  - <https://levysheetmusic.mse.jhu.edu/collection/151/020>（Johns Hopkins Levy Music
    Collection。Composed by H.M. Queen Liliuokalani / Publication Date 1915）
  - <https://en.wikipedia.org/wiki/Liliuokalani>（1838-1917）
- 検証日: 2026-09-11

### Kaimana Hila（id: kaimana-hila）

- 作者: Charles E. King（1874-1950）。**詞・曲ともに本人**
- 出版: **1916年**。原譜に "Copyright, 1916, by Chas. E. King" と印刷されている
  - 現物は `King's Book of Hawaiian Melodies` 第5版（Honolulu: Charles E. King, 1923）の88ページ
  - この第5版は MIT Libraries がデジタル化し、米国で著作権なし
    （No Copyright - United States）と判定している
- 疑義と判断 — 英語版 Wikipedia は本曲を「1916年、Charles E. King 作、**Andrew Cummings 補作**」
  としている。この補作者は没年を追えない。そのままでは日本側の判定が確定しない。
  調べた結果は次のとおり。
  - **原譜（1923年版88ページ）の作者表記は "CHAS. E. KING" 単独**で、補作者の名は無い
  - 補作の記述に典拠が付いていない。同記事が挙げる唯一の参考文献（kalena.com =
    huapala の作曲者索引）は King 単独と記録している
  - huapala.org の本曲のページも「Words & music by Charles E. King」
  - UH Mānoa 図書館のハワイ音楽コレクション（1947年の録音）も作曲者を King 単独と記録
  - 補作者として名の挙がる **Andy Cummings は1913年生まれ**で、1916年の曲を共作できない。
    本人は1947年に本曲を録音しており、**録音者と作者の混同である可能性が高い**

  以上から、**原譜の表記に従い King 単独として扱う**
- 出典:
  - <https://archive.org/details/kingsbookofhawai00king>（原譜。1923年第5版。88ページ）
  - <https://www.huapala.org/Kai/Kaimana_Hila.html>
  - <https://digital.library.manoa.hawaii.edu/items/show/37997>（UHM Library。Composer: Charles E. King）
  - <https://en.wikipedia.org/wiki/Charles_E._King>（1874-1950）
- 検証日: 2026-09-11

## 譜面の状況

権利とは別に、**小節ごとのコードの割り振りと歌詞コード譜**が要る。

| 曲 | 進行の表 | 歌詞コード譜 | 出どころ |
|---|---|---|---|
| 聖者の行進 | あり | あり | この教材の進行（Lesson 08） |
| Aloha ʻOe | なし | 1番とサビ | 1923年版 130〜131ページ |
| Kaimana Hila | なし | 1番 | 1923年版 88ページ |

Aloha ʻOe と Kaimana Hila には進行の表を載せていない。**小節の途中でコードの替わる箇所が多い**ため。
進行の表は1小節1コードの形なので、原典どおりに書けない。歌詞コード譜なら替わる音節の位置をそのまま書ける。

### 1923年版のコード記号の読み方

`King's Book of Hawaiian Melodies` 第5版（1923年）は、全曲の譜表の上に **Ernest K. Kaʻai
（1881-1962）によるウクレレ・ギター用のコード記号**を付けている。同書の索引末尾にこう書かれている。

> For the convenience of ukulele and guitar players Mr. Ernest K. Kaai has indicated
> above the staff the chords used for the accompaniment of the songs in this book.

記号は `1G₂` `2A♭` のような形をしている。**同書に凡例は無い**（前付けと後付けを確認した）。
2曲の譜面を読み、次の規則で確定した。

- **文字はキー、数字はそのキーでの役割。** `1` は主和音、`2` は属七の和音
  - `1D♭` = D♭、`2A♭` = E♭7（A♭ の属七）、`2E♭` = B♭7、`2D` = A7、`2G` = D7
- 添字（`₁` `₂`）はコードの種類を変えない。押さえ方の違いと考えられる

**確かめ方。** 同じページのピアノ譜の臨時記号と突き合わせた。「文字がそのままコード名」と読む
規則では、次の臨時記号を説明できない。

- Aloha ʻOe「a-hi-hi le-hu-a」の小節。記号 `1D♭ — 2E♭ — 2A♭` の位置に合わせて臨時記号が出る。
  2拍目は D♮ で、A♭ 長調で D♮ を含むのは B♭7（= `2E♭`）。
  3拍目は D♭ で、D♭ を含む属七は E♭7（= `2A♭`）
- Kaimana Hila「la」の小節。記号 `2D` の頭に「♮♯」が付く。直前の E7 の G♯ を打ち消し、
  C♯ を立てる記号で、A7（= `2D`）と一致する。「D」と読むと C♯ は出ない
- Kaimana Hila「wa-ho ma」の小節。`1B₂` の位置に D♯ が出る。B 長調で、添字 `₂` が短調の印ではないと分かる

読み取った和声は、ハワイアンの定番（II7-V7-I の終止、IV-I-V7-I のサビ）とも合う。

**未解決。** OCR テキストでは数字 `3` の付く記号が2回だけ出る（`1` は190回、`2` は303回）。
OCR の誤読の可能性があり、2曲では使われていない。`3` を使う曲を足すときは、先にこれを確かめる。

**権利。** 編曲の Charles E. King は1950年没、コード記号の Ernest K. Kaʻai は1962年没で、
どちらも1967年以前。1923年の出版で、MIT Libraries が米国で著作権なしと判定している。

### 初心者向けに変えた点

原典のコードを、その曲を弾く時点で習っているコードに合わせた。変えた点は曲データの
`arrangement` にも書き、曲ページとレッスンの譜面の下に出している。

- **Aloha ʻOe** — 4行目「ʻāhihi」の「hi」に1拍だけ出る D7（原典は B♭7）を外した。
  D7 は Lesson 13 で習うため。結果として C7 を使わない。**カリキュラムと Lesson 11 は当初「C・C7・F・G7」と
  書いていたが、原典に C7 は無かった**ので、C・F・G7 に直した
- **Kaimana Hila** — 「mākou」の「mā」に1拍だけ出る E（原典は B）を、同じく F へ向かう C7 に置き換えた。
  「Kaʻalawai」の「wa」に1拍だけ出る A7（原典は E7）は外した。A7 は Lesson 15 で習うため

### 歌詞の表記

歌詞はコードの位置を決めた1923年版の譜面の語句に合わせ、綴り（ʻokina と長音記号）は huapala.org に合わせた。
Aloha ʻOe は huapala.org と2か所が異なる。

- 1行目: 1923年版「Haʻaheo **e** ka ua」／ huapala.org「Haʻaheo ka ua」
- 3行目: 1923年版「E **uhai** ana paha」／ huapala.org「E hahai (uhai) ana paha」

## 保留（掲載しない）

裏取りが済んでいないため掲載しない曲。**何が分からないか**を書いて残す。
出典が見つかったら再検討する。

### On the Beach at Waikiki

- 作曲 Henry Kailimai は1948年没で、日本側の条件を満たす
- 楽譜は Sherman, Clay & Co. から1915〜1916年に出ており、米国側の条件も満たす見込み
- **不明: 作詞 G. H. Stover の没年。** 作詞者が1967年より後に没していれば日本では保護期間中になる

### Kāua i ka Huahuaʻi

- 詞・曲ともに Prince Leleiohoku II（1854-1877）で、日本側の条件を満たす
- **不明: 出版年。** 1860年代の作とされるが、作曲年は出版年ではない。
  1929年より前の出版記録を見つける必要がある

## 除外（掲載できない）

判定を誤りやすい例。作曲者だけを見て判断すると通してしまう。

| 曲 | 除外理由 |
|---|---|
| 夕焼小焼 | 作詞の中村雨紅が1972年没。2042年まで保護 |
| 椰子の実 | 作曲の大中寅二が1982年没。2052年まで保護 |
| 赤とんぼ | 日本では満了しているが、1927年発表のため米国の保護が継続中 |
| Ke Kali Nei Au の英語詞 | 1958年の Hoffman / Manning 詞は保護期間中。King のハワイ語詞のみ扱う |
