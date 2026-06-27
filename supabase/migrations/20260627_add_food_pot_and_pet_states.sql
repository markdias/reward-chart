-- Migration to add Food Pot and Pet Feeding state columns to the children table
ALTER TABLE children
ADD COLUMN IF NOT EXISTS food_pot INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS food_pot_unlocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS food_pot_unlock_seen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS food_pot_weekly_contribution INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pet_fed_today BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS pet_hunger_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pet_unhappy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_fed_date TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_hunger_check_date TEXT DEFAULT NULL;
