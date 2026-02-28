-- Migration: Add apartment/property data structure and seed data
-- This migration extends the complex and unit tables to accommodate full apartment data

-- Add missing columns to complex table
ALTER TABLE complex 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS amenities TEXT[], -- Array of amenities
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_types TEXT[], -- Array of allowed pet types
ADD COLUMN IF NOT EXISTS max_pets INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pet_deposit INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_evictions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_bankruptcies BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_criminal_record BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_credit_score INT,
ADD COLUMN IF NOT EXISTS min_income_multiplier NUMERIC;

-- Add deposit column to unit table
ALTER TABLE unit
ADD COLUMN IF NOT EXISTS deposit INT;

-- Drop and recreate bedroom constraint to allow 0 (studio apartments)
ALTER TABLE unit DROP CONSTRAINT IF EXISTS unit_bedroom_check;
ALTER TABLE unit ADD CONSTRAINT unit_bedroom_check CHECK (bedroom IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10));

-- Insert apartment data as complexes with their units

-- Apartment 1: Sunset Vista Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Sunset Vista Apartments', 'TX', 'Austin', '123 Main St', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Pool', 'Gym', 'Parking', 'Laundry'], true, ARRAY['dog', 'cat'], 2, 300, false, false, false, false, 650, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1200, 1000, 1, 1, true);

-- Apartment 2: Downtown Luxury Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Downtown Luxury Lofts', 'TX', 'Austin', '456 Congress Ave', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Concierge', 'Rooftop Deck', 'Gym', 'Pet Spa'], true, ARRAY['dog', 'cat'], 1, 500, false, false, false, false, 700, 3.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 2100, 2000, 2, 2, true);

-- Apartment 3: Green Meadows Complex
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Green Meadows Complex', 'TX', 'Austin', '789 Park Ln', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', ARRAY['Pool', 'Playground', 'BBQ Area', 'Dog Park'], true, ARRAY['dog', 'cat', 'other'], 3, 200, false, false, true, false, 620, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1450, 1200, 2, 1.5, true);

-- Apartment 4: Riverside Studios
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Riverside Studios', 'TX', 'Austin', '321 River Rd', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80', ARRAY['Laundry', 'Bike Storage', 'WiFi Included'], true, ARRAY['cat'], 1, 150, false, false, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 950, 800, 0, 1, true);

-- Apartment 5: Oak Tree Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Oak Tree Apartments', 'TX', 'Austin', '555 Oak Dr', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400', ARRAY['Pool', 'Gym', 'Clubhouse', 'Garage'], true, ARRAY['dog', 'cat', 'both'], 2, 350, false, false, false, false, 680, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1850, 1500, 3, 2, true);

-- Apartment 6: Budget-Friendly Flats
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Budget-Friendly Flats', 'TX', 'Austin', '888 Budget Blvd', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400', ARRAY['Laundry', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, true, true, true, true, 580, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 600, 1, 1, true);

-- Apartment 7: University Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('University Towers', 'TX', 'Austin', '999 Campus Way', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Study Room', 'Gym', 'Computer Lab', 'Shuttle Service'], false, ARRAY[]::TEXT[], 0, 0, false, false, true, false, 640, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1600, 1300, 2, 2, true);

-- Apartment 8: The Hamilton
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('The Hamilton', 'TX', 'Austin', '242 Hamilton St', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', ARRAY['Pool', 'Gym', 'Theater Room', 'Private Garage', 'Gated'], true, ARRAY['dog', 'cat', 'both'], 2, 400, false, false, false, false, 720, 3.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 2500, 2500, 4, 2.5, true);

-- Apartment 9: Parkview Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Parkview Heights', 'TX', 'Dallas', '102 Oak Ridge', 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=400&q=80', ARRAY['Pool', 'Fitness Center', 'Parking', 'Community Room'], true, ARRAY['dog', 'cat'], 2, 250, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1550, 1300, 2, 2, true);

-- Apartment 10: Urban Nest Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Urban Nest Lofts', 'TX', 'Houston', '245 Commerce St', 'https://images.unsplash.com/photo-1486304873000-235643847519?w=400&q=80', ARRAY['WiFi Included', 'Utilities Included', 'Laundry'], false, ARRAY[]::TEXT[], 0, 0, false, true, false, false, 600, 2.8);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1100, 900, 1, 1, true);

-- Apartment 11: Sunrise Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Sunrise Apartments', 'TX', 'Austin', '567 Sunrise Ave', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Parking', 'Laundry On-Site'], true, ARRAY['cat'], 1, 100, false, true, true, true, 580, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 700, 0, 1, true);

