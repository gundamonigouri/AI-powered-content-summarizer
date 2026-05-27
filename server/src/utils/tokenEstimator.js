/**
 * Rough token estimate (~4 chars per token for English text).
 * Groq bills by tokens; this is an approximation for UI display.
 */
export const estimateTokens = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
};

export const estimateSummaryTokens = (inputTokens, length = 'medium') => {
  const ratios = { short: 0.15, medium: 0.3, long: 0.5 };
  const ratio = ratios[length] || ratios.medium;
  return Math.max(50, Math.ceil(inputTokens * ratio));
};
