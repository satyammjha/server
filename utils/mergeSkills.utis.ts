export function mergeSkills(manual: string[], resume: string[]) {
  return Array.from(
    new Set([
      ...manual.map(s => s.toLowerCase().trim()),
      ...resume.map(s => s.toLowerCase().trim()),
    ])
  );
}