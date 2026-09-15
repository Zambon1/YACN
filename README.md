# Rent Finalis - Apartment Matching Platform

### Created for USU Hackathon in February 2026

A web application that helps renters find apartments they qualify for by filling out a single application form.

## Features

- **Single Application**: Fill out one comprehensive rental application
- **Smart Matching**: Automatically matches applicants with qualifying apartments based on:
  - Income requirements (typically 2.5-3.5x rent)
  - Credit score
  - Location preferences
  - Bedroom/bathroom needs
  - Pet policies
  - Rental history (evictions, bankruptcies)
  - Criminal background
  - Smoking preferences
- **Beautiful UI**: Modern, responsive design that works on all devices
- **Instant Results**: See all matching apartments immediately after submission

## Tech Stack

### Frontend
- HTML5
- CSS3 (Modern design with CSS Grid and Flexbox)
- Vanilla JavaScript

### Backend
- Python 3.8+
- Flask (Web framework)
- Flask-CORS (Cross-Origin Resource Sharing)

## Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Running the Application

1. Start the Flask backend server:
```bash
python app.py
```

The server will start at `http://localhost:5000`

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## How It Works

### For Users:
1. Navigate to the homepage
2. Scroll down to the application form
3. Fill out all required fields including:
   - Personal information
   - Current address
   - Desired location and preferences
   - Employment information
   - Financial information
   - Additional details (pets, smoking, etc.)
4. Click "Find My Matches"
5. View all apartments you qualify for with match scores

### Matching Algorithm:
The system checks multiple criteria:
- **Location**: Must match desired city
- **Bedrooms**: Must match requested number
- **Budget**: Rent must be within max budget
- **Income**: Total income must meet minimum (typically 3x rent)
- **Credit Score**: Must meet minimum requirement
- **History**: Checks eviction, bankruptcy, and criminal record policies
- **Pets**: Validates against pet policies if applicable
- **Smoking**: Ensures smoking status is accepted

### Match Scores:
- Base score: 100 (for qualifying)
- Bonus points for excellent credit (+10)
- Bonus points for high income vs. requirement (+5-10)
- Final scores labeled as: Excellent Match (110+), Great Match (105-109), Good Match (100-104)

## Sample Data

The application includes 8 sample apartments in Austin, TX with varying:
- Rent prices ($850 - $2,500/month)
- Bedroom counts (Studio to 4 bedrooms)
- Credit requirements (580 - 720)
- Income multipliers (2.5x - 3.5x)
- Pet policies
- Acceptance policies for evictions/bankruptcies/criminal records

## Customization

### Adding More Apartments
Edit the `APARTMENTS` list in `app.py` to add more properties. Each apartment should have:
```python
{
    "id": unique_id,
    "name": "Apartment Name",
    "address": "123 Street",
    "city": "City",
    "state": "ST",
    "bedrooms": 2,  # or "studio"
    "bathrooms": 1.5,
    "rent": 1500,
    "deposit": 1200,
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
    "amenities": ["Pool", "Gym"],
    "image": "image_url"
}
```

### Modifying Matching Criteria
The `check_qualification()` function in `app.py` contains all matching logic. You can adjust:
- Income multipliers
- Credit score requirements
- Additional qualification criteria

## Project Structure

```
Hackathon/
├── app.py              # Flask backend server
├── index.html          # Main application form page
├── results.html        # Results display page
├── styles.css          # Styling for all pages
├── script.js           # Frontend JavaScript
├── requirements.txt    # Python dependencies
└── README.md          # This file
```
