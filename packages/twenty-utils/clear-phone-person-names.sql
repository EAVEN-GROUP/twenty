-- One-off cleanup: the lead importer wrote the phone number into the lead name. Clears those names (the phone stays in Phones).
-- Only touches leads without a first name whose last name is the lead's own phone number, with or without the calling code.
-- Backup of the cleared names: public._person_name_backup_20261027. Run once:
--   docker compose exec -T db psql -U postgres -d default -v ON_ERROR_STOP=1 < clear-phone-person-names.sql
-- Rollback:
--   UPDATE workspace_625ssn7q5fb53v27p05ozzjbb.person p SET "nameLastName" = b."nameLastName"
--     FROM public._person_name_backup_20261027 b
--     WHERE p.id = b.id AND p."nameLastName" IS NULL AND coalesce(p."nameFirstName", '') = '';

BEGIN;

CREATE TABLE public._person_name_backup_20261027 AS
SELECT id, "nameLastName"
FROM workspace_625ssn7q5fb53v27p05ozzjbb.person
WHERE coalesce("nameFirstName", '') = ''
  AND coalesce("nameLastName", '') <> ''
  AND "nameLastName" !~ '[A-Za-z]'
  AND regexp_replace("nameLastName", '\D', '', 'g') IN (
    regexp_replace(coalesce("phonesPrimaryPhoneNumber", ''), '\D', '', 'g'),
    regexp_replace(coalesce("phonesPrimaryPhoneCallingCode", '') || coalesce("phonesPrimaryPhoneNumber", ''), '\D', '', 'g')
  );

UPDATE workspace_625ssn7q5fb53v27p05ozzjbb.person p
SET "nameLastName" = NULL
FROM public._person_name_backup_20261027 b
WHERE p.id = b.id;

COMMIT;
