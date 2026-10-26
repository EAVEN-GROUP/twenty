-- One-off data migration for the setter -> closer pipeline. Run once, after setup-sales-pipeline.mjs:
--   docker compose exec -T db psql -U postgres -d default -v ON_ERROR_STOP=1 < sales-pipeline-data-migration.sql

BEGIN;

SET search_path TO workspace_625ssn7q5fb53v27p05ozzjbb;

CREATE TABLE public._sales_pipeline_person_backup_20261025 AS
  SELECT id, status, "callAttempts", "nextCallAt" FROM person;
CREATE TABLE public._sales_pipeline_opportunity_backup_20261025 AS
  SELECT id, status, "repId" FROM opportunity;
CREATE TABLE public._sales_pipeline_meeting_backup_20261025 AS
  SELECT id, status FROM _meeting;

-- The real attempt count of old No answer leads is unknown, so they restart at one.
UPDATE person SET "callAttempts" = 1, "nextCallAt" = now()
  WHERE status = 'NO_ANSWER' AND "deletedAt" IS NULL;

UPDATE person SET "nextCallAt" = now()
  WHERE status IN ('FOLLOW_UP', 'SEND_INFO') AND "nextCallAt" IS NULL AND "deletedAt" IS NULL;

UPDATE opportunity o SET status = 'MEETING_SCHEDULED'
  FROM person p
  WHERE p.id = o."pointOfContactId" AND p.status = 'BOOKED'
    AND o.status IS NULL AND o."deletedAt" IS NULL;

-- Before the closer role existed, whoever booked the meeting ran it.
UPDATE opportunity SET "repId" = "ownerId"
  WHERE status = 'MEETING_SCHEDULED' AND "repId" IS NULL AND "deletedAt" IS NULL;

UPDATE _meeting SET status = 'COMPLETED'
  WHERE status IS NULL AND "showUp" AND "deletedAt" IS NULL;

UPDATE _meeting SET status = 'SCHEDULED'
  WHERE status IS NULL AND "meetingDate" > now() AND "deletedAt" IS NULL;

UPDATE "workspaceMember" SET "isCloser" = true
  WHERE id = '3e375c27-3c23-4fe6-9a2c-c7683c7144d5';

COMMIT;
