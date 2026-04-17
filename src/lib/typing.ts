export function calculateWPM(charCount: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((charCount / 5) / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 10000) / 100;
}

export function getTopWeakKeys(
  keyStats: Record<string, { attempts: number; errors: number }>,
  n: number = 5
): { key: string; errorRate: number; attempts: number; errors: number }[] {
  return Object.entries(keyStats)
    .filter(([, stats]) => stats.attempts >= 10)
    .map(([key, stats]) => ({
      key,
      errorRate: stats.errors / stats.attempts,
      attempts: stats.attempts,
      errors: stats.errors,
    }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, n);
}
