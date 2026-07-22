-- Migration: Update tasks category check constraint to support 11 categories & re-categorise existing tasks

-- 1. Drop existing category check constraint if present
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;

-- 2. Add updated check constraint with all 11 categories
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check 
  CHECK (category IN (
    'chores',
    'homework',
    'behavior',
    'health',
    'creative',
    'kindness',
    'manners',
    'feelings',
    'learning',
    'self_care',
    'other'
  ));

-- 3. Auto-categorise existing tasks by title keyword patterns
UPDATE tasks SET category = 'self_care' 
WHERE LOWER(title) LIKE '%teeth%' 
   OR LOWER(title) LIKE '%dressed%' 
   OR LOWER(title) LIKE '%hair%' 
   OR LOWER(title) LIKE '%bath%' 
   OR LOWER(title) LIKE '%shower%'
   OR LOWER(title) LIKE '%wind-down%';

UPDATE tasks SET category = 'learning' 
WHERE LOWER(title) LIKE '%read%' 
   OR LOWER(title) LIKE '%math%' 
   OR LOWER(title) LIKE '%spelling%' 
   OR LOWER(title) LIKE '%word%' 
   OR LOWER(title) LIKE '%flashcard%';

UPDATE tasks SET category = 'kindness' 
WHERE LOWER(title) LIKE '%kind%' 
   OR LOWER(title) LIKE '%share%' 
   OR LOWER(title) LIKE '%compliment%';

UPDATE tasks SET category = 'manners' 
WHERE LOWER(title) LIKE '%please%' 
   OR LOWER(title) LIKE '%thank you%' 
   OR LOWER(title) LIKE '%apologize%' 
   OR LOWER(title) LIKE '%good morning%';

UPDATE tasks SET category = 'feelings' 
WHERE LOWER(title) LIKE '%feeling%' 
   OR LOWER(title) LIKE '%grateful%' 
   OR LOWER(title) LIKE '%emotion%';