-- Apartment 12: Meadowridge Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Meadowridge Residences', 'TX', 'San Antonio', '890 Prairie Ln', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', ARRAY['Pool', 'Basketball Court', 'Playground', 'Gated Security'], true, ARRAY['dog', 'cat'], 2, 300, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1750, 1500, 3, 2, true);

-- Apartment 13: Downtown Plaza
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Downtown Plaza', 'TX', 'Austin', '123 Main Circle', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Gym', 'Rooftop Terrace', '24hr Security'], true, ARRAY['dog', 'cat', 'other'], 2, 200, false, false, true, false, 620, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1300, 1100, 1, 1.5, true);

-- Apartment 14: Vintage Quarters
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Vintage Quarters', 'TX', 'Dallas', '456 Heritage Blvd', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Heat Included', 'Water Included', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, true, true, true, true, 600, 2.9);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1200, 1000, 2, 1, true);

-- Apartment 15: Crystal Springs Complex
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Crystal Springs Complex', 'TX', 'Houston', '789 Spring Way', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', ARRAY['Pool', 'Sauna', 'Gym', 'Dog Park', 'Concierge'], true, ARRAY['dog'], 1, 350, false, false, false, false, 680, 3.3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1950, 1800, 3, 2.5, true);

-- Apartment 16: Lakeside Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Lakeside Apartments', 'TX', 'Austin', '234 Water View Dr', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Lake Access', 'Parking', 'Laundry'], true, ARRAY['cat', 'fish'], 2, 120, false, true, true, false, 610, 2.7);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 950, 800, 0, 1, true);

-- Apartment 17: Silver Pines Community
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Silver Pines Community', 'TX', 'San Antonio', '567 Pine Ridge', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Fitness Center', 'Clubhouse', 'Parking'], true, ARRAY['dog', 'cat'], 1, 280, false, false, true, true, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1450, 1200, 2, 2, true);

-- Apartment 18: Metropolitan Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Metropolitan Heights', 'TX', 'Dallas', '890 High St', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', ARRAY['Pool', 'Gym', 'Theater', 'Garage', 'Rooftop Deck'], true, ARRAY['dog', 'cat'], 2, 450, false, false, false, false, 700, 3.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 2800, 2500, 4, 3, true);

-- Apartment 19: Cozy Corner Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Cozy Corner Apartments', 'TX', 'Austin', '345 Corner Ave', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['WiFi', 'Utilities', 'Parking Spot'], true, ARRAY['cat'], 1, 100, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1050, 900, 1, 1, true);

-- Apartment 20: Riverside Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Riverside Towers', 'TX', 'Houston', '678 River Front', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['River View', 'Gym', 'Parking', 'Elevator'], false, ARRAY[]::TEXT[], 0, 0, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1600, 1400, 2, 2, true);

-- Apartment 21: Summit Building
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Summit Building', 'TX', 'San Antonio', '921 Peak Ln', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Parking', 'Security', 'Laundry'], true, ARRAY['cat'], 1, 100, false, true, true, true, 590, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 800, 700, 0, 1, true);

-- Apartment 22: Garden Grove Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Garden Grove Residences', 'TX', 'Austin', '234 Garden Dr', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Garden Area', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog', 'cat'], 2, 250, false, false, true, false, 620, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1400, 1200, 2, 1.5, true);

