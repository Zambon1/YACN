-- Make non-essential application fields nullable
-- These fields are not collected in the basic search form

ALTER TABLE applications 
ALTER COLUMN gender DROP NOT NULL,
ALTER COLUMN photo_id DROP NOT NULL,
ALTER COLUMN employment_status DROP NOT NULL,
ALTER COLUMN valid_pay_stubs DROP NOT NULL,
ALTER COLUMN driver_license DROP NOT NULL,
ALTER COLUMN employment_hist DROP NOT NULL;

-- Update any existing rows to have default values
UPDATE applications SET gender = 'N/A' WHERE gender IS NULL;
UPDATE applications SET employment_status = 'Unknown' WHERE employment_status IS NULL;
