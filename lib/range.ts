/**
 * Encodes two tag names into a single URL segment using `--` as delimiter.
 */
export function encodeTagRange(from: string, to: string): string {
  if (from.includes("--") || to.includes("--")) {
    throw new Error("Tag names cannot contain '--'");
  }
  return `${encodeURIComponent(from)}--${encodeURIComponent(to)}`;
}

/**
 * Decodes the range segment back into [from, to].
 */
export function decodeTagRange(range: string): { from: string; to: string } {
  const idx = range.indexOf("--");
  if (idx === -1) {
    throw new Error("Invalid version range in URL");
  }
  const from = decodeURIComponent(range.slice(0, idx));
  const to = decodeURIComponent(range.slice(idx + 2));
  if (!from || !to) throw new Error("Invalid version range in URL");
  return { from, to };
}
