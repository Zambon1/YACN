-- Migration: store full application form payload for complete edit-prefill support
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS application_data JSONB;

COMMENT ON COLUMN applications.application_data IS 'Full submitted application payload used to repopulate edit form fields';
