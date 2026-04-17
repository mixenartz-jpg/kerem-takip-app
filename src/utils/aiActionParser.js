export function parseActions(rawText) {
  const match = rawText.match(/\[ACTIONS:\s*([\s\S]*?)\]\s*$/);
  const cleanContent = rawText.replace(/\[ACTIONS:[\s\S]*?\]\s*$/, '').trim();
  if (!match) return { actions: null, cleanContent };
  try {
    const actions = JSON.parse(match[1]);
    return { actions, cleanContent };
  } catch {
    return { actions: null, cleanContent, parseError: true };
  }
}
