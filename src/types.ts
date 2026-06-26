export interface ParentProfile {
  user_id: string;
  email: string;
  name: string | null;
  family_id: string;
  family_name?: string | null;
  pin: string;
  share_token: string | null;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  avatar_url: string;
  character_id: string; // Selected character template ID (e.g. 'unicorn', 'robot')
  points: number;
  level: number;
  xp_in_level: number; // Progress within the current level (0-100)
  pet_food: number;
  streak_days: number;
  level_up_gold_reward?: number; // Custom gold amount for leveling up
  level_up_preference?: 'points' | 'reward'; // Deprecated, keeping for backwards compatibility
  level_up_bonuses_received?: number; // Count of bonuses given
  weekly_xp_target?: number;
  weekly_reward_points?: number;
  monthly_xp_target?: number;
  monthly_reward_points?: number;
  last_weekly_bonus_awarded?: string; // e.g. "2026-W25"
  last_monthly_bonus_awarded?: string; // e.g. "2026-06"
  weekly_xp?: number;
  monthly_xp?: number;
  last_active_week?: string;
  last_active_month?: string;
  weekly_reset_date?: string; // ISO date of next reset
  monthly_reset_date?: string; // ISO date of next reset
  last_active_date?: string;
  savings_pot?: number;
  savings_unlocked?: boolean;
  savings_unlock_seen?: boolean;
  savings_goal_name?: string | null;
  savings_goal_amount?: number | null;
  created_at: string;
}

export interface Task {
  id: string;
  parent_id: string;
  child_id: string;
  title: string;
  points: number;
  xp?: number;
  category: 'chores' | 'homework' | 'behavior' | 'health' | 'creative' | 'other';
  recurrence: 'daily' | 'weekly' | 'one_time' | 'repeatable';
  cooldown_minutes?: number;
  is_template?: boolean;
  template_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  child_id: string;
  completed_at: string;
  status: 'pending' | 'approved' | 'rejected';
  points_awarded: number;
  xp_awarded?: number;
  notes?: string;
}

export interface Reward {
  id: string;
  parent_id: string;
  child_id: string;
  title: string;
  cost_points: number;
  is_available: boolean;
  is_template?: boolean;
  template_id?: string;
  icon_name: string;
  limit_type: 'unlimited' | 'daily' | 'twice_daily' | 'one_time';
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  child_id: string;
  parent_id: string;
  redeemed_at: string;
  status: 'requested' | 'delivered' | 'rejected';
}

export interface FamilyMessage {
  id: string;
  family_id: string;
  sender_id: string;
  receiver_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CharacterEvolutionStage {
  stage_number: number;
  name: string;
  description: string;
  min_points: number;
  min_level: number; // Level threshold for this evolution stage
  emoji: string;
  color_theme: string;
  animation_class: string;
  image_url?: string;
}

export interface CharacterPack {
  id: string;
  name: string;
  description: string;
  pack_name: string; // For categorizing thematic expansion packs (e.g., "Galaxy Pack", "Fantasy Pack")
  stages: CharacterEvolutionStage[];
}
