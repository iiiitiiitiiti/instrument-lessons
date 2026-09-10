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

- 作者: Charles E. King（1874-1950）。**詞・曲ともに本人として扱う**（下の疑義を参照）
- 出版: 確認できた最古は1928年。`King's Book of Hawaiian Melodies` 第8版
  （Honolulu: C.E. King, ©1928）の内容細目に "Kaimana hila = Diamond head" がある
- 疑義と判断 — 英語版 Wikipedia は本曲を「1916年、Charles E. King 作、Andrew Cummings 補作」
  としている。この補作者は没年を追えず、そのままでは日本側の判定が確定しない。調べた結果:
  - 補作の記述に典拠が付いていない。同記事が挙げる唯一の参考文献（kalena.com =
    huapala の作曲者索引）は **King 単独**と記録している
  - huapala.org の本曲のページも「Words & music by Charles E. King」
  - UH Mānoa 図書館のハワイ音楽コレクション（1947年の録音）も作曲者を **King 単独**と記録
  - 補作者として名の挙がる **Andy Cummings は1913年生まれ**で、1916年の曲を共作できない。
    本人は1947年に本曲を録音しており、**録音者と作者の混同である可能性が高い**

  以上から、**機関2件の記録に従い King 単独として扱う**。補作が裏付けられた場合は再検討する
- 出典:
  - <https://www.huapala.org/Kai/Kaimana_Hila.html>
  - <https://search.library.wisc.edu/catalog/9910067489802121>（UW-Madison。第8版 ©1928 の内容細目）
  - <https://digital.library.manoa.hawaii.edu/items/show/37997>（UHM Library。Composer: Charles E. King）
  - <https://en.wikipedia.org/wiki/Charles_E._King>（1874-1950）
- 検証日: 2026-09-11

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
