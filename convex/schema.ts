/**
 * Reward Chart – Convex Schema
 *
 * Translated from supabase/schema.sql.  Key differences vs. Supabase:
 *
 *  • Every document automatically gets  _id  (Id<"table">)  and  _creationTime
 *    (number, epoch ms) — no need to declare them.
 *  • References use  v.id("tableName")  instead of REFERENCES / TEXT.
 *  • Enums are  v.union(v.literal("a"), v.literal("b"), ...)
 *  • JSONB columns become  v.array(v.object({...}))  with full TypeScript types.
 *  • RLS is replaced by auth checks inside each query / mutation function.
 *  • Real-time is built-in — every query is reactive automatically.
 *  • Auth: store the provider's  tokenIdentifier  in  parentProfiles.tokenIdentifier
 *    Works with Clerk, Auth0, or a custom JWT provider (Supabase Auth via JWKS).
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Shared sub-validators
// ---------------------------------------------------------------------------

/** A single routine slot (morning / afternoon / evening) in a child's schedule. */
const routineValidator = v.object({
  id: v.string(),
  name: v.string(),
  morningTaskIds: v.array(v.string()),
  afternoonTaskIds: v.array(v.string()),
  eveningTaskIds: v.array(v.string()),
});

const taskCategory = v.union(
  v.literal("chores"),
  v.literal("homework"),
  v.literal("behavior"),
  v.literal("health"),
  v.literal("creative"),
  v.literal("other"),
);

const taskRecurrence = v.union(
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("one_time"),
  v.literal("repeatable"),
);

const limitType = v.union(
  v.literal("unlimited"),
  v.literal("daily"),
  v.literal("twice_daily"),
  v.literal("one_time"),
);

const ageRange = v.union(
  v.literal("3-5"),
  v.literal("6-8"),
  v.literal("9-12"),
  v.literal("all"),
);

const completionStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

const redemptionStatus = v.union(
  v.literal("requested"),
  v.literal("delivered"),
  v.literal("rejected"),
);

const giftType = v.union(v.literal("charity"), v.literal("sibling"));

const giftStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export default defineSchema({
  // -------------------------------------------------------------------------
  // parentProfiles
  // One document per parent / guardian.
  // familyId is a plain string shared by co-parents (matches the old family_id).
  // tokenIdentifier comes from ctx.auth.getUserIdentity().tokenIdentifier.
  // -------------------------------------------------------------------------
  parentProfiles: defineTable({
    // Auth
    tokenIdentifier: v.string(), // unique per auth user; used for all access control
    email: v.string(),
    name: v.optional(v.string()),

    // Family
    familyId: v.string(),         // shared across co-parents
    familyName: v.optional(v.string()),

    // Security
    pin: v.optional(v.string()),
    shareToken: v.optional(v.string()), // used by other parents to join the family

    // Economy configuration
    levelUpGoldReward: v.optional(v.number()),
    pointsToLevelUp: v.optional(v.number()),
    weeklyPointsTarget: v.optional(v.number()),
    dailyPointsTarget: v.optional(v.number()),
    monthlyPointsTarget: v.optional(v.number()),

    // Bonus reward amounts awarded to children
    weeklyRewardPoints: v.optional(v.number()),
    dailyRewardPoints: v.optional(v.number()),
    monthlyRewardPoints: v.optional(v.number()),

    // Pot unlock levels (which level a child must reach to unlock each pot)
    savingsPotUnlockLevel: v.optional(v.number()),
    foodPotUnlockLevel: v.optional(v.number()),
    giftingPotUnlockLevel: v.optional(v.number()),

    // Gold pot maintenance
    goldPotMaintenanceUnlockLevel: v.optional(v.number()),
    goldPotMaintenanceCost: v.optional(v.number()),

    // UI
    dashboardStyle: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_share_token", ["shareToken"])
    .index("by_family_id", ["familyId"]),

  // -------------------------------------------------------------------------
  // children
  // -------------------------------------------------------------------------
  children: defineTable({
    // Ownership – points to the owning parentProfile document
    parentId: v.id("parentProfiles"),

    // Basic info
    name: v.string(),
    age: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
    characterId: v.optional(v.string()),

    // Core economy
    points: v.number(),
    lifetimePoints: v.number(),
    level: v.number(),
    petFood: v.number(),
    streakDays: v.number(),

    // Weekly / monthly tracking
    weeklyPoints: v.optional(v.number()),
    monthlyPoints: v.optional(v.number()),
    lastActiveWeek: v.optional(v.string()),
    lastActiveMonth: v.optional(v.string()),
    lastActiveDate: v.optional(v.string()),
    weeklyResetDate: v.optional(v.string()),
    monthlyResetDate: v.optional(v.string()),

    // Bonus tracking
    levelUpBonusesReceived: v.optional(v.number()),
    lastWeeklyBonusAwarded: v.optional(v.string()),
    lastMonthlyBonusAwarded: v.optional(v.string()),

    // Savings pot
    savingsPot: v.optional(v.number()),
    savingsUnlocked: v.optional(v.boolean()),
    savingsUnlockSeen: v.optional(v.boolean()),
    lastSavedDate: v.optional(v.string()),
    savingsGoalName: v.optional(v.string()),
    savingsGoalAmount: v.optional(v.number()),
    savingsGoalRewardId: v.optional(v.id("rewards")),

    // Food pot and pet care
    foodPotUnlocked: v.optional(v.boolean()),
    foodPotUnlockSeen: v.optional(v.boolean()),
    foodPotWeeklyContribution: v.optional(v.number()),
    petFedToday: v.optional(v.boolean()),
    petHungerTime: v.optional(v.number()),    // epoch ms
    petUnhappy: v.optional(v.boolean()),
    lastFedDate: v.optional(v.string()),
    lastHungerCheckDate: v.optional(v.string()),
    petFedTotal: v.optional(v.number()),
    petHappyStreak: v.optional(v.number()),

    // Gifting pot
    giftingUnlocked: v.optional(v.boolean()),
    giftingUnlockSeen: v.optional(v.boolean()),
    lastGiftingDate: v.optional(v.number()),  // epoch ms

    // Gold pot (breakage mechanic)
    goldPotBroken: v.optional(v.boolean()),
    goldPotBreakCountThisWeek: v.optional(v.number()),
    goldPotBreakWeek: v.optional(v.string()),
    goldPotLastCheckDate: v.optional(v.string()),
    goldPotLastLeakDate: v.optional(v.string()),
    goldPotLastFixDate: v.optional(v.string()),
    goldPotTotalLeaked: v.optional(v.number()),
    goldPotIntroSeen: v.optional(v.boolean()),
    goldPotMaintenanceUnlockSeen: v.optional(v.boolean()),

    // Nudge system
    hasPendingNudge: v.optional(v.boolean()),
    lastNudgeTime: v.optional(v.number()),    // epoch ms

    // Child login / linking
    childShareToken: v.optional(v.string()),
    linkedEmail: v.optional(v.string()),

    // Routines
    routines: v.optional(v.array(routineValidator)),
    activeRoutineId: v.optional(v.string()),
    holidayMode: v.optional(v.boolean()),

    // Badge-tracking counters
    savingsDeposits: v.optional(v.number()),
    savingsGoalsMet: v.optional(v.number()),
    giftsMade: v.optional(v.number()),
    goldPotFixes: v.optional(v.number()),
    goldPotUnbrokenDays: v.optional(v.number()),
    manualDeductions: v.optional(v.number()),
  })
    .index("by_parent_id", ["parentId"])
    .index("by_child_share_token", ["childShareToken"])
    .index("by_linked_email", ["linkedEmail"]),

  // -------------------------------------------------------------------------
  // childProfiles
  // Maps a child's auth account (tokenIdentifier) to their children document.
  // Created when a child logs in for the first time via their share token.
  // -------------------------------------------------------------------------
  childProfiles: defineTable({
    tokenIdentifier: v.string(),      // child's auth tokenIdentifier
    childId: v.id("children"),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_child_id", ["childId"]),

  // -------------------------------------------------------------------------
  // tasks
  // isTemplate=true → directory entry shared across all children in a family.
  // isTemplate=false + childId set → a child-specific instance.
  // -------------------------------------------------------------------------
  tasks: defineTable({
    parentId: v.id("parentProfiles"),
    childId: v.optional(v.id("children")),
    title: v.string(),
    points: v.number(),
    category: taskCategory,
    recurrence: taskRecurrence,
    cooldownMinutes: v.optional(v.number()),
    isTemplate: v.optional(v.boolean()),
    templateId: v.optional(v.id("tasks")),   // source template this was copied from
    isActive: v.boolean(),
    ageRange: v.optional(ageRange),
  })
    .index("by_parent_id", ["parentId"])
    .index("by_child_id", ["childId"])
    .index("by_parent_and_template", ["parentId", "isTemplate"]),

  // -------------------------------------------------------------------------
  // completions
  // One record per task-completion attempt.
  // -------------------------------------------------------------------------
  completions: defineTable({
    taskId: v.id("tasks"),
    childId: v.id("children"),
    completedAt: v.number(),           // epoch ms (Date.now())
    status: completionStatus,
    pointsAwarded: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_child_id", ["childId"])
    .index("by_task_id", ["taskId"])
    .index("by_child_and_status", ["childId", "status"]),

  // -------------------------------------------------------------------------
  // rewards
  // Same template / instance pattern as tasks.
  // -------------------------------------------------------------------------
  rewards: defineTable({
    parentId: v.id("parentProfiles"),
    childId: v.optional(v.id("children")),
    title: v.string(),
    costPoints: v.number(),
    isAvailable: v.boolean(),
    isTemplate: v.optional(v.boolean()),
    templateId: v.optional(v.id("rewards")),
    iconName: v.string(),
    limitType: limitType,
    isBadgeEligible: v.optional(v.boolean()),
    ageRange: v.optional(ageRange),
  })
    .index("by_parent_id", ["parentId"])
    .index("by_child_id", ["childId"])
    .index("by_parent_and_template", ["parentId", "isTemplate"]),

  // -------------------------------------------------------------------------
  // rewardRedemptions
  // -------------------------------------------------------------------------
  rewardRedemptions: defineTable({
    rewardId: v.id("rewards"),
    childId: v.id("children"),
    parentId: v.id("parentProfiles"),
    redeemedAt: v.number(),            // epoch ms
    status: redemptionStatus,
    // 'main' | 'savings' | 'badge_freebie:<badgeId>'
    paymentSource: v.optional(v.string()),
  })
    .index("by_parent_id", ["parentId"])
    .index("by_child_id", ["childId"])
    .index("by_child_and_status", ["childId", "status"]),

  // -------------------------------------------------------------------------
  // giftingRequests
  // -------------------------------------------------------------------------
  giftingRequests: defineTable({
    childId: v.id("children"),
    familyId: v.string(),
    amount: v.number(),
    type: giftType,
    siblingId: v.optional(v.id("children")),
    charityName: v.optional(v.string()),
    status: giftStatus,
  })
    .index("by_family_id", ["familyId"])
    .index("by_child_id", ["childId"])
    .index("by_family_and_status", ["familyId", "status"]),

  // -------------------------------------------------------------------------
  // familyMessages
  // Inter-parent messaging within a family.
  // receiverId = null → broadcast to everyone in the family.
  // -------------------------------------------------------------------------
  familyMessages: defineTable({
    familyId: v.string(),
    senderId: v.id("parentProfiles"),
    receiverId: v.optional(v.id("parentProfiles")),
    message: v.string(),
    isRead: v.boolean(),
  })
    .index("by_family_id", ["familyId"])
    .index("by_receiver_id", ["receiverId"]),

  // -------------------------------------------------------------------------
  // badges   (static catalogue — inserted once via seeds.ts)
  // -------------------------------------------------------------------------
  badges: defineTable({
    badgeId: v.string(),              // stable slug, e.g. "first-coin"
    name: v.string(),
    description: v.string(),
    iconName: v.string(),
    category: v.string(),
    unlockConditionHint: v.optional(v.string()),
  })
    .index("by_badge_id", ["badgeId"]),

  // -------------------------------------------------------------------------
  // childBadges   (per-child earned badges)
  // -------------------------------------------------------------------------
  childBadges: defineTable({
    childId: v.id("children"),
    badgeId: v.string(),              // matches badges.badgeId slug
    unlockedAt: v.number(),           // epoch ms
    rewardClaimed: v.boolean(),
  })
    .index("by_child_id", ["childId"])
    // Enforce (childId, badgeId) uniqueness – check this in the mutation before insert
    .index("by_child_and_badge", ["childId", "badgeId"]),
});
