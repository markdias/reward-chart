-- Drop all maintenance pot, bills, rent, and repair tracking columns from children
ALTER TABLE children
  DROP COLUMN IF EXISTS maintenance_unlocked,
  DROP COLUMN IF EXISTS maintenance_unlock_seen,
  DROP COLUMN IF EXISTS maintenance_pot,
  DROP COLUMN IF EXISTS main_last_maintenance_date,
  DROP COLUMN IF EXISTS main_pot_damaged,
  DROP COLUMN IF EXISTS main_damage_date,
  DROP COLUMN IF EXISTS is_rent_due,
  DROP COLUMN IF EXISTS rent_due_date,
  DROP COLUMN IF EXISTS main_last_repair_date,
  DROP COLUMN IF EXISTS next_maintenance_due_date,
  DROP COLUMN IF EXISTS next_pot_break_date;

-- Drop maintenance pot configuration from parent_profiles
ALTER TABLE parent_profiles
  DROP COLUMN IF EXISTS maintenance_pot_unlock_level,
  DROP COLUMN IF EXISTS maintenance_pot_unlock_xp;
