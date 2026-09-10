import { useParams } from "react-router-dom";
import { findInstrument } from "../instruments/registry";
import { NotFoundPage } from "./NotFoundPage";

/**
 * 楽譜ライブラリのルートを、楽器が持つ画面へ振り分ける。
 *
 * 曲データを core 側で扱わないのは、曲がコードや進行を持つためで、
 * 弦もコードも持たない楽器（オタマトーンなど）と共通化できない（DDR 001）。
 */
export function SongLibraryListRoute() {
  const { instrumentSlug = "" } = useParams();
  const instrument = findInstrument(instrumentSlug);
  if (!instrument?.songLibrary) return <NotFoundPage />;
  const { ListPage } = instrument.songLibrary;
  return <ListPage instrument={instrument} />;
}

export function SongLibraryDetailRoute() {
  const { instrumentSlug = "" } = useParams();
  const instrument = findInstrument(instrumentSlug);
  if (!instrument?.songLibrary) return <NotFoundPage />;
  const { DetailPage } = instrument.songLibrary;
  return <DetailPage instrument={instrument} />;
}
