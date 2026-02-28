-- Migration: Fix phone column type in users table
-- Issue: Phone numbers exceed integer max value (2,147,483,647)
-- Solution: Change phone column from integer to varchar(20)

-- Change phone column type from integer to varchar
ALTER TABLE users 
ALTER COLUMN phone TYPE VARCHAR(20) USING phone::text;

-- Add comment for documentation
COMMENT ON COLUMN users.phone IS 'User phone number (stored as text to support various formats and international numbers)';
