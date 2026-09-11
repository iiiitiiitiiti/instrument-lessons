import type { Curriculum } from "../../core/lesson/types";

export const UKULELE_CURRICULUM: Curriculum = {
  stages: [
    { number: 0, title: "準備" },
    { number: 1, title: "最初の音" },
    { number: 2, title: "コードを増やす" },
    { number: 3, title: "リズムを作る" },
    { number: 4, title: "歌と合わせる" },
    {
      number: 5,
      title: "人と合わせる",
      comingSoon: true,
      plannedTopics: [
        "移調とカポ：歌いやすいキーへ移す",
        "イントロ・エンディングとターンアラウンド",
        "他の楽器や歌に合わせる伴奏",
        "耳コピ入門",
      ],
    },
  ],
  lessons: [
    { id: "uk-01", number: 1, title: "ウクレレの各部と持ち方", stage: 0, days: [1, 1], newChords: [], goal: "構えが安定し、音が出る" },
    { id: "uk-02", number: 2, title: "チューニング", stage: 0, days: [2, 2], newChords: [], goal: "4本の弦を自力で合わせられる" },
    { id: "uk-03", number: 3, title: "右手：弦を1本ずつ鳴らす", stage: 1, days: [3, 3], newChords: [], goal: "4本すべてを均等に鳴らせる" },
    { id: "uk-04", number: 4, title: "ダウンストロークと4拍のカウント", stage: 1, days: [4, 5], newChords: [], goal: "メトロノームに合わせて4拍刻める" },
    { id: "uk-05", number: 5, title: "はじめてのコード C", stage: 1, days: [6, 7], newChords: ["C"], goal: "C を鳴らしながら4拍刻める" },
    { id: "uk-06", number: 6, title: "F と、コードチェンジの練習法", stage: 2, days: [8, 10], newChords: ["F"], goal: "C と F を1小節ごとに替えられる" },
    { id: "uk-07", number: 7, title: "G7 とスリーコード", stage: 2, days: [11, 13], newChords: ["G7"], goal: "C・F・G7 を止まらず回せる" },
    {
      id: "uk-08", number: 8, title: "課題曲① 聖者の行進", stage: 2, days: [14, 16], newChords: [],
      goal: "1曲を通して演奏できる",
      song: { id: "saints", title: "聖者の行進", chords: ["C", "F", "G7"] },
    },
    { id: "uk-09", number: 9, title: "アップストロークと8ビート", stage: 3, days: [17, 19], newChords: [], goal: "ダウンとアップを均等に刻める" },
    { id: "uk-10", number: 10, title: "定番パターン D-DU-UDU", stage: 3, days: [20, 22], newChords: ["C7"], goal: "パターンを保ったままコードを替えられる" },
    {
      id: "uk-11", number: 11, title: "課題曲② Aloha ʻOe", stage: 3, days: [23, 25], newChords: [],
      goal: "ストロークパターンで1曲通る",
      song: { id: "aloha-oe", title: "Aloha ʻOe", chords: ["C", "F", "G7"] },
    },
    { id: "uk-12", number: 12, title: "歌詞にコードを乗せて読む", stage: 4, days: [26, 27], newChords: [], goal: "コード譜を見ながら演奏できる" },
    { id: "uk-13", number: 13, title: "ハワイアン・ヴァンプと D7", stage: 4, days: [28, 30], newChords: ["D7"], goal: "D7・G7・C を2拍2拍4拍で弾ける" },
    {
      id: "uk-14", number: 14, title: "課題曲③ Kuʻu Pua i Paoakalani", stage: 4, days: [31, 33], newChords: [],
      goal: "1小節で2回替わる曲を通せる",
      song: {
        id: "kuu-pua-i-paoakalani",
        title: "Kuʻu Pua i Paoakalani",
        chords: ["C", "C7", "F", "G7", "D7"],
      },
    },
    { id: "uk-15", number: 15, title: "よく出るコードと、止まらずに通す練習法", stage: 4, days: [34, 35], newChords: ["Am", "Em", "Dm", "A7"], goal: "外部のコード譜を自力で使える" },
  ],
};
