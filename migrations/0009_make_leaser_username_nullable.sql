-- Migration: Make leaser username nullable since we now use user_id
-- The username is already stored in the users table and linked via user_id
-- Making this column nullable to avoid redundancy

ALTER TABLE leaser 
ALTER COLUMN username DROP NOT NULL;

COMMENT ON COLUMN leaser.username IS 'Legacy username field (nullable) - user_id now links to users table for username';
