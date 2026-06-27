import { getNextWeeklyResetDate, getNextMonthlyResetDate } from './src/utils/date';

const child = {
  id: '1',
  points: 100,
  xp_in_level: 0,
  level: 1,
  weekly_xp: 0,
  monthly_xp: 0
};

const addedXp = 10;
const now = new Date();

let weeklyXp = child.weekly_xp || 0;
let nextWeeklyReset = child.weekly_reset_date ? new Date(child.weekly_reset_date) : null;

if (!nextWeeklyReset || now >= nextWeeklyReset) {
  weeklyXp = 0; // The week rolled over!
  nextWeeklyReset = getNextWeeklyResetDate(now);
}
weeklyXp += addedXp;

console.log("Weekly XP:", weeklyXp);
console.log("Next Reset:", nextWeeklyReset);
