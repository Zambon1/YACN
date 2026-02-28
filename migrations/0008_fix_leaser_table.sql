-- Migration: Add user_id to leaser table and fix data types
-- Issue: leaser table is missing user_id column to link to users table
-- Also fix phone and license_number to varchar for proper storage

-- Add user_id column to link leaser to users table
ALTER TABLE leaser 
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Change phone column from integer to varchar to support all phone formats
ALTER TABLE leaser 
ALTER COLUMN phone TYPE VARCHAR(20) USING phone::text;

-- Change license_number from integer to varchar to support alphanumeric licenses
ALTER TABLE leaser 
ALTER COLUMN license_number TYPE VARCHAR(50) USING license_number::text;

-- Make license_number nullable (it's optional)
ALTER TABLE leaser 
ALTER COLUMN license_number DROP NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN leaser.user_id IS 'Reference to the user account for this landlord';
COMMENT ON COLUMN leaser.phone IS 'Contact phone number (stored as text to support various formats)';
COMMENT ON COLUMN leaser.license_number IS 'Real estate or property management license number (optional)';
