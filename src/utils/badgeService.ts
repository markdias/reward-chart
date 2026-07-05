import { getSupabaseClient } from './supabase';
import { Child, BadgeDef, ChildBadge } from '../types';

export const BADGE_CATEGORIES = {
  coins: 'Coins & Wealth',
  levels: 'Level Progression',
  streaks: 'Streaks & Consistency',
  tasks: 'Chores & Tasks',
  pets: 'Pet Care',
  savings: 'Savings & Financials',
  responsibility: 'Responsibility'
};

export async function revokeInvalidLevelBadges(childId: string, currentLevel: number) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const badgesToRevoke = [];
  if (currentLevel < 50) badgesToRevoke.push('legendary');
  if (currentLevel < 30) badgesToRevoke.push('expert-status');
  if (currentLevel < 20) badgesToRevoke.push('master-house');
  if (currentLevel < 15) badgesToRevoke.push('seasoned-pro');
  if (currentLevel < 10) badgesToRevoke.push('high-flyer');
  if (currentLevel < 5) badgesToRevoke.push('on-the-move');
  if (currentLevel < 3) badgesToRevoke.push('getting-hang');
  if (currentLevel < 2) badgesToRevoke.push('rising-star');

  if (badgesToRevoke.length > 0) {
    const { error } = await supabase
      .from('child_badges')
      .delete()
      .eq('child_id', childId)
      .in('badge_id', badgesToRevoke);

    if (error) {
      console.error('Failed to revoke level badges', error);
    }
  }
}

export async function checkAndUnlockBadges(child: Child) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  // Clean up any level badges that the child no longer qualifies for
  await revokeInvalidLevelBadges(child.id, child.level || 1);

  // 1. Fetch all badges
  const { data: allBadges, error: badgesError } = await supabase
    .from('badges')
    .select('*');
  if (badgesError || !allBadges) {
    console.error('Error fetching badges', badgesError);
    return;
  }

  // 2. Fetch already unlocked child_badges
  const { data: unlockedBadges, error: unlockedError } = await supabase
    .from('child_badges')
    .select('*')
    .eq('child_id', child.id);
  if (unlockedError || !unlockedBadges) {
    console.error('Error fetching unlocked badges', unlockedError);
    return;
  }

  const unlockedBadgeIds = new Set(unlockedBadges.map(b => b.badge_id));
  const lockedBadges = allBadges.filter(b => !unlockedBadgeIds.has(b.id));

  if (lockedBadges.length === 0) return; // All unlocked!

  // 3. Compute dynamic stats (Tasks breakdown)
  const { data: completions } = await supabase
    .from('completions')
    .select('task_id, status')
    .eq('child_id', child.id)
    .eq('status', 'approved');

  let total_tasks = 0;
  const categories: Record<string, number> = {
    chores: 0,
    homework: 0,
    behavior: 0,
    health: 0,
    creative: 0,
    other: 0
  };

  if (completions && completions.length > 0) {
    total_tasks = completions.length;
    
    const taskIds = Array.from(new Set(completions.map(c => c.task_id).filter(id => id !== 'penalty')));
    
    if (taskIds.length > 0) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, category')
        .in('id', taskIds);
        
      const taskCategoryMap = new Map();
      if (tasks) {
        tasks.forEach(t => taskCategoryMap.set(t.id, t.category));
      }
      
      for (const c of completions) {
        if (c.task_id === 'penalty') continue;
        const cat = taskCategoryMap.get(c.task_id);
        if (cat && categories[cat] !== undefined) {
          categories[cat]++;
        }
      }
    }
  }

  let all_categories_count = 0;
  for (const count of Object.values(categories)) {
    if (count >= 5) { // The 'Well-Rounded' badge asks for at least 5 in ALL 5 main categories
      all_categories_count++;
    }
  }

  // 4. Create an evaluation context object
  const ctx = {
    points: child.points || 0,
    lifetime_points: child.lifetime_points || 0,
    level: child.level || 1,
    streak_days: child.streak_days || 0,
    total_tasks,
    all_categories: all_categories_count, // How many categories have 5+ completions
    chores: categories.chores,
    homework: categories.homework,
    behavior: categories.behavior,
    health: categories.health,
    creative: categories.creative,
    pet_fed_total: child.pet_fed_total || 0,
    pet_happy_streak: child.pet_happy_streak || 0,
    savings_deposits: child.savings_deposits || 0,
    savings_goals_met: child.savings_goals_met || 0,
    gifts_made: child.gifts_made || 0,
    gold_pot_fixes: child.gold_pot_fixes || 0,
    gold_pot_unbroken_days: child.gold_pot_unbroken_days || 0,
  };

  const newUnlocks: string[] = [];

  // 5. Evaluate conditions
  for (const badge of lockedBadges) {
    if (evaluateCondition(badge.id, ctx)) {
      newUnlocks.push(badge.id);
    }
  }

  // 6. Insert new unlocks
  if (newUnlocks.length > 0) {
    const inserts = newUnlocks.map(badge_id => ({
      child_id: child.id,
      badge_id,
      reward_claimed: false
    }));

    const { error: insertError } = await supabase
      .from('child_badges')
      .insert(inserts);

    if (insertError) {
      console.error('Error inserting new badges', insertError);
    } else {
      // Optional: We could trigger an event or just return the newly unlocked badge IDs to display an alert
      return newUnlocks;
    }
  }

  return [];
}

