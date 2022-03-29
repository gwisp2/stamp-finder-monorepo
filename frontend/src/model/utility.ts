export function parseNumber(s: undefined): undefined;
export function parseNumber(s: string): number | null;
export function parseNumber(s: string | undefined): number | null | undefined;
export function parseNumber(s: string | undefined): number | null | undefined {
  if (s === undefined) {
    return undefined;
  }
  if (s.length !== 0) {
    const n = Number(s);
    return !isNaN(n) ? n : null;
  } else {
    return null;
  }
}

export const toString = (n: number | null): string => {
  return n?.toString() ?? '';
};
