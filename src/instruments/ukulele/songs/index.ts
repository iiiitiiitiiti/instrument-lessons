import { alohaOe } from "./aloha-oe";
import { kaimanaHila } from "./kaimana-hila";
import { kuuPuaIPaoakalani } from "./kuu-pua-i-paoakalani";
import { palolo } from "./palolo";
import { saints } from "./saints";
import type { Song } from "./types";

export type { Song, SongAuthor, SongAuthorRole, SongLicensing } from "./types";

/**
 * 掲載する曲。
 *
 * 並びはコースで出てくる順。曲を足すときは docs/songs-licensing.md への追記も必須で、
 * tests/ukulele/songs.test.ts が記録漏れを検出する。
 */
export const UKULELE_SONGS: Song[] = [saints, alohaOe, kaimanaHila, kuuPuaIPaoakalani, palolo];

export function findSong(id: string): Song | undefined {
  return UKULELE_SONGS.find((song) => song.id === id);
}