// Simple hardcoded mapping of logic since `eval()` is unsafe
function evaluateCondition(badgeId: string, ctx: any): boolean {
  switch (badgeId) {
    case 'first-coin': return ctx.lifetime_points > 0;
    case 'pocket-money': return ctx.lifetime_points >= 50;
    case 'coin-collector': return ctx.lifetime_points >= 100;
    case 'piggy-bank-full': return ctx.lifetime_points >= 250;
    case 'treasure-hunter': return ctx.lifetime_points >= 500;
    case 'rich-king': return ctx.lifetime_points >= 1000;
    case 'gold-miner': return ctx.lifetime_points >= 2500;
    case 'dragons-hoard': return ctx.lifetime_points >= 5000;

    case 'rising-star': return ctx.level >= 2;
    case 'getting-hang': return ctx.level >= 3;
    case 'on-the-move': return ctx.level >= 5;
    case 'high-flyer': return ctx.level >= 10;
    case 'seasoned-pro': return ctx.level >= 15;
    case 'master-house': return ctx.level >= 20;
    case 'expert-status': return ctx.level >= 30;
    case 'legendary': return ctx.level >= 50;

    case 'just-getting-started': return ctx.streak_days >= 2;
    case 'threes-charm': return ctx.streak_days >= 3;
    case 'weekly-warrior': return ctx.streak_days >= 7;
    case 'fortnight-fighter': return ctx.streak_days >= 14;
    case 'three-weeks-strong': return ctx.streak_days >= 21;
    case 'monthly-master': return ctx.streak_days >= 30;
    case 'unstoppable': return ctx.streak_days >= 100;
    case 'half-year': return ctx.streak_days >= 180;

    case 'task-master': return ctx.total_tasks >= 100;
    case 'well-rounded': return ctx.all_categories >= 5; // 5 main categories have 5+ completions
    case 'helping-hand': return ctx.chores >= 10;
    case 'chore-champion': return ctx.chores >= 50;
    case 'chore-legend': return ctx.chores >= 100;
    case 'brainiac': return ctx.homework >= 10;
    case 'a-plus-student': return ctx.homework >= 50;
    case 'homework-hero': return ctx.homework >= 100;
    case 'good-citizen': return ctx.behavior >= 10;
    case 'angel': return ctx.behavior >= 50;
    case 'role-model': return ctx.behavior >= 100;
    case 'healthy-habits': return ctx.health >= 10;
    case 'creative-spark': return ctx.creative >= 10;

    case 'pet-lover': return ctx.pet_fed_total >= 1;
    case 'animal-lover': return ctx.pet_fed_total >= 10;
    case 'pet-whisperer': return ctx.pet_fed_total >= 50;
    case 'ultimate-caretaker': return ctx.pet_fed_total >= 100;
    case 'best-friend': return ctx.pet_happy_streak >= 7;
    case 'pet-guardian': return ctx.pet_happy_streak >= 14;

    case 'first-deposit': return ctx.savings_deposits >= 1;
    case 'goal-getter': return ctx.savings_goals_met >= 1;
    case 'super-saver': return ctx.savings_goals_met >= 3;
    case 'generous-spirit': return ctx.gifts_made >= 1;
    case 'philanthropist': return ctx.gifts_made >= 5;

    case 'handyman': return ctx.gold_pot_fixes >= 1;
    case 'gold-pot-guardian': return ctx.gold_pot_unbroken_days >= 30;

    default: return false;
  }
}
