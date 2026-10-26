-- One-off data migration: every user and workspace member on it-IT with Italian date, time and number formats.
-- Run it before translate-workspace-to-italian.mjs:
--   docker compose exec -T db psql -U postgres -d default -v ON_ERROR_STOP=1 < italian-locale-data-migration.sql

BEGIN;

-- The enum behind a status field cannot be replaced while a backup column still uses it.
DO $$
DECLARE
  backup_table text;
BEGIN
  FOR backup_table IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name LIKE '\_sales\_pipeline\_%\_backup\_%'
      AND column_name = 'status' AND data_type = 'USER-DEFINED'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN status TYPE text USING status::text', backup_table);
  END LOOP;
END $$;

UPDATE core."user" SET locale = 'it-IT' WHERE locale <> 'it-IT';
UPDATE core."userWorkspace" SET locale = 'it-IT' WHERE locale <> 'it-IT';

SET search_path TO workspace_625ssn7q5fb53v27p05ozzjbb;

UPDATE "workspaceMember" SET
  locale = 'it-IT',
  "dateFormat" = 'DAY_FIRST',
  "timeFormat" = 'HOUR_24',
  "numberFormat" = 'DOTS_AND_COMMA',
  "calendarStartDay" = 1
  WHERE "deletedAt" IS NULL;

UPDATE dashboard SET title = 'KPI del team' WHERE title = 'KPI Team';

UPDATE workflow SET name = 'Lead rapido' WHERE name = 'Quick Lead';
UPDATE workflow SET name = 'Crea l''azienda quando si aggiunge un nuovo lead'
  WHERE name = 'Create company when adding a new person';

COMMIT;
