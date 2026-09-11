/**
 * 楽譜ライブラリの曲データの型。
 *
 * 掲載できるのは日本と米国の両方で保護期間が満了した曲だけ（DDR 004）。判定に必要な
 * 記録を必須フィールドとして持たせ、欠けたらテストでビルドを落とす。仕様 §6 の
 * 「権利情報のビルド時強制」を型で表したもの。
 */

export type SongAuthorRole = "lyrics" | "music" | "both";

export type SongAuthor = {
  name: string;
  role: SongAuthorRole;
  /**
   * 没年。伝承曲・作者不詳は "traditional"。
   *
   * 分かっている作者は全員書く。1人でも没年を追えない曲は掲載しない。
   * 作曲者だけを見て判断すると、作詞者が保護期間中の曲を通してしまう。
   */
  died: number | "traditional";
};

export type SongLicensing = {
  /** 分かっている作者を全員。 */
  authors: SongAuthor[];
  /**
   * 確認できた最も古い出版年。伝承曲で特定できない場合は "traditional"。
   *
   * 「初出版年」ではなく「確認できた最古」にしているのは、これより古い出版が
   * ありうるため。米国側の判定（1929年より前の出版）には確認できた年で足りる。
   */
  earliestPublication: number | "traditional";
  /** earliestPublication が "traditional" のときの、米国側の根拠。 */
  usBasis?: string;
  /** 検証した日。 */
  verifiedOn: string;
  /** 出典。1件以上。機関の記録を優先する。 */
  sources: string[];
  /** 判定に残る疑義。docs/songs-licensing.md にも同じことを書く。 */
  caveat?: string;
};

export type Song = {
  id: string;
  title: string;
  /** ハワイ語などの原題が別にある場合。 */
  altTitle?: string;
  /** 使うコード。名前順で持つ。 */
  chords: string[];
  /**
   * 1小節ずつのコード。長さが小節数になる。
   *
   * 原譜を出典に、小節への割り振りはこの教材が決める。Web のコード譜は他人の編曲なので
   * 写さない。画面には「この教材の進行」と明記する。
   */
  progression?: string[];
  /** 歌詞コード譜（SongSheet の記法）。歌詞を裏取りできた曲だけ持つ。 */
  sheet?: string;
  /**
   * 譜面の出どころと、初心者向けに変えた点。
   *
   * 原典のコードを外したり置き換えたりした場合は、ここに必ず書く。書かないと、
   * 簡略化したコードを原曲どおりだと読み手が受け取ってしまう。
   */
  arrangement?: string;
  /** この教材の課題曲なら、そのレッスン ID。 */
  lessonId?: string;
  licensing: SongLicensing;
  /** 1〜2文の紹介。 */
  note?: string;
};
