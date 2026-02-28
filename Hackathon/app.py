from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Sample apartment data - In production, this would be a database
APARTMENTS = [
    {
        "id": 1,
        "name": "Sunset Vista Apartments",
        "address": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "bedrooms": 1,
        "bathrooms": 1,
        "rent": 1200,
        "deposit": 1000,
        "min_credit_score": 650,
        "min_income_multiplier": 3,
        "pets_allowed": True,
        "pet_types": ["dog", "cat"],
        "max_pets": 2,
        "pet_deposit": 300,
        "smoking_allowed": False,
        "accepts_evictions": False,
        "accepts_bankruptcies": False,
        "accepts_criminal_record": False,
        "amenities": ["Pool", "Gym", "Parking", "Laundry"],
        "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"
    },
    {
        "id": 2,
        "name": "Downtown Luxury Lofts",
        "address": "456 Congress Ave",
        "city": "Austin",
        "state": "TX",
        "bedrooms": 2,
        "bathrooms": 2,
        "rent": 2100,
        "deposit": 2000,
        "min_credit_score": 700,
        "min_income_multiplier": 3.5,
        "pets_allowed": True,
        "pet_types": ["dog", "cat"],
        "max_pets": 1,
        "pet_deposit": 500,
        "smoking_allowed": False,
        "accepts_evictions": False,
        "accepts_bankruptcies": False,
        "accepts_criminal_record": False,
        "amenities": ["Concierge", "Rooftop Deck", "Gym", "Pet Spa"],
        "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"
    },
    {
        "id": 3,
        "name": "Green Meadows Complex",
        "address": "789 Park Ln",
        "city": "Austin",
        "state": "TX",
        "bedrooms": 2,
        "bathrooms": 1.5,
        "rent": 1450,
        "deposit": 1200,
        "min_credit_score": 620,
        "min_income_multiplier": 3,
        "pets_allowed": True,
        "pet_types": ["dog", "cat", "other"],
        "max_pets": 3,
        "pet_deposit": 200,
        "smoking_allowed": False,
        "accepts_evictions": False,
        "accepts_bankruptcies": True,
        "accepts_criminal_record": False,
        "amenities": ["Pool", "Playground", "BBQ Area", "Dog Park"],
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
    },
    {
        "id": 4,
        "name": "Riverside Studios",
        "address": "321 River Rd",
        "city": "Austin",
        "state": "TX",
        "bedrooms": "studio",
        "bathrooms": 1,
        "rent": 950,
        "deposit": 800,
        "min_credit_score": 600,
        "min_income_multiplier": 2.5,
        "pets_allowed": True,
        "pet_types": ["cat"],
        "max_pets": 1,
        "pet_deposit": 150,
        "smoking_allowed": False,
        "accepts_evictions": False,
        "accepts_bankruptcies": True,
        "accepts_criminal_record": True,
        "amenities": ["Laundry", "Bike Storage", "WiFi Included"],
        "image": "https://images.unsplash.com/photo-1502672260066-6bc0e4d1c4aa?w=400"
    },
    {
        "id": 5,
        "name": "Oak Tree Apartments",
        "address": "555 Oak Dr",
        "city": "Austin",
        "state": "TX",
        "bedrooms": 3,
        "bathrooms": 2,
        "rent": 1850,
        "deposit": 1500,
        "min_credit_score": 680,
        "min_income_multiplier": 3,
        "pets_allowed": True,
        "pet_types": ["dog", "cat", "both"],
        "max_pets": 2,
        "pet_deposit": 350,
        "smoking_allowed": False,
        "accepts_evictions": False,
        "accepts_bankruptcies": False,
        "accepts_criminal_record": False,
        "amenities": ["Pool", "Gym", "Clubhouse", "Garage"],
        "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"
    },
    {
        "id": 6,
        "name": "Budget-Friendly Flats",
        "address": "888 Budget Blvd",
        "city": "Austin",
        "state": "TX",
        "bedrooms": 1,
        "bathrooms": 1,
        "rent": 850,
        "deposit": 600,
        "min_credit_score": 580,
        "min_income_multiplier": 2.5,
        "pets_allowed": False,
        "pet_types": [],
        "max_pets": 0,
        "pet_deposit": 0,
        "smoking_allowed": True,
        "accepts_evictions": True,
        "accepts_bankruptcies": True,
        "accepts_criminal_record": True,
        "amenities": ["Laundry", "Parking"],
        "image": "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400"
    },
    {
        "id": 7,
        "name": "University Towers",
        "address": "999 Campus Way",
        "city": "Austin",
        "state": "TX",
        "bedrooms": 2,
        "bathrooms": 2,
        "rent": 1600,
        "deposit": 1300,
        "min_credit_score": 640,
        "min_income_multiplier": 2.5,
        "pets_allowed": False,
        "pet_types": [],
        "max_pets": 0,
        "pet_deposit": 0,
        "smoking_allowed": False,
        "accepts_evictions": False,
        "accepts_bankruptcies": True,
        "accepts_criminal_record": False,
        "amenities": ["Study Room", "Gym", "Computer Lab", "Shuttle Service"],
        "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"
    },
    {
        "id": 8,
        "name": "The Hamilton",
        "address": "242 Hamilton St",
        "city": "Austin",
        "state": "TX",
        "bedrooms": 4,
        "bathrooms": 2.5,
        "rent": 2500,
        "deposit": 2500,
        "min_credit_score": 720,
        "min_income_multiplier": 3.5,
        "pets_allowed": True,
        "pet_types": ["dog", "cat", "both"],
        "max_pets": 2,
        "pet_deposit": 400,
        "smoking_allowed": False,
        "accepts_evictions": False,
        "accepts_bankruptcies": False,
        "accepts_criminal_record": False,
        "amenities": ["Pool", "Gym", "Theater Room", "Private Garage", "Gated"],
        "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"
    }
]

