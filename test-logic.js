const processXpGains = (child, addedXp) => {
  return {
    ...child,
    xp_in_level: (child.xp_in_level || 0) + addedXp,
    weekly_xp: (child.weekly_xp || 0) + addedXp
  };
};

const handleUpdateChildStats = (child, updates) => {
  let targetChild = { ...child };
  if (updates.xp_in_level !== undefined && updates.xp_in_level > (child.xp_in_level || 0)) {
    const addedXp = updates.xp_in_level - (child.xp_in_level || 0);
    targetChild = processXpGains(targetChild, addedXp);
    delete updates.xp_in_level;
  }
  targetChild = { ...targetChild, ...updates };
  return targetChild;
};

const child = { xp_in_level: 0, weekly_xp: 0 };
const updates = { xp_in_level: 10 };
console.log(handleUpdateChildStats(child, updates));
