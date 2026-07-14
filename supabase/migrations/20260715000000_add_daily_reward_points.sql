-- Add daily reward points for the Daily Bonus
ALTER TABLE public.parent_profiles
ADD COLUMN daily_reward_points integer NOT NULL DEFAULT 50;
