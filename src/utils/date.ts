export const getCurrentWeekKey = (d = new Date()) => {
  // Use ISO week logic (starts on Monday)
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
};

export const getCurrentMonthKey = (d = new Date()) => {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

/** Returns the midnight Date object for the upcoming Monday. If today is Monday, it returns next Monday. */
export const getNextWeeklyResetDate = (d = new Date()): Date => {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0); // midnight
  // getDay() -> 0=Sun, 1=Mon, ..., 6=Sat
  // We want next Monday.
  const daysUntilNextMonday = (1 + 7 - result.getDay()) % 7 || 7; 
  result.setDate(result.getDate() + daysUntilNextMonday);
  return result;
};

/** Returns the midnight Date object for the 1st of the next month. */
export const getNextMonthlyResetDate = (d = new Date()): Date => {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
};

/** 
 * Returns the timestamp for the start of the current "day" cycle.
 * The daily reset happens at 4:00 AM local time instead of midnight,
 * allowing late-night activities to count towards the previous day.
 */
export const getStartOfDailyReset = (d = new Date()): number => {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 4, 0, 0, 0);
  if (d.getTime() < result.getTime()) {
    result.setDate(result.getDate() - 1);
  }
  return result.getTime();
};


export const getLogicalDateString = (date: Date | string) => {
  const d = new Date(date);
  d.setHours(d.getHours() - 4);
  return d.toDateString();
};
