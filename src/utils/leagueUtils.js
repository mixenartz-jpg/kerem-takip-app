export function getLeague(totalNet) {
  if (totalNet >= 120) return { tier: 'gold', label: 'Altın Lig', color: '#f59e0b', icon: '🥇' };
  if (totalNet >= 60) return { tier: 'silver', label: 'Gümüş Lig', color: '#94a3b8', icon: '🥈' };
  return { tier: 'bronze', label: 'Bronz Lig', color: '#b45309', icon: '🥉' };
}

export function getNetDelta(scoreDoc) {
  const current = (scoreDoc.tytNet || 0) + (scoreDoc.aytNet || 0);
  const previous = (scoreDoc.previousTytNet || 0) + (scoreDoc.previousAytNet || 0);
  return current - previous;
}
