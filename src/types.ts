export interface Routine {
  id: string;
  name: string;
  morningTaskIds: string[];
  afternoonTaskIds: string[];
  eveningTaskIds: string[];
}

export interface ParentProfile {
  user_id: string;
  email: string;
  name: string | null;
  family_id: string;
  family_name?: string | null;
  pin?: string;
  share_token: string | null;
  is_beta_tester?: boolean;
  has_special_logins?: boolean;
  level_up_gold_reward?: number;
  points_to_level_up?: number;
  savings_pot_unlock_level?: number;
  food_pot_unlock_level?: number;
  gifting_pot_unlock_level?: number;
  weekly_points_target?: number;
  daily_points_target?: number;
  weekly_reward_points?: number;
  daily_reward_points?: number;
  monthly_points_target?: number;
  monthly_reward_points?: number;
  gold_pot_maintenance_unlock_level?: number;
  gold_pot_maintenance_cost?: number;
  dashboard_style?: string;
  tour_seen?: boolean;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age?: number;
  avatar_url: string;
  character_id: string; // Selected character template ID (e.g. 'unicorn', 'dino')
  points: number;
  lifetime_points: number;
  level: number;
  pet_food: number;
  streak_days: number;
  level_up_preference?: 'points' | 'reward'; // Deprecated, keeping for backwards compatibility
  level_up_bonuses_received?: number; // Count of bonuses given
  last_weekly_bonus_awarded?: string; // e.g. "2026-W25"
  last_monthly_bonus_awarded?: string; // e.g. "2026-06"
  weekly_points?: number;
  monthly_points?: number;
  tour_seen?: boolean;
  last_active_week?: string;
  last_active_month?: string;
  weekly_reset_date?: string; // ISO date of next reset
  monthly_reset_date?: string; // ISO date of next reset
  last_active_date?: string;
  savings_pot?: number;
  last_saved_date?: string | null;
  savings_unlocked?: boolean;
  savings_unlock_seen?: boolean;
  savings_goal_name?: string | null;
  savings_goal_amount?: number | null;
  savings_goal_reward_id?: string | null;
  food_pot_unlocked?: boolean;
  food_pot_unlock_seen?: boolean;
  food_pot_weekly_contribution?: number;
  pet_fed_today?: boolean;
  pet_hunger_time?: string | null;
  pet_unhappy?: boolean;
  last_fed_date?: string | null;
  last_hunger_check_date?: string | null;
  has_pending_nudge?: boolean;
  last_nudge_time?: string | null;
  gifting_unlocked?: boolean;
  gifting_unlock_seen?: boolean;
  gifting_pot?: number;
  last_gifting_date?: string | null;
  gold_pot_broken?: boolean;
  gold_pot_break_count_this_week?: number;
  gold_pot_break_week?: string;
  gold_pot_last_leak_date?: string | null;
  gold_pot_last_check_date?: string | null;
  gold_pot_last_fix_date?: string | null;
  gold_pot_total_leaked?: number;
  gold_pot_intro_seen?: boolean;
  gold_pot_maintenance_unlock_seen?: boolean;
  pet_fed_total?: number;
  pet_happy_streak?: number;
  savings_deposits?: number;
  savings_goals_met?: number;
  gifts_made?: number;
  gold_pot_fixes?: number;
  gold_pot_unbroken_days?: number;
  manual_deductions?: number;
  child_share_token?: string | null;
  linked_email?: string | null;
  routines?: Routine[];
  active_routine_id?: string | null;
  holiday_mode?: boolean;
  created_at: string;
}

export interface ChildProfile {
  user_id: string;
  child_id: string;
  created_at?: string;
}

export interface Task {
  id: string;
  parent_id: string;
  child_id: string;
  title: string;
  points: number;
  category: 'chores' | 'homework' | 'behavior' | 'health' | 'creative' | 'other';
  recurrence: 'daily' | 'weekly' | 'one_time' | 'repeatable';
  cooldown_minutes?: number;
  is_template?: boolean;
  template_id?: string;
  is_active: boolean;
  age_range?: '3-5' | '6-8' | '9-12' | 'all';
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  child_id: string;
  completed_at: string;
  status: 'pending' | 'approved' | 'rejected';
  points_awarded: number;
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
  is_badge_eligible?: boolean;
  age_range?: '3-5' | '6-8' | '9-12' | 'all';
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  child_id: string;
  parent_id: string;
  redeemed_at: string;
  status: 'requested' | 'delivered' | 'rejected';
  payment_source?: string; // allow 'badge_freebie:badge-id'
}

export interface GiftingRequest {
  id: string;
  child_id: string;
  family_id: string;
  amount: number;
  type: 'charity' | 'sibling';
  sibling_id?: string | null;
  charity_name?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const PREDEFINED_CHARITIES = [
  'Save the Children',
  'World Wildlife Fund (WWF)',
  'Local Food Bank',
  'Make-A-Wish Foundation',
  'St. Jude Children\'s Research Hospital'
];


export interface CharacterEvolutionStage {
  stage_number: number;
  name: string;
  description: string;
  min_points: number;
  min_level: number; // Level threshold for this evolution stage
  emoji: string;
  color_theme: string;
  animation_class: string;
  model_url?: string;
  model_url_fed?: string;
  model_url_not_fed?: string;
  model_scale?: number;
}

export interface CharacterPack {
  id: string;
  name: string;
  description: string;
  pack_name: string; // For categorizing thematic expansion packs (e.g., "Galaxy Pack", "Fantasy Pack")
  stages: CharacterEvolutionStage[];
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  unlock_condition_hint: string;
}

export interface ChildBadge {
  id: string;
  child_id: string;
  badge_id: string;
  unlocked_at: string;
  reward_claimed: boolean;
}