-- Apartment 23: Harmony Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Harmony Apartments', 'TX', 'Dallas', '567 Peace Blvd', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Community Garden', 'Fitness', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 180, false, false, true, false, 610, 2.8);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1150, 1000, 1, 1, true);

-- Apartment 24: Cypress Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Cypress Towers', 'TX', 'Houston', '890 Cypress St', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Pool', 'Gym', 'Dog Park', 'Parking', 'Elevator'], true, ARRAY['dog'], 1, 300, false, false, false, false, 670, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1850, 1600, 3, 2, true);

-- Apartment 25: Stellar Suites
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Stellar Suites', 'TX', 'Austin', '123 Stellar Ln', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Furnished Option', 'Utilities', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, false, true, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 750, 0, 1, true);

-- Apartment 26: Phoenix Park
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Phoenix Park', 'TX', 'San Antonio', '456 Phoenix Ave', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Park Access', 'Pool', 'Gym', 'Security'], true, ARRAY['dog', 'cat'], 2, 270, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1500, 1300, 2, 2, true);

-- Apartment 27: Valley View Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Valley View Apartments', 'TX', 'Dallas', '789 Valley Rd', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Parking', 'Laundry', 'Security'], true, ARRAY['cat'], 1, 120, false, true, true, true, 600, 2.7);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1100, 900, 1, 1, true);

-- Apartment 28: Liberty Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Liberty Heights', 'TX', 'Houston', '234 Liberty St', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['New Construction', 'Heat Included', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, true, true, true, false, 620, 2.9);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1350, 1150, 2, 1.5, true);

-- Apartment 29: Noble Estate
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Noble Estate', 'TX', 'Austin', '567 Noble Dr', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Pool', 'Fitness', 'Rooftop', 'Parking'], true, ARRAY['dog', 'cat'], 2, 320, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1800, 1500, 3, 2, true);

-- Apartment 30: Beacon Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Beacon Place', 'TX', 'San Antonio', '890 Beacon Ln', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['WiFi Included', 'Parking', 'Laundry'], true, ARRAY['cat', 'bird'], 2, 130, false, true, true, true, 590, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 700, 0, 1, true);

-- Apartment 31: Majestic Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Majestic Towers', 'TX', 'Dallas', '123 Majestic Way', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Gym', 'Concierge', 'Parking', 'Elevator'], true, ARRAY['dog', 'cat'], 1, 300, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1650, 1400, 2, 2, true);

-- Apartment 32: Veranda Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Veranda Apartments', 'TX', 'Houston', '456 Veranda Ct', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Porch', 'Parking', 'Laundry'], true, ARRAY['dog', 'cat'], 2, 200, false, true, true, false, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1050, 900, 1, 1, true);

-- Apartment 33: Pinnacle Plaza
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Pinnacle Plaza', 'TX', 'Austin', '789 Pinnacle Way', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Luxury Finishes', 'Pool', 'Gym', 'Valet'], true, ARRAY['dog', 'cat'], 2, 350, false, false, false, false, 680, 3.3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 2000, 1700, 3, 2.5, true);

-- Apartment 34: Tranquil Oaks
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Tranquil Oaks', 'TX', 'San Antonio', '234 Oak Terrace', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Tree-Lined Streets', 'Parking', 'Laundry'], true, ARRAY['dog'], 1, 250, false, false, true, false, 610, 2.8);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1200, 1000, 2, 1, true);

-- Apartment 35: Vertex Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Vertex Residences', 'TX', 'Dallas', '567 Vertex Blvd', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Move-In Special', 'Utilities', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, true, true, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 800, 0, 1, true);

-- Apartment 36: Celestial Court
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Celestial Court', 'TX', 'Houston', '890 Star Lane', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Night Security', 'Parking', 'Gym'], true, ARRAY['cat'], 1, 150, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1550, 1350, 2, 2, true);

-- Apartment 37: Meridian Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Meridian Lofts', 'TX', 'Austin', '123 Meridian Ave', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Urban Setting', 'Rooftop', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 220, false, false, true, false, 620, 2.9);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1300, 1100, 1, 1.5, true);

