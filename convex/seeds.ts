/**
 * Reward Chart – Badge Seed Data
 *
 * Run this once to populate the static `badges` catalogue.
 * Idempotent: skips any badge whose  badgeId  already exists.
 *
 * Usage (from your project root, after `npx convex dev` is running):
 *   npx convex run seeds:seedBadges
 */

import { internalMutation } from "./_generated/server";

const BADGES = [
  // ── Coins & Wealth ──────────────────────────────────────────────────────
  { badgeId: "first-coin",      name: "First Coin",       description: "Earn your first coin.",          iconName: "CircleDollarSign", category: "coins",  unlockConditionHint: "points > 0" },
  { badgeId: "pocket-money",    name: "Pocket Money",     description: "Reach 50 lifetime coins.",       iconName: "Wallet",           category: "coins",  unlockConditionHint: "lifetimePoints >= 50" },
  { badgeId: "coin-collector",  name: "Coin Collector",   description: "Reach 100 lifetime coins.",      iconName: "Coins",            category: "coins",  unlockConditionHint: "lifetimePoints >= 100" },
  { badgeId: "piggy-bank-full", name: "Piggy Bank Full",  description: "Reach 250 lifetime coins.",      iconName: "PiggyBank",        category: "coins",  unlockConditionHint: "lifetimePoints >= 250" },
  { badgeId: "treasure-hunter", name: "Treasure Hunter",  description: "Reach 500 lifetime coins.",      iconName: "Map",              category: "coins",  unlockConditionHint: "lifetimePoints >= 500" },
  { badgeId: "rich-king",       name: "Rich as a King",   description: "Reach 1,000 lifetime coins.",    iconName: "Crown",            category: "coins",  unlockConditionHint: "lifetimePoints >= 1000" },
  { badgeId: "gold-miner",      name: "Gold Miner",       description: "Reach 2,500 lifetime coins.",    iconName: "Pickaxe",          category: "coins",  unlockConditionHint: "lifetimePoints >= 2500" },
  { badgeId: "dragons-hoard",   name: "Dragon's Hoard",   description: "Reach 5,000 lifetime coins.",    iconName: "Gem",              category: "coins",  unlockConditionHint: "lifetimePoints >= 5000" },

  // ── Level Progression ───────────────────────────────────────────────────
  { badgeId: "rising-star",    name: "Rising Star",            description: "Reach Level 2.",   iconName: "Star",       category: "levels", unlockConditionHint: "level >= 2" },
  { badgeId: "getting-hang",   name: "Getting the Hang of It", description: "Reach Level 3.",   iconName: "ThumbsUp",   category: "levels", unlockConditionHint: "level >= 3" },
  { badgeId: "on-the-move",    name: "On the Move",            description: "Reach Level 5.",   iconName: "TrendingUp", category: "levels", unlockConditionHint: "level >= 5" },
  { badgeId: "high-flyer",     name: "High Flyer",             description: "Reach Level 10.",  iconName: "Rocket",     category: "levels", unlockConditionHint: "level >= 10" },
  { badgeId: "seasoned-pro",   name: "Seasoned Pro",           description: "Reach Level 15.",  iconName: "Medal",      category: "levels", unlockConditionHint: "level >= 15" },
  { badgeId: "master-house",   name: "Master of the House",    description: "Reach Level 20.",  iconName: "Key",        category: "levels", unlockConditionHint: "level >= 20" },
  { badgeId: "expert-status",  name: "Expert Status",          description: "Reach Level 30.",  iconName: "Award",      category: "levels", unlockConditionHint: "level >= 30" },
  { badgeId: "legendary",      name: "Legendary",              description: "Reach Level 50.",  iconName: "Trophy",     category: "levels", unlockConditionHint: "level >= 50" },

  // ── Streaks & Consistency ────────────────────────────────────────────────
  { badgeId: "just-getting-started", name: "Just Getting Started", description: "2-day activity streak.",   iconName: "Zap",      category: "streaks", unlockConditionHint: "streakDays >= 2" },
  { badgeId: "threes-charm",         name: "Three's a Charm",     description: "3-day activity streak.",   iconName: "Sparkles", category: "streaks", unlockConditionHint: "streakDays >= 3" },
  { badgeId: "weekly-warrior",       name: "Weekly Warrior",      description: "7-day activity streak.",   iconName: "Swords",   category: "streaks", unlockConditionHint: "streakDays >= 7" },
  { badgeId: "fortnight-fighter",    name: "Fortnight Fighter",   description: "14-day activity streak.",  iconName: "Shield",   category: "streaks", unlockConditionHint: "streakDays >= 14" },
  { badgeId: "three-weeks-strong",   name: "Three Weeks Strong",  description: "21-day activity streak.",  iconName: "Flame",    category: "streaks", unlockConditionHint: "streakDays >= 21" },
  { badgeId: "monthly-master",       name: "Monthly Master",      description: "30-day activity streak.",  iconName: "Calendar", category: "streaks", unlockConditionHint: "streakDays >= 30" },
  { badgeId: "unstoppable",          name: "Unstoppable",         description: "100-day activity streak.", iconName: "Mountain", category: "streaks", unlockConditionHint: "streakDays >= 100" },
  { badgeId: "half-year",            name: "Half a Year",         description: "180-day activity streak.", iconName: "Sun",      category: "streaks", unlockConditionHint: "streakDays >= 180" },

  // ── Chores & Tasks ───────────────────────────────────────────────────────
  { badgeId: "task-master",    name: "Task Master",    description: "Complete 100 tasks of any type.",                       iconName: "CheckSquare",   category: "tasks", unlockConditionHint: "totalTasks >= 100" },
  { badgeId: "well-rounded",   name: "Well-Rounded",   description: "Complete at least 5 tasks in all 5 main categories.",  iconName: "PieChart",      category: "tasks", unlockConditionHint: "allCategories >= 5" },
  { badgeId: "helping-hand",   name: "Helping Hand",   description: "Complete 10 chores.",                                   iconName: "Hand",          category: "tasks", unlockConditionHint: "chores >= 10" },
  { badgeId: "chore-champion", name: "Chore Champion", description: "Complete 50 chores.",                                   iconName: "Broom",         category: "tasks", unlockConditionHint: "chores >= 50" },
  { badgeId: "chore-legend",   name: "Chore Legend",   description: "Complete 100 chores.",                                  iconName: "Sparkles",      category: "tasks", unlockConditionHint: "chores >= 100" },
  { badgeId: "brainiac",       name: "Brainiac",       description: "Complete 10 homework tasks.",                           iconName: "Brain",         category: "tasks", unlockConditionHint: "homework >= 10" },
  { badgeId: "a-plus-student", name: "A+ Student",     description: "Complete 50 homework tasks.",                           iconName: "GraduationCap", category: "tasks", unlockConditionHint: "homework >= 50" },
  { badgeId: "homework-hero",  name: "Homework Hero",  description: "Complete 100 homework tasks.",                          iconName: "BookOpen",      category: "tasks", unlockConditionHint: "homework >= 100" },
  { badgeId: "good-citizen",   name: "Good Citizen",   description: "Complete 10 behavior tasks.",                           iconName: "Smile",         category: "tasks", unlockConditionHint: "behavior >= 10" },
  { badgeId: "angel",          name: "Angel",          description: "Complete 50 behavior tasks.",                           iconName: "Heart",         category: "tasks", unlockConditionHint: "behavior >= 50" },
  { badgeId: "role-model",     name: "Role Model",     description: "Complete 100 behavior tasks.",                          iconName: "Star",          category: "tasks", unlockConditionHint: "behavior >= 100" },
  { badgeId: "healthy-habits", name: "Healthy Habits", description: "Complete 10 health tasks.",                             iconName: "Apple",         category: "tasks", unlockConditionHint: "health >= 10" },
  { badgeId: "creative-spark", name: "Creative Spark", description: "Complete 10 creative tasks.",                           iconName: "Palette",       category: "tasks", unlockConditionHint: "creative >= 10" },

  // ── Pet Care ─────────────────────────────────────────────────────────────
  { badgeId: "pet-lover",           name: "Pet Lover",          description: "Feed your pet for the first time.",          iconName: "Bone",   category: "pets", unlockConditionHint: "petFedTotal >= 1" },
  { badgeId: "animal-lover",        name: "Animal Lover",       description: "Feed your pet 10 times total.",              iconName: "Dog",    category: "pets", unlockConditionHint: "petFedTotal >= 10" },
  { badgeId: "pet-whisperer",       name: "Pet Whisperer",      description: "Feed your pet 50 times total.",              iconName: "Cat",    category: "pets", unlockConditionHint: "petFedTotal >= 50" },
  { badgeId: "ultimate-caretaker",  name: "Ultimate Caretaker", description: "Feed your pet 100 times total.",             iconName: "Heart",  category: "pets", unlockConditionHint: "petFedTotal >= 100" },
  { badgeId: "best-friend",         name: "Best Friend",        description: "Keep your pet happy for 7 days in a row.",  iconName: "Smile",  category: "pets", unlockConditionHint: "petHappyStreak >= 7" },
  { badgeId: "pet-guardian",        name: "Pet Guardian",       description: "Keep your pet happy for 14 days in a row.", iconName: "Shield", category: "pets", unlockConditionHint: "petHappyStreak >= 14" },

  // ── Savings & Financials ──────────────────────────────────────────────────
  { badgeId: "first-deposit",   name: "First Deposit",   description: "Put coins in the savings pot for the first time.", iconName: "PiggyBank",      category: "savings", unlockConditionHint: "savingsDeposits >= 1" },
  { badgeId: "goal-getter",     name: "Goal Getter",     description: "Reach a savings goal.",                            iconName: "Target",         category: "savings", unlockConditionHint: "savingsGoalsMet >= 1" },
  { badgeId: "super-saver",     name: "Super Saver",     description: "Reach 3 savings goals.",                           iconName: "Layers",         category: "savings", unlockConditionHint: "savingsGoalsMet >= 3" },
  { badgeId: "generous-spirit", name: "Generous Spirit", description: "Make a gift (charity or sibling).",                iconName: "Gift",           category: "savings", unlockConditionHint: "giftsMade >= 1" },
  { badgeId: "philanthropist",  name: "Philanthropist",  description: "Make 5 gifts.",                                    iconName: "HeartHandshake", category: "savings", unlockConditionHint: "giftsMade >= 5" },

  // ── Responsibility ────────────────────────────────────────────────────────
  { badgeId: "handyman",           name: "Handyman",           description: "Fix a broken gold pot.",                     iconName: "Wrench",      category: "responsibility", unlockConditionHint: "goldPotFixes >= 1" },
  { badgeId: "gold-pot-guardian",  name: "Gold Pot Guardian",  description: "Go 30 days without breaking the gold pot.", iconName: "ShieldCheck", category: "responsibility", unlockConditionHint: "goldPotUnbrokenDays >= 30" },
] as const;

/**
 * Inserts all 50 badges if they don't already exist.
 * Safe to run multiple times.
 */
export const seedBadges = internalMutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;

    for (const badge of BADGES) {
      const existing = await ctx.db
        .query("badges")
        .withIndex("by_badge_id", (q) => q.eq("badgeId", badge.badgeId))
        .unique();

      if (existing !== null) {
        skipped++;
        continue;
      }

      await ctx.db.insert("badges", {
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        iconName: badge.iconName,
        category: badge.category,
        unlockConditionHint: badge.unlockConditionHint,
      });
      inserted++;
    }

    console.log(`seedBadges: inserted=${inserted}, skipped=${skipped}`);
    return { inserted, skipped };
  },
});
