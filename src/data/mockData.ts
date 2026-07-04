import { Child, Task, TaskCompletion, Reward, RewardRedemption } from '../types';

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'child_leo',
    parent_id: 'parent_demo',
    name: 'Leo the Adventurer',
    avatar_url: '/avatars/boy_fox.png',
    character_id: 'dragon',
    points: 125,
    level: 2,
    lifetime_points: 0,
    streak_days: 5,
    last_active_date: new Date().toISOString().split('T')[0],

    savings_pot: 25,
    savings_unlocked: true,
    savings_unlock_seen: true,
    pet_food: 0,
    pet_fed_today: false,
    pet_hunger_time: null,
    pet_unhappy: false,
    last_fed_date: null,
    last_hunger_check_date: new Date().toISOString().split('T')[0],
    gold_pot_broken: false,
    gold_pot_last_check_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'child_lily',
    parent_id: 'parent_demo',
    name: 'Lily the Dreamer',
    avatar_url: '/avatars/girl_kitten.png',
    character_id: 'unicorn',
    points: 42,
    level: 1,
    lifetime_points: 0,
    streak_days: 3,
    last_active_date: new Date().toISOString().split('T')[0],
    savings_pot: 0,
    savings_unlocked: true,
    savings_unlock_seen: true,
    pet_food: 0,
    pet_fed_today: true,
    pet_hunger_time: null,
    pet_unhappy: false,
    last_fed_date: null,
    last_hunger_check_date: new Date().toISOString().split('T')[0],
    gold_pot_broken: false,
    gold_pot_last_check_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'child_sammy',
    parent_id: 'parent_demo',
    name: 'Sammy the Creator',
    avatar_url: '/avatars/boy_puppy.png',
    character_id: 'robot',
    points: 185,
    level: 3,
    lifetime_points: 0,
    streak_days: 8,
    last_active_date: new Date().toISOString().split('T')[0],
    savings_pot: 50,
    savings_unlocked: true,
    savings_unlock_seen: true,
    pet_food: 0,
    pet_fed_today: true,
    pet_hunger_time: null,
    pet_unhappy: false,
    last_fed_date: null,
    last_hunger_check_date: new Date().toISOString().split('T')[0],
    gold_pot_broken: false,
    gold_pot_last_check_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

export const INITIAL_TASKS: Task[] = [
  // Leo's Tasks
  {
    id: 'task_1',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🧹 Clean up bedroom toys',
    points: 15,
    category: 'chores',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task_2',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '📚 Read a book for 20 minutes',
    points: 20,
    category: 'homework',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task_3',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🥦 Eat all your veggies at dinner',
    points: 10,
    category: 'health',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Lily's Tasks
  {
    id: 'task_4',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🦷 Brush teeth morning & night',
    points: 10,
    category: 'health',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task_5',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🎨 Practice drawing/crafting',
    points: 15,
    category: 'creative',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task_6',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '✏️ Complete spelling worksheets',
    points: 25,
    category: 'homework',
    recurrence: 'weekly',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Sammy's Tasks
  {
    id: 'task_7',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🥛 Feed the household pet',
    points: 10,
    category: 'chores',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'task_8',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🧘 Practice 10 mins mindfulness',
    points: 15,
    category: 'behavior',
    recurrence: 'daily',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_COMPLETIONS: TaskCompletion[] = [
  {
    id: 'comp_1',
    task_id: 'task_1',
    child_id: 'directory',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'pending',
    points_awarded: 15
  },
  {
    id: 'comp_2',
    task_id: 'task_4',
    child_id: 'directory',
    completed_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    status: 'pending',
    points_awarded: 10
  },
  {
    id: 'comp_3',
    task_id: 'task_2',
    child_id: 'directory',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'approved',
    points_awarded: 20
  }
];

export const INITIAL_REWARDS: Reward[] = [
  // Leo
  {
    id: 'rew_1',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🎮 30 Minutes of Gaming Time',
    cost_points: 50,
    is_available: true,
    icon_name: 'Gamepad2',
    limit_type: 'daily',
    created_at: new Date().toISOString()
  },
  {
    id: 'rew_2',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🍦 Family Ice Cream Outing',
    cost_points: 100,
    is_available: true,
    icon_name: 'IceCream',
    limit_type: 'one_time',
    created_at: new Date().toISOString()
  },

  // Lily
  {
    id: 'rew_3',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🎨 Brand New Watercolor Set',
    cost_points: 75,
    is_available: true,
    icon_name: 'Palette',
    limit_type: 'unlimited',
    created_at: new Date().toISOString()
  },
  {
    id: 'rew_4',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '📖 Pick a bedtime book to buy',
    cost_points: 40,
    is_available: true,
    icon_name: 'BookOpen',
    limit_type: 'twice_daily',
    created_at: new Date().toISOString()
  },

  // Sammy
  {
    id: 'rew_5',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🍕 Friday Pizza Choice Night',
    cost_points: 80,
    is_available: true,
    icon_name: 'Pizza',
    limit_type: 'unlimited',
    created_at: new Date().toISOString()
  },
  {
    id: 'rew_6',
    parent_id: 'parent_demo',
    child_id: 'directory',
    title: '🎪 Trip to the Local Amusement Park',
    cost_points: 300,
    is_available: true,
    icon_name: 'Sparkles',
    limit_type: 'one_time',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_REDEMPTIONS: RewardRedemption[] = [
  {
    id: 'red_1',
    reward_id: 'rew_1',
    child_id: 'directory',
    parent_id: 'parent_demo',
    redeemed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'requested'
  }
];
