/
  --0 - Schema Sections
CREATE SCHEMA core;
CREATE SCHEMA secure;



  --1 - USERS
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('renter','landlord','admin')),
    created_at TIMESTAMP DEFAULT now()
);



  --2 - PROFILES
CREATE TABLE core.renter_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
    employment_status TEXT,
    annual_income INTEGER,
    income_verified BOOLEAN DEFAULT FALSE,
    credit_pass BOOLEAN,
    created_at TIMESTAMP DEFAULT now()
);



  --3 - GUARANTORS (MULTIPLE GUARANTOR PER RENTER SUPPORTED)
CREATE TABLE core.guarantors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    renter_id UUID REFERENCES core.renter_profiles(id) ON DELETE CASCADE,
    annual_income INTEGER,
    credit_pass BOOLEAN,
    relationship TEXT,
    created_at TIMESTAMP DEFAULT now()
);
--Note: Applications must allow multiple financial profiles e.g. filter query w/ (renter_income + SUM(guarantor_income)) >= required_threshold



  --4 - SECURE Personal Information Indicator (PII) TABLE
CREATE TABLE secure.renter_identity_tokens (
    renter_id UUID PRIMARY KEY,
    ssn_token TEXT,
    identity_verification_token TEXT,
    credit_report_token TEXT,
    background_report_token TEXT,
    provider TEXT,
    created_at TIMESTAMP DEFAULT now()
);
--Note: Tokenized sensitive information pull from TransUnion or Experian



  --5 - Landlord Organization
CREATE TABLE core.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);



  5B - Memmbers (Managers or Owners)
CREATE TABLE core.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES core.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner','manager'))
);



  --6 - Properties
CREATE TABLE core.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES core.organizations(id),
    address_line_1 TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    created_at TIMESTAMP DEFAULT now()
);



  --6B - Units
CREATE TABLE core.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES core.properties(id),
    bedrooms INTEGER,
    bathrooms NUMERIC,
    rent_amount INTEGER,
    available BOOLEAN DEFAULT TRUE
);



  --7 Landlord Qualification Rules
CREATE TABLE core.qualification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES core.organizations(id),
    min_income_ratio NUMERIC,
    require_credit_pass BOOLEAN DEFAULT TRUE,
    allow_guarantors BOOLEAN DEFAULT TRUE,
    no_prior_evictions BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now()
);
  --Note: One Set rule per organization



  --8 Organizations
CREATE TABLE core.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES core.units(id),
    renter_id UUID REFERENCES core.renter_profiles(id),
    current_status TEXT CHECK (
        current_status IN (
            'submitted',
            'auto_rejected',
            'auto_approved',
            'manual_override',
            'withdrawn'
        )
    ),
    created_at TIMESTAMP DEFAULT now()
);



  --9 Application Events (Log) [Needed for Fair Housing Compliance]
CREATE TABLE core.application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES core.applications(id) ON DELETE CASCADE,
    event_type TEXT,
    triggered_by TEXT CHECK (triggered_by IN ('system','landlord')),
    reason TEXT,
    created_at TIMESTAMP DEFAULT now()
);



  --10 Rule Trigger Logging (“5 listings removed due to income requirement.”)
CREATE TABLE core.application_rule_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES core.applications(id),
    rule_name TEXT,
    renter_value TEXT,
    rule_threshold TEXT,
    result TEXT CHECK (result IN ('pass','fail')),
    created_at TIMESTAMP DEFAULT now()
);