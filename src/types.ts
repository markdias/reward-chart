export interface ParentProfile {
  id: string;
  email: string;
  created_at: string;
  pin: string; // 4-digit security PIN for parent mode gate
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
  streak_days: number;
  last_active_date?: string;
  created_at: string;
}

export interface Task {
  id: string;
  parent_id: string;
  child_ids: string[];
  title: string;
  points: number;
  category: 'chores' | 'homework' | 'behavior' | 'health' | 'creative' | 'other';
  recurrence: 'daily' | 'weekly' | 'one_time';
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
  notes?: string;
}

export interface Reward {
  id: string;
  parent_id: string;
  child_ids: string[];
  title: string;
  cost_points: number;
  is_available: boolean;
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
  status: 'requested' | 'delivered';
}

export interface CharacterEvolutionStage {
  stage_number: number;
  name: string;
  description: string;
  min_points: number;
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