-- Apartment 38: Serenity Gardens
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Serenity Gardens', 'TX', 'San Antonio', '456 Garden Path', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Garden Spaces', 'Pool', 'Walking Paths'], true, ARRAY['dog', 'cat'], 2, 300, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1750, 1500, 3, 2, true);

-- Apartment 39: Eclipse Tower
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Eclipse Tower', 'TX', 'Dallas', '789 Eclipse Dr', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Modern Finishes', 'Gym', 'Garage', 'Parking'], true, ARRAY['dog'], 1, 280, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1700, 1500, 2, 2, true);

-- Apartment 40: Zenith Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Zenith Place', 'TX', 'Houston', '234 Zenith Blvd', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['All Utilities', 'Parking', 'On-Site Laundry'], true, ARRAY['cat'], 1, 100, false, true, true, true, 590, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 750, 0, 1, true);

-- Apartment 41: Sanctuary Suites
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Sanctuary Suites', 'TX', 'Austin', '567 Sanctuary Ln', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Quiet Community', 'Parking', 'Fitness'], true, ARRAY['dog', 'cat'], 1, 180, false, true, true, false, 610, 2.7);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1100, 950, 1, 1, true);

-- Apartment 42: Quantum Complex
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Quantum Complex', 'TX', 'San Antonio', '890 Quantum St', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Upgraded Appliances', 'Parking', 'Gym'], false, ARRAY[]::TEXT[], 0, 0, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1400, 1200, 2, 1.5, true);

-- Apartment 43: Aurora Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Aurora Heights', 'TX', 'Dallas', '123 Aurora Way', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Sunrise Views', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog', 'cat'], 2, 320, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1850, 1600, 3, 2, true);

-- Apartment 44: Infinity Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Infinity Lofts', 'TX', 'Houston', '456 Infinity Ln', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Pet Friendly', 'WiFi', 'Parking'], true, ARRAY['cat', 'fish'], 2, 140, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1050, 900, 1, 1, true);

-- Apartment 45: Nucleus Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Nucleus Apartments', 'TX', 'Austin', '789 Nucleus Ave', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Central Location', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog'], 1, 290, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1600, 1400, 2, 2, true);

-- Apartment 46: Radiance Court
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Radiance Court', 'TX', 'San Antonio', '234 Radiance Dr', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Bright Units', 'WiFi', 'Parking'], true, ARRAY['cat'], 1, 110, false, true, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 800, 0, 1, true);

-- Apartment 47: Prism Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Prism Towers', 'TX', 'Dallas', '567 Prism Blvd', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Colorful Design', 'Fitness', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 210, false, false, true, false, 620, 2.9);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1350, 1150, 2, 1.5, true);

-- Apartment 48: Fortis Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Fortis Apartments', 'TX', 'Houston', '890 Fortis Way', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Strong Security', 'Pool', 'Fitness', 'Parking'], true, ARRAY['dog', 'cat'], 1, 310, false, false, false, false, 670, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1950, 1700, 3, 2, true);

-- Apartment 49: Summit View
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Summit View', 'TX', 'Austin', '123 Summit St', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Mountain View', 'Balcony', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, false, false, true, false, 610, 2.8);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1250, 1050, 1, 1.5, true);

-- Apartment 50: Pristine Plaza
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Pristine Plaza', 'TX', 'San Antonio', '456 Pristine Ln', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Clean Modern', 'Pool', 'Fitness'], true, ARRAY['cat'], 1, 160, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1500, 1300, 2, 2, true);

-- Apartment 51: Vivid Villas
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Vivid Villas', 'TX', 'Dallas', '789 Vivid Ave', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Vibrant Community', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog', 'cat'], 2, 340, false, false, false, false, 670, 3.3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1900, 1700, 3, 2.5, true);

