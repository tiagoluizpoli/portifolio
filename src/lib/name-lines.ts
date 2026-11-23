/** Splits a name into two lines with the shortest possible longer line, for the Hero's display name. */
export function nameLines(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  let best: [string, string] = [name, ''];
  for (let cut = 1; cut < words.length; cut++) {
    const lines: [string, string] = [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
    if (Math.max(...lines.map((l) => l.length)) < Math.max(...best.map((l) => l.length))) best = lines;
  }
  return best;
}
