export const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const truncateText = (text, maxLength = 50000) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '\n\n[Content truncated due to length limits]';
};