-- Apartment 52: Nexus Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Nexus Residences', 'TX', 'Houston', '234 Nexus Blvd', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Central Hub', 'WiFi', 'Parking'], true, ARRAY['cat'], 1, 100, false, true, true, true, 580, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 800, 700, 0, 1, true);

-- Apartment 53: Lumina Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Lumina Towers', 'TX', 'Austin', '567 Lumina St', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Bright Interiors', 'Security', 'Parking'], true, ARRAY['dog', 'cat'], 1, 270, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1550, 1350, 2, 2, true);

-- Apartment 54: Atlas Plaza
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Atlas Plaza', 'TX', 'San Antonio', '890 Atlas Way', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Strong Foundation', 'Community', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 190, false, true, true, false, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1000, 850, 1, 1, true);

-- Apartment 55: Vortex Court
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Vortex Court', 'TX', 'Dallas', '123 Vortex Ave', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Modern Energy', 'Appliances', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1400, 1200, 2, 1.5, true);

-- Apartment 56: Beacon Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Beacon Heights', 'TX', 'Houston', '456 Beacon Blvd', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Guiding Light', 'Pool', 'Fitness', 'Parking'], true, ARRAY['dog'], 1, 300, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1800, 1600, 3, 2, true);

-- Apartment 57: Essence Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Essence Apartments', 'TX', 'Austin', '789 Essence Ln', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Pure Design', 'WiFi', 'Parking'], true, ARRAY['cat', 'fish'], 2, 120, false, true, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 800, 0, 1, true);

-- Apartment 58: Orion Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Orion Place', 'TX', 'San Antonio', '234 Orion Dr', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Stellar Location', 'Gym', 'Parking'], true, ARRAY['dog'], 1, 240, false, false, true, false, 620, 2.9);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1350, 1150, 2, 1.5, true);

-- Apartment 59: Spectrum Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Spectrum Towers', 'TX', 'Dallas', '567 Spectrum St', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Colorful Units', 'Security', 'Parking'], true, ARRAY['cat'], 1, 140, false, true, true, false, 610, 2.8);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1150, 1000, 1, 1, true);

-- Apartment 60: Haven Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Haven Residences', 'TX', 'Houston', '890 Haven Ave', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Safe Haven', 'Pool', 'Fitness', 'Parking'], true, ARRAY['dog', 'cat'], 2, 260, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1600, 1400, 2, 2, true);

-- Apartment 61: Titan Complex
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Titan Complex', 'TX', 'Austin', '123 Titan Blvd', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Strong Structure', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog', 'cat'], 2, 300, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1750, 1500, 3, 2, true);

-- Apartment 62: Empyrean Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Empyrean Lofts', 'TX', 'San Antonio', '456 Empyrean St', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Heavenly Atmosphere', 'Parking', 'Laundry'], false, ARRAY[]::TEXT[], 0, 0, false, true, true, true, 590, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 750, 0, 1, true);

-- Apartment 63: Mosaic Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Mosaic Apartments', 'TX', 'Dallas', '789 Mosaic Way', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Artistic Design', 'Community', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 230, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1450, 1250, 2, 1.5, true);

-- Apartment 64: Valor Suites
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Valor Suites', 'TX', 'Houston', '234 Valor Ln', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Courageous Design', 'WiFi', 'Parking'], true, ARRAY['cat'], 1, 130, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1000, 850, 1, 1, true);

-- Apartment 65: Reverie Park
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Reverie Park', 'TX', 'Austin', '567 Reverie Blvd', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Dream Location', 'Park Views', 'Parking'], true, ARRAY['dog'], 1, 280, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1550, 1350, 2, 2, true);

-- Apartment 66: Solace Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Solace Heights', 'TX', 'San Antonio', '890 Solace Ave', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Peaceful', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog', 'cat'], 2, 320, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1850, 1600, 3, 2, true);

-- Apartment 67: Paradigm Plaza
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Paradigm Plaza', 'TX', 'Dallas', '123 Paradigm St', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['New Model', 'Modern Design', 'Parking'], true, ARRAY['cat', 'fish'], 2, 140, false, true, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 800, 0, 1, true);

