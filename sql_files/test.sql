
  --1 - USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone INT UNIQUE,
    password_hash TEXT NOT NULL,
    application_id INT,
    settings_id INT,
    preferences_id INT,
    role VARCHAR(255) CHECK (role IN ('manager', 'owner', 'renter')),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (settings_id) REFERENCES settings(id),
    FOREIGN KEY (preferences_id) REFERENCES preferences(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  text_messages BOOLEAN,
  email_list BOOLEAN,
  dark_mode BOOLEAN
);

CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  price_min INT,
  price_max INT,
  pet_preference BOOLEAN,
  bedroom_preference INT CHECK (bedroom_preference IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
  bathroom_preference INT CHECK (bathroom_preference IN (1, 2, 3, 4, 5, 6)),
  term_preference INT CHECK (term_preference IN (1, 2, 3)),
  user_id UUID NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE guarantor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL ON DELETE CASCADE,
  monthly_income INT NOT NULL,
  criminal_check BOOLEAN,
  credit_score VARCHAR(255) CHECK (credit_score IN ('very poor', 'poor', 'fair', 'good', 'excellent'))
);

CREATE TABLE leaser (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone INT,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE complex (
  id SERIAL PRIMARY KEY,
  leaser_id UUID NOT NULL REFERENCES leaser(id) ON DELETE CASCADE,
  us_state VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  area_code INT,
  application_rules_id INT REFERENCES application_rules(id) ON DELETE CASCADE
);

CREATE TABLE unit (
  id SERIAL PRIMARY KEY,
  complex_id INT NOT NULL REFERENCES complex(id) ON DELETE CASCADE,
  price INT NOT NULL,
  term INT CHECK (term IN (1, 3, 6, 9, 12)),
  bedroom INT CHECK (bedroom IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
  bathroom INT CHECK (bathroom IN (1, 2, 3, 4, 5, 6)),
  available BOOLEAN NOT NULL
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id INT REFERENCES unit(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  gender VARCHAR(255) CHECK (gender IN ('male', 'female')) NOT NULL,
  email VARCHAR(255) NOT NULL,
  photo_id BOOLEAN,
  employment_status VARCHAR(255) CHECK (employment_status IN ('Employed', 'Self-Employed', 'Unemployed', 'Other')),
  monthly_income INT,
  valid_pay_stubs BOOLEAN,
  pets INT,
  birthday DATE,
  driver_license INT,
  employment_hist BOOLEAN,
  children INT,
  guarantor_id UUID REFERENCES guarantor(id),
  credit_score VARCHAR(255) CHECK (credit_score IN ('poor', 'fair', 'good', 'excellent')),
  evictions BOOLEAN,
  criminal_record BOOLEAN
);

CREATE TABLE application_requirements (
  id SERIAL PRIMARY KEY,
  complex_id INT NOT NULL REFERENCES complex(id) ON DELETE CASCADE,
  first_name BOOLEAN,
  last_name BOOLEAN,
  gender VARCHAR(255) CHECK (gender IN ('male', 'female')),
  email BOOLEAN,
  photo_id BOOLEAN,
  employment_status VARCHAR(255) CHECK (employment_status IN ('Employed', 'Self-Employed', 'Unemployed', 'Any')),
  min_monthly_income_ratio NUMERIC,
  valid_pay_stubs BOOLEAN,
  pets INT NOT NULL,
  birthday BOOLEAN,
  driver_license BOOLEAN,
  employment_hist BOOLEAN,
  children_allowed INT,
  guarantor_allowed BOOLEAN,
  credit_score_min VARCHAR(255) CHECK (credit_score IN ('poor', 'fair', 'good', 'excellent')),
  evictions BOOLEAN,
  criminal_record BOOLEAN
);

  --2 - PROFILES
-- CREATE TABLE core.renter_profiles (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
--     employment_status TEXT,
--     annual_income INTEGER,
--     income_verified BOOLEAN DEFAULT FALSE,
--     credit_pass BOOLEAN,
--     created_at TIMESTAMP DEFAULT now()
-- );



  --3 - GUARANTORS (MULTIPLE GUARANTOR PER RENTER SUPPORTED)
-- CREATE TABLE core.guarantors (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     renter_id UUID REFERENCES core.renter_profiles(id) ON DELETE CASCADE,
--     annual_income INTEGER,
--     credit_pass BOOLEAN,
--     relationship TEXT,
--     created_at TIMESTAMP DEFAULT now()
-- );
--Note: Applications must allow multiple financial profiles e.g. filter query w/ (renter_income + SUM(guarantor_income)) >= required_threshold



  --4 - SECURE Personal Information Indicator (PII) TABLE
-- CREATE TABLE secure.renter_identity_tokens (
--     renter_id UUID PRIMARY KEY,
--     ssn_token TEXT,
--     identity_verification_token TEXT,
--     credit_report_token TEXT,
--     background_report_token TEXT,
--     provider TEXT,
--     created_at TIMESTAMP DEFAULT now()
-- );
--Note: Tokenized sensitive information pull from TransUnion or Experian



  --5 - Landlord Organization
-- CREATE TABLE core.organizations (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT now()
-- );



  --5B - Members (Managers or Owners)
-- CREATE TABLE core.organization_members (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     organization_id UUID REFERENCES core.organizations(id) ON DELETE CASCADE,
--     user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
--     role TEXT CHECK (role IN ('owner','manager'))
-- );



  --6 - Properties
-- CREATE TABLE core.properties (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     organization_id UUID REFERENCES core.organizations(id),
--     address_line_1 TEXT,
--     city TEXT,
--     state TEXT,
--     zip TEXT,
--     created_at TIMESTAMP DEFAULT now()
-- );



  --6B - Units
-- CREATE TABLE core.units (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     property_id UUID REFERENCES core.properties(id),
--     bedrooms INTEGER,
--     bathrooms NUMERIC,
--     rent_amount INTEGER,
--     available BOOLEAN DEFAULT TRUE
-- );



  --7 Landlord Qualification Rules
-- CREATE TABLE core.qualification_rules (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     organization_id UUID REFERENCES core.organizations(id),
--     min_income_ratio NUMERIC,
--     require_credit_pass BOOLEAN DEFAULT TRUE,
--     allow_guarantors BOOLEAN DEFAULT TRUE,
--     no_prior_evictions BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP DEFAULT now()
-- );
  --Note: One Set rule per organization



  --8 Applications Justification and Status
-- CREATE TABLE core.applications (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     unit_id UUID REFERENCES core.units(id),
--     renter_id UUID REFERENCES core.renter_profiles(id),
--     current_status TEXT CHECK (
--         current_status IN (
--             'submitted',
--             'auto_rejected',
--             'auto_approved',
--             'manual_override',
--             'withdrawn'
--         )
--     ),
--     created_at TIMESTAMP DEFAULT now()
-- );



  --9 Application Events (Log) [Needed for Fair Housing Compliance]
-- CREATE TABLE core.application_events (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     application_id UUID REFERENCES core.applications(id) ON DELETE CASCADE,
--     event_type TEXT,
--     triggered_by TEXT CHECK (triggered_by IN ('system','landlord')),
--     reason TEXT,
--     created_at TIMESTAMP DEFAULT now()
-- );



  --10 Rule Trigger Logging (“5 listings removed due to income requirement.”)
-- CREATE TABLE core.application_rule_logs (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     application_id UUID REFERENCES core.applications(id),
--     rule_name TEXT,
--     renter_value TEXT,
--     rule_threshold TEXT,
--     result TEXT CHECK (result IN ('pass','fail')),
--     created_at TIMESTAMP DEFAULT now()
-- );