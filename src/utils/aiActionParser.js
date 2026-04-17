export function parseActions(rawText) {
  // Try [ACTIONS: {...}] format (primary)
  const bracketMatch = rawText.match(/\[ACTIONS:\s*([\s\S]*?)\]\s*$/);
  if (bracketMatch) {
    const cleanContent = rawText.replace(/\[ACTIONS:[\s\S]*?\]\s*$/, '').trim();
    try {
      const actions = JSON.parse(bracketMatch[1]);
      return { actions, cleanContent };
    } catch {
      return { actions: null, cleanContent, parseError: true };
    }
  }

  // Try ```json ... ``` code block fallback
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    const cleanContent = rawText.replace(/```(?:json)?[\s\S]*?```/g, '').trim();
    try {
      const actions = JSON.parse(codeBlockMatch[1]);
      // Only treat as actions if it has known action keys
      if (actions && (actions.tasks || actions.habits || actions.goals || actions.dailyTodos || actions.weeklyPlans || actions.events)) {
        return { actions, cleanContent };
      }
    } catch {
      // not valid JSON, show as-is
    }
  }

  // Strip any bare JSON object that leaked into the response (last resort)
  const strippedContent = rawText
    .replace(/\[ACTIONS:[\s\S]*?\]/g, '')
    .replace(/```(?:json)?[\s\S]*?```/g, '')
    .trim();

  return { actions: null, cleanContent: strippedContent || rawText };
}
