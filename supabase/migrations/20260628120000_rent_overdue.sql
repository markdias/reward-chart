-- Add rent tracking fields
ALTER TABLE children 
ADD COLUMN IF NOT EXISTS is_rent_due boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rent_due_date timestamp with time zone;