def convert_credit_score_to_numeric(credit_score_range):
    """Convert credit score range to numeric value for comparison"""
    score_map = {
        "excellent": 775,
        "good": 725,
        "fair": 675,
        "poor": 625,
        "very-poor": 575
    }
    return score_map.get(credit_score_range, 600)

def check_qualification(applicant, apartment):
    """
    Check if an applicant qualifies for an apartment based on various criteria
    Returns (qualified: bool, reasons: list)
    """
    reasons = []
    
    # 1. Check location match
    if applicant.get('desiredCity', '').lower() != apartment['city'].lower():
        return False, ["Location doesn't match"]
    
    # 2. Check bedroom match
    applicant_bedrooms = applicant.get('bedrooms', '')
    if applicant_bedrooms != str(apartment['bedrooms']):
        return False, ["Number of bedrooms doesn't match"]
    
    # 3. Check rent affordability
    max_rent = float(applicant.get('maxRent', 0))
    if max_rent < apartment['rent']:
        return False, [f"Rent ${apartment['rent']} exceeds maximum budget ${max_rent}"]
    
    # 4. Check income requirement (typically 3x rent)
    monthly_income = float(applicant.get('monthlyIncome', 0))
    additional_income = float(applicant.get('additionalIncome', 0))
    total_income = monthly_income + additional_income
    required_income = apartment['rent'] * apartment['min_income_multiplier']
    
    if total_income < required_income:
        reasons.append(f"Income ${total_income:.0f} below required ${required_income:.0f} ({apartment['min_income_multiplier']}x rent)")
        return False, reasons
    
    # 5. Check credit score
    applicant_credit_score = convert_credit_score_to_numeric(applicant.get('creditScore', 'very-poor'))
    if applicant_credit_score < apartment['min_credit_score']:
        reasons.append(f"Credit score ~{applicant_credit_score} below minimum {apartment['min_credit_score']}")
        return False, reasons
    
    # 6. Check eviction history
    if applicant.get('evictions') == 'yes' and not apartment['accepts_evictions']:
        reasons.append("Eviction history not accepted")
        return False, reasons
    
    # 7. Check bankruptcy history
    if applicant.get('bankruptcy') == 'yes' and not apartment['accepts_bankruptcies']:
        reasons.append("Bankruptcy history not accepted")
        return False, reasons
    
    # 8. Check criminal record
    if applicant.get('criminalRecord') == 'yes' and not apartment['accepts_criminal_record']:
        reasons.append("Criminal record not accepted")
        return False, reasons
    
    # 9. Check pet policy
    has_pets = applicant.get('pets', 'no') != 'no'
    if has_pets:
        if not apartment['pets_allowed']:
            reasons.append("Pets not allowed")
            return False, reasons
        
        pet_type = applicant.get('pets', 'no')
        num_pets = int(applicant.get('numberOfPets', 0))
        
        if num_pets > apartment['max_pets']:
            reasons.append(f"Too many pets (limit: {apartment['max_pets']})")
            return False, reasons
        
        # Check pet type
        if pet_type not in apartment['pet_types'] and 'other' not in apartment['pet_types']:
            reasons.append(f"Pet type '{pet_type}' not allowed")
            return False, reasons
    
    # 10. Check smoking policy
    if applicant.get('smoking') == 'yes' and not apartment['smoking_allowed']:
        reasons.append("Smoking not allowed")
        return False, reasons
    
    # If we made it here, applicant qualifies!
    return True, ["Qualified!"]

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/submit-application', methods=['POST'])
def submit_application():
    """Receive application and return matching apartments"""
    try:
        applicant_data = request.json
        
        # Find matching apartments
        matches = []
        
        for apartment in APARTMENTS:
            qualified, reasons = check_qualification(applicant_data, apartment)
            
            if qualified:
                # Calculate match score (0-100)
                match_score = 100
                
                # Bonus points for better credit
                credit_score = convert_credit_score_to_numeric(applicant_data.get('creditScore', 'very-poor'))
                if credit_score >= 750:
                    match_score += 10
                elif credit_score >= 700:
                    match_score += 5
                
                # Bonus for income well above minimum
                monthly_income = float(applicant_data.get('monthlyIncome', 0))
                additional_income = float(applicant_data.get('additionalIncome', 0))
                total_income = monthly_income + additional_income
                required_income = apartment['rent'] * apartment['min_income_multiplier']
                
                if total_income >= required_income * 1.5:
                    match_score += 10
                elif total_income >= required_income * 1.25:
                    match_score += 5
                
                # Add to matches
                match_info = apartment.copy()
                match_info['match_score'] = min(match_score, 100)  # Cap at 100
                matches.append(match_info)
        
        # Sort by match score (highest first)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return jsonify({
            'success': True,
            'count': len(matches),
            'matches': matches,
            'applicant': {
                'name': f"{applicant_data.get('firstName', '')} {applicant_data.get('lastName', '')}",
                'email': applicant_data.get('email', '')
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/apartments', methods=['GET'])
def get_apartments():
    """Get all available apartments"""
    return jsonify({
        'success': True,
        'apartments': APARTMENTS
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
