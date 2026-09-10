import type { Instrument } from "../core/lesson/types";
import { UKULELE } from "./ukulele/instrument";

export const INSTRUMENTS: Instrument[] = [UKULELE];

export function findInstrument(slug: string): Instrument | undefined {
  return INSTRUMENTS.find((instrument) => instrument.slug === slug);
}
