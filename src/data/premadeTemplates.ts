import { Task, Reward } from '../types';

export const PREMADE_TASKS: Omit<Task, 'id' | 'created_at' | 'parent_id'>[] = [
  { title: 'Make your bed', points: 10, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Brush your teeth (morning)', points: 10, category: 'health', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Brush your teeth (evening)', points: 10, category: 'health', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Pack your school bag', points: 20, category: 'homework', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Do your homework', points: 50, category: 'homework', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Tidy your bedroom', points: 30, category: 'chores', recurrence: 'weekly', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Put dirty clothes in the wash basket', points: 10, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Set the dinner table', points: 15, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Clear the dinner table', points: 15, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Load the dishwasher', points: 20, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Empty the dishwasher', points: 20, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Feed the pets', points: 15, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Read a book for 20 minutes', points: 40, category: 'homework', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Help fold the laundry', points: 30, category: 'chores', recurrence: 'repeatable', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Put your shoes away', points: 10, category: 'chores', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Practice a musical instrument', points: 40, category: 'creative', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Do 15 minutes of maths practice', points: 30, category: 'homework', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Go outside and play', points: 20, category: 'health', recurrence: 'daily', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Put rubbish in the bin', points: 10, category: 'chores', recurrence: 'repeatable', is_active: true, child_id: 'directory', is_template: true },
  { title: 'Help with the gardening', points: 50, category: 'chores', recurrence: 'weekly', is_active: true, child_id: 'directory', is_template: true }
];

export const PREMADE_REWARDS: Omit<Reward, 'id' | 'created_at' | 'parent_id'>[] = [
  { title: '30 mins screen time', cost_points: 50, icon_name: 'Gamepad2', is_available: true, limit_type: 'daily', child_id: 'directory', is_template: true },
  { title: '1 hour gaming time', cost_points: 100, icon_name: 'Gamepad2', is_available: true, limit_type: 'daily', child_id: 'directory', is_template: true },
  { title: 'Choose a sweet treat', cost_points: 30, icon_name: 'Candy', is_available: true, limit_type: 'daily', child_id: 'directory', is_template: true },
  { title: 'Stay up 30 mins past bedtime', cost_points: 150, icon_name: 'Moon', is_available: true, limit_type: 'one_time', child_id: 'directory', is_template: true },
  { title: 'Choose the film for movie night', cost_points: 80, icon_name: 'Film', is_available: true, limit_type: 'one_time', child_id: 'directory', is_template: true },
  { title: 'Have a friend over to play', cost_points: 200, icon_name: 'Users', is_available: true, limit_type: 'one_time', child_id: 'directory', is_template: true },
  { title: 'Pick the dinner for tonight', cost_points: 100, icon_name: 'Pizza', is_available: true, limit_type: 'one_time', child_id: 'directory', is_template: true },
  { title: 'A trip to the park', cost_points: 50, icon_name: 'TreePine', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'Skip one chore pass', cost_points: 150, icon_name: 'FastForward', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: '15 mins extra iPad time', cost_points: 30, icon_name: 'Tablet', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'A comic book or magazine', cost_points: 250, icon_name: 'BookOpen', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'New app or game download', cost_points: 300, icon_name: 'Download', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'A trip to the swimming pool', cost_points: 200, icon_name: 'Waves', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'Choose dessert for the family', cost_points: 80, icon_name: 'IceCream', is_available: true, limit_type: 'one_time', child_id: 'directory', is_template: true },
  { title: 'Camp in the living room', cost_points: 150, icon_name: 'Tent', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'A new book', cost_points: 250, icon_name: 'Book', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'Choose the music in the car', cost_points: 20, icon_name: 'Music', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'Build a blanket fort', cost_points: 50, icon_name: 'Castle', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: 'Special one-on-one time with a parent', cost_points: 100, icon_name: 'Heart', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true },
  { title: '£5 pocket money', cost_points: 500, icon_name: 'Coins', is_available: true, limit_type: 'unlimited', child_id: 'directory', is_template: true }
];