-- Apartment 68: Opus Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Opus Residences', 'TX', 'Houston', '456 Opus Lane', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Masterpiece', 'Concierge', 'Garage', 'Parking'], true, ARRAY['dog', 'cat'], 1, 300, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1700, 1500, 2, 2, true);

-- Apartment 69: Horizon Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Horizon Apartments', 'TX', 'Austin', '789 Horizon Dr', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Endless Views', 'WiFi', 'Parking'], true, ARRAY['cat'], 1, 110, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1050, 900, 1, 1, true);

-- Apartment 70: Zenith Court
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Zenith Court', 'TX', 'San Antonio', '234 Zenith Way', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Peak Performance', 'Fitness', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 210, false, false, true, false, 620, 2.9);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1350, 1150, 2, 1.5, true);

-- Apartment 71: Catalyst Tower
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Catalyst Tower', 'TX', 'Dallas', '567 Catalyst Ave', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Game Changer', 'Luxury', 'Full Service'], true, ARRAY['dog', 'cat'], 2, 340, false, false, false, false, 680, 3.3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 2050, 1850, 3, 2.5, true);

-- Apartment 72: Sanctum Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Sanctum Place', 'TX', 'Houston', '890 Sanctum St', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Sacred Space', 'Quiet', 'Parking'], false, ARRAY[]::TEXT[], 0, 0, false, true, true, true, 580, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 800, 700, 0, 1, true);

-- Apartment 73: Allegro Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Allegro Lofts', 'TX', 'Austin', '123 Allegro Blvd', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Lively Community', 'Rooftop', 'Parking'], true, ARRAY['dog', 'cat'], 2, 250, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1450, 1250, 2, 1.5, true);

-- Apartment 74: Concord Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Concord Residences', 'TX', 'San Antonio', '456 Concord Ln', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Harmonious', 'Community Garden', 'Parking'], true, ARRAY['cat'], 1, 120, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1000, 850, 1, 1, true);

-- Apartment 75: Velocity Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Velocity Towers', 'TX', 'Dallas', '789 Velocity Way', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Fast Living', 'Modern', 'Parking'], true, ARRAY['dog'], 1, 270, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1550, 1350, 2, 2, true);

-- Apartment 76: Crescendo Apartments
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Crescendo Apartments', 'TX', 'Houston', '234 Crescendo Ave', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Building Momentum', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog', 'cat'], 2, 330, false, false, false, false, 670, 3.3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1900, 1700, 3, 2, true);

-- Apartment 77: Harmony Court
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Harmony Court', 'TX', 'Austin', '567 Harmony St', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Perfect Balance', 'WiFi', 'Parking'], true, ARRAY['cat', 'fish'], 2, 130, false, true, true, true, 590, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 750, 0, 1, true);

-- Apartment 78: Sonata Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Sonata Place', 'TX', 'San Antonio', '890 Sonata Blvd', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Musical Community', 'Fitness', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 200, false, false, true, false, 610, 2.8);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1300, 1100, 2, 1.5, true);

-- Apartment 79: Echelon Complex
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Echelon Complex', 'TX', 'Dallas', '123 Echelon Dr', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Top Tier', 'Security', 'Parking'], true, ARRAY['cat'], 1, 140, false, true, true, false, 610, 2.7);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1100, 950, 1, 1, true);

-- Apartment 80: Cascade Suites
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Cascade Suites', 'TX', 'Houston', '456 Cascade Way', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Flowing Water', 'Pool', 'Fitness', 'Parking'], true, ARRAY['dog', 'cat'], 1, 280, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1600, 1400, 2, 2, true);

-- Apartment 81: Novus Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Novus Lofts', 'TX', 'Austin', '789 Novus Ave', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['New Beginning', 'Urban Living', 'Parking'], true, ARRAY['dog', 'cat'], 2, 300, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1700, 1500, 3, 2, true);

