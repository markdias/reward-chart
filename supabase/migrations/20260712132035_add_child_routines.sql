-- Add routines and active_routine_id to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS routines JSONB DEFAULT '[
  {"id": "weekday", "name": "Weekday", "taskIds": []},
  {"id": "weekend", "name": "Weekend", "taskIds": []},
  {"id": "holiday", "name": "Holiday", "taskIds": []}
]'::jsonb;

ALTER TABLE children ADD COLUMN IF NOT EXISTS active_routine_id TEXT DEFAULT 'weekday';
