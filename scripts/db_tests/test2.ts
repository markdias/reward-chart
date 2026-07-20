export const getNextWeeklyResetDate = (d = new Date()): Date => {
  const result = new Date(d);
  result.setHours(0, 0, 0, 0); // midnight
  // getDay() -> 0=Sun, 1=Mon, ..., 6=Sat
  // We want next Monday.
  const daysUntilNextMonday = (1 + 7 - result.getDay()) % 7 || 7; 
  result.setDate(result.getDate() + daysUntilNextMonday);
  return result;
};
const now = new Date();
console.log(getNextWeeklyResetDate(now).toISOString());