-- Apartment 82: Stella Court
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Stella Court', 'TX', 'San Antonio', '234 Stella St', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Starlight', 'Bright Units', 'Parking'], true, ARRAY['cat'], 1, 110, false, true, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 800, 0, 1, true);

-- Apartment 83: Triumph Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Triumph Towers', 'TX', 'Dallas', '567 Triumph Ln', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Victory Assured', 'Community', 'Parking'], true, ARRAY['dog', 'cat', 'bird'], 2, 240, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1400, 1200, 2, 1.5, true);

-- Apartment 84: Ascent Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Ascent Place', 'TX', 'Houston', '890 Ascent Blvd', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Moving Up', 'Modern', 'Parking'], true, ARRAY['dog'], 1, 200, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1050, 900, 1, 1, true);

-- Apartment 85: Elysium Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Elysium Residences', 'TX', 'Austin', '123 Elysium Way', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Perfect Place', 'Pool', 'Fitness', 'Parking'], true, ARRAY['cat'], 1, 160, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1550, 1350, 2, 2, true);

-- Apartment 86: Verdant Valley
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Verdant Valley', 'TX', 'San Antonio', '456 Verdant Ave', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Green Living', 'Natural', 'Pool', 'Parking'], true, ARRAY['dog', 'cat'], 2, 320, false, false, false, false, 670, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1950, 1700, 3, 2.5, true);

-- Apartment 87: Utopia Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Utopia Lofts', 'TX', 'Dallas', '789 Utopia St', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Ideal Place', 'Parking', 'Laundry'], false, ARRAY[]::TEXT[], 0, 0, false, true, true, true, 590, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 750, 0, 1, true);

-- Apartment 88: Phoenix Rising
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Phoenix Rising', 'TX', 'Houston', '234 Phoenix Ln', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Rebirth', 'Community', 'Fitness'], true, ARRAY['dog', 'cat', 'bird'], 2, 220, false, false, true, false, 620, 2.9);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1350, 1150, 2, 1.5, true);

-- Apartment 89: Templo Sante
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Templo Sante', 'TX', 'Austin', '567 Templo Way', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Holy Ground', 'Garden', 'Parking'], true, ARRAY['cat', 'fish'], 2, 150, false, true, true, false, 610, 2.7);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1100, 950, 1, 1, true);

-- Apartment 90: Zenith Manor
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Zenith Manor', 'TX', 'San Antonio', '890 Zenith Ave', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Peak Living', 'Luxury', 'Security', 'Parking'], true, ARRAY['dog'], 1, 290, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1600, 1400, 2, 2, true);

-- Apartment 91: Praxis Complex
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Praxis Complex', 'TX', 'Dallas', '123 Praxis Blvd', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Practical Design', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog', 'cat'], 2, 310, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1800, 1600, 3, 2, true);

-- Apartment 92: Beacon Vista
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Beacon Vista', 'TX', 'Houston', '456 Beacon St', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Light Source', 'WiFi', 'Parking'], true, ARRAY['cat'], 1, 100, false, true, true, true, 580, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 800, 700, 0, 1, true);

-- Apartment 93: Lumina Plaza
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Lumina Plaza', 'TX', 'Austin', '789 Lumina Blvd', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Bright Spaces', 'Community', 'Parking'], true, ARRAY['dog', 'cat'], 2, 250, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1400, 1200, 2, 1.5, true);

-- Apartment 94: Vigor Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Vigor Towers', 'TX', 'San Antonio', '234 Vigor Lane', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Strong Vibes', 'Modern', 'Parking'], true, ARRAY['cat'], 1, 130, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1000, 850, 1, 1, true);

-- Apartment 95: Quantum Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Quantum Lofts', 'TX', 'Dallas', '567 Quantum Dr', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Leap Forward', 'Tech Features', 'Parking'], true, ARRAY['dog', 'cat'], 1, 300, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1700, 1500, 2, 2, true);

