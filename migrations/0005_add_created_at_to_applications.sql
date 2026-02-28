-- Add created_at column to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
