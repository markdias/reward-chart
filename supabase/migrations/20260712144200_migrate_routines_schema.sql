CREATE OR REPLACE FUNCTION migrate_routines() RETURNS void AS $$
DECLARE
  child_record RECORD;
  old_routines JSONB;
  new_routines JSONB;
  routine JSONB;
  new_routine JSONB;
BEGIN
  FOR child_record IN SELECT id, routines FROM children WHERE routines IS NOT NULL LOOP
    old_routines := child_record.routines;
    new_routines := '[]'::JSONB;
    
    FOR routine IN SELECT * FROM jsonb_array_elements(old_routines) LOOP
      -- If they already migrated, don't overwrite with nulls if morningTaskIds exists, 
      -- fallback to taskIds or empty array.
      new_routine := jsonb_build_object(
        'id', routine->'id',
        'name', routine->'name',
        'morningTaskIds', COALESCE(routine->'morningTaskIds', routine->'taskIds', '[]'::jsonb),
        'afternoonTaskIds', COALESCE(routine->'afternoonTaskIds', '[]'::jsonb),
        'eveningTaskIds', COALESCE(routine->'eveningTaskIds', '[]'::jsonb)
      );
      new_routines := new_routines || new_routine;
    END LOOP;
    
    UPDATE children SET routines = new_routines WHERE id = child_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT migrate_routines();
DROP FUNCTION migrate_routines();