-- Apartment 96: Apex Residences
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Apex Residences', 'TX', 'Houston', '890 Apex Ave', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Summit Living', 'Luxury Amenities', 'Full Service'], true, ARRAY['dog', 'cat'], 2, 350, false, false, false, false, 680, 3.3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 2100, 1850, 3, 2.5, true);

-- Apartment 97: Ethereal Suites
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Ethereal Suites', 'TX', 'Austin', '123 Ethereal St', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Dreamy Atmosphere', 'WiFi', 'Parking'], true, ARRAY['cat', 'fish'], 2, 140, false, true, true, true, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 800, 0, 1, true);

-- Apartment 98: Stratosphere Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Stratosphere Place', 'TX', 'San Antonio', '456 Stratosphere Way', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['High Elevation', 'Views', 'Fitness'], true, ARRAY['dog', 'cat', 'bird'], 2, 260, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1450, 1250, 2, 1.5, true);

-- Apartment 99: Vector Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Vector Towers', 'TX', 'Dallas', '789 Vector Blvd', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Directional', 'Security', 'Parking'], true, ARRAY['dog'], 1, 220, false, false, true, false, 610, 2.8);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1150, 1000, 1, 1, true);

-- Apartment 100: Nexus Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Nexus Heights', 'TX', 'Houston', '234 Nexus St', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Connection Point', 'Community', 'Parking'], true, ARRAY['cat'], 1, 170, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1550, 1350, 2, 2, true);

-- Apartment 101: Momentum Lofts
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Momentum Lofts', 'TX', 'Austin', '567 Momentum Ave', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Forward Motion', 'Modern Design', 'Parking'], true, ARRAY['dog', 'cat'], 2, 300, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1750, 1500, 3, 2, true);

-- Apartment 102: Synergy Suites
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Synergy Suites', 'TX', 'San Antonio', '890 Synergy Lane', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Unified Living', 'Parking', 'Laundry'], true, ARRAY['cat'], 1, 100, false, true, true, true, 590, 2.4);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 850, 750, 0, 1, true);

-- Apartment 103: Helix Complex
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Helix Complex', 'TX', 'Dallas', '123 Helix Way', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Spiral Design', 'Contemporary', 'Parking'], true, ARRAY['dog', 'cat'], 2, 270, false, false, true, false, 640, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1500, 1300, 2, 1.5, true);

-- Apartment 104: Aurora Tower
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Aurora Tower', 'TX', 'Houston', '456 Aurora Blvd', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Dawn Colors', 'Scenic', 'Parking'], true, ARRAY['cat', 'fish'], 2, 150, false, true, true, true, 600, 2.6);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1050, 900, 1, 1, true);

-- Apartment 105: Triton Place
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Triton Place', 'TX', 'Austin', '789 Triton Dr', 'https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400', ARRAY['Mythical Quality', 'Pool', 'Gym', 'Parking'], true, ARRAY['dog'], 1, 300, false, false, false, false, 650, 3.1);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1600, 1400, 2, 2, true);

-- Apartment 106: Patheon Suites
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Patheon Suites', 'TX', 'San Antonio', '234 Pantheon Ave', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', ARRAY['Grand Hall', 'Elegant', 'Parking'], true, ARRAY['cat'], 1, 120, false, true, true, false, 600, 2.5);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 900, 800, 0, 1, true);

-- Apartment 107: Cosmos Towers
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Cosmos Towers', 'TX', 'Dallas', '567 Cosmos St', 'https://images.unsplash.com/photo-1488954355204-6f85ee9b1d80?w=400', ARRAY['Vast Universe', 'Exploration', 'Fitness'], true, ARRAY['dog', 'cat', 'bird'], 2, 240, false, false, true, false, 630, 3);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1400, 1200, 2, 1.5, true);

-- Apartment 108: Stellar Heights
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('Stellar Heights', 'TX', 'Houston', '890 Stellar Blvd', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['Star Quality', 'Excellence', 'Pool'], true, ARRAY['dog', 'cat'], 2, 320, false, false, false, false, 660, 3.2);
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), 1850, 1600, 3, 2, true);
