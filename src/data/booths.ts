/**
 * Booths from the brochure's "LAYOUT FURNI BLOC" page. Every booth is 4,3 × 5 m.
 * Tenant names are NOT public yet (we don't have the list): add `tenant: 'Nama'` here and the floor plan shows it, no markup change.
 */
export interface Booth { code: string; tenant?: string }

const make = (letter: string, n: number): Booth[] => Array.from({ length: n }, (_, i) => ({ code: `${letter}${i + 1}` }));

export const BOOTH_SIZE = '4,3 × 5 m';

export const booths: Booth[] = [
  ...make('A', 7),   // left column, A7 at the top
  ...make('B', 6),   // centre blocks, 6 at the top
  ...make('C', 6),
  ...make('D', 6),
  ...make('E', 6),   // right column, E6 at the top; KASIR sits below E1
];

export const boothByCode = (code: string) => booths.find((b) => b.code === code);
