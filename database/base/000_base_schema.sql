-- Base schema for RentMatch PostgreSQL database
-- Integrated from test.sql with comprehensive rental application system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Settings table (referenced by users)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  text_messages BOOLEAN DEFAULT TRUE,
  email_list BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE
);

-- Preferences table (referenced by users)
CREATE TABLE IF NOT EXISTS preferences (
  id SERIAL PRIMARY KEY,
  price_min INT,
  price_max INT,
  pet_preference BOOLEAN,
  bedroom_preference INT CHECK (bedroom_preference BETWEEN 1 AND 10),
  bathroom_preference INT CHECK (bathroom_preference BETWEEN 1 AND 6),
  term_preference INT CHECK (term_preference IN (1, 2, 3))
);

-- Leaser/Landlord table
CREATE TABLE IF NOT EXISTS leaser (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255) NOT NULL
);

-- Complex/Property table
CREATE TABLE IF NOT EXISTS complex (
  id SERIAL PRIMARY KEY,
  leaser_id UUID REFERENCES leaser(id) ON DELETE CASCADE,
  us_state VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  area_code INT
);

-- Application requirements per complex
CREATE TABLE IF NOT EXISTS application_requirements (
  id SERIAL PRIMARY KEY,
  complex_id INT NOT NULL REFERENCES complex(id) ON DELETE CASCADE,
  first_name BOOLEAN DEFAULT TRUE,
  last_name BOOLEAN DEFAULT TRUE,
  gender VARCHAR(255) CHECK (gender IN ('male', 'female', 'any')),
  email BOOLEAN DEFAULT TRUE,
  photo_id BOOLEAN DEFAULT FALSE,
  employment_status VARCHAR(255) CHECK (employment_status IN ('Employed', 'Self-Employed', 'Unemployed', 'Any')),
  min_monthly_income_ratio NUMERIC DEFAULT 3.0,
  valid_pay_stubs BOOLEAN DEFAULT FALSE,
  pets INT DEFAULT 0,
  birthday BOOLEAN DEFAULT FALSE,
  driver_license BOOLEAN DEFAULT FALSE,
  employment_hist BOOLEAN DEFAULT FALSE,
  children_allowed INT DEFAULT 10,
  guarantor_allowed BOOLEAN DEFAULT TRUE,
  credit_score_min VARCHAR(255) CHECK (credit_score_min IN ('poor', 'fair', 'good', 'excellent')),
  evictions BOOLEAN DEFAULT FALSE,
  criminal_record BOOLEAN DEFAULT FALSE
);

-- Units table
CREATE TABLE IF NOT EXISTS unit (
  id SERIAL PRIMARY KEY,
  complex_id INT NOT NULL REFERENCES complex(id) ON DELETE CASCADE,
  price INT NOT NULL,
  term INT CHECK (term IN (1, 3, 6, 9, 12)),
  bedroom INT CHECK (bedroom BETWEEN 1 AND 10),
  bathroom INT CHECK (bathroom BETWEEN 1 AND 6),
  available BOOLEAN NOT NULL DEFAULT TRUE
);

-- Users table (enhanced with role-based access)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    settings_id INT REFERENCES settings(id),
    preferences_id INT REFERENCES preferences(id),
    role VARCHAR(255) DEFAULT 'renter' CHECK (role IN ('manager', 'owner', 'renter')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (unchanged, works with UUID user_id)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Guarantor table
CREATE TABLE IF NOT EXISTS guarantor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL ON DELETE CASCADE,
  monthly_income INT NOT NULL,
  criminal_check BOOLEAN DEFAULT FALSE,
  credit_score VARCHAR(255) CHECK (credit_score IN ('very poor', 'poor', 'fair', 'good', 'excellent'))
);

-- Applications table (enhanced with detailed fields)
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  unit_id INT REFERENCES unit(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  gender VARCHAR(255) CHECK (gender IN ('male', 'female', 'other')),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  photo_id BOOLEAN DEFAULT FALSE,
  employment_status VARCHAR(255) CHECK (employment_status IN ('Employed', 'Self-Employed', 'Unemployed', 'Other')),
  monthly_income INT,
  valid_pay_stubs BOOLEAN DEFAULT FALSE,
  pets INT DEFAULT 0,
  birthday DATE,
  driver_license VARCHAR(255),
  employment_hist BOOLEAN DEFAULT FALSE,
  children INT DEFAULT 0,
  guarantor_id UUID REFERENCES guarantor(id),
  credit_score VARCHAR(255) CHECK (credit_score IN ('very poor', 'poor', 'fair', 'good', 'excellent')),
  evictions BOOLEAN DEFAULT FALSE,
  criminal_record BOOLEAN DEFAULT FALSE,
  applicant_data JSONB,
  match_count INTEGER DEFAULT 0,
  top_rejection_reasons JSONB,
  current_status TEXT DEFAULT 'submitted' CHECK (
    current_status IN (
      'submitted',
      'auto_rejected',
      'auto_approved',
      'manual_override',
      'withdrawn'
    )
  ),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Application events (logging for compliance)
CREATE TABLE IF NOT EXISTS application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id INT REFERENCES applications(id) ON DELETE CASCADE,
    event_type TEXT,
    triggered_by TEXT CHECK (triggered_by IN ('system','landlord','renter')),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Application rule logs (track which rules passed/failed)
CREATE TABLE IF NOT EXISTS application_rule_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id INT REFERENCES applications(id),
    rule_name TEXT,
    renter_value TEXT,
    rule_threshold TEXT,
    result TEXT CHECK (result IN ('pass','fail')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_unit_id ON applications(unit_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(current_status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_unit_complex_id ON unit(complex_id);
CREATE INDEX IF NOT EXISTS idx_unit_available ON unit(available);
CREATE INDEX IF NOT EXISTS idx_guarantor_user_id ON guarantor(user_id);
