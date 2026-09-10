export type Tuning = {
  strings: { label: string; note: string }[];
};

/** ウクレレの標準チューニング GCEA（High-G）。4弦から1弦の順に並べる。 */
export const UKULELE_TUNING: Tuning = {
  strings: [
    { label: "4弦", note: "G4" },
    { label: "3弦", note: "C4" },
    { label: "2弦", note: "E4" },
    { label: "1弦", note: "A4" },
  ],
};
