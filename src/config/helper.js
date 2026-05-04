/**
 * Helper utilities
 */

/**
 * Formats a date string to DD/MM/YYYY HH:mm
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Truncates text to a max length and appends "..."
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (text, maxLen = 80) => {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
};
