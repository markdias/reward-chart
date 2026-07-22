import { getNextWeeklyResetDate, getNextMonthlyResetDate } from './src/utils/date.js';

const processXpGains = (child, addedXp) => {
    let newLevel = child.level || 1;
    let newXp = (child.xp_in_level || 0) + addedXp;
    let newPoints = child.points || 0;
    let bonusesReceived = child.level_up_bonuses_received || 0;

    const now = new Date();

    let weeklyXp = child.weekly_xp || 0;
    let nextWeeklyReset = child.weekly_reset_date ? new Date(child.weekly_reset_date) : null;
    
    if (!nextWeeklyReset || now >= nextWeeklyReset) {
      weeklyXp = 0; 
      nextWeeklyReset = getNextWeeklyResetDate(now);
    }
    weeklyXp += addedXp;

    const weeklyTarget = child.weekly_xp_target || 300;
    const weeklyReward = child.weekly_reward_points || 200;
    let lastWeeklyBonus = child.last_weekly_bonus_awarded;

    const currentWeekCycleId = nextWeeklyReset.toISOString();
    if (weeklyXp >= weeklyTarget && lastWeeklyBonus !== currentWeekCycleId) {
      newPoints += weeklyReward;
      lastWeeklyBonus = currentWeekCycleId;
      console.log('AWARDED BONUS!');
    }

    return {
      ...child,
      points: newPoints,
      weekly_xp: weeklyXp,
      weekly_reset_date: nextWeeklyReset.toISOString(),
      last_weekly_bonus_awarded: lastWeeklyBonus,
    };
};

let child = { points: 0, xp_in_level: 0, weekly_xp: 290, weekly_xp_target: 300, weekly_reward_points: 200, last_weekly_bonus_awarded: null, weekly_reset_date: getNextWeeklyResetDate(new Date()).toISOString() };

console.log("Initial state:", child);
child = processXpGains(child, 10);
console.log("After +10 XP (should award):", child);
child = processXpGains(child, 10);
console.log("After another +10 XP (should NOT award):", child);

