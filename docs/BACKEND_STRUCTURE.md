# RentMatch Backend - Project Structure

## Overview
The backend has been restructured following MVC (Model-View-Controller) architecture for better code organization and maintainability.

## 📁 Project Structure

```
YACN/
├── server.js                    # Main server entry point
├── package.json                 # Dependencies and scripts
│
├── routes/                      # Route definitions
│   ├── index.js                # Static page routes
│   └── api.js                  # API route definitions
│
├── controllers/                 # Business logic/handlers
│   ├── applicationController.js # Application submission logic
│   └── apartmentController.js   # Apartment-related logic
│
├── data/                        # Data storage (mock database)
│   └── apartments.js           # Apartment listings data
│
└── utils/                       # Helper functions
    └── qualificationChecker.js  # Qualification checking logic
```

## 🛠️ Components

### **server.js**
- Main application entry point
- Configures middleware (CORS, JSON parsing)
- Registers routes
- Starts the Express server on port 5000

### **Routes** (`/routes`)
- **index.js**: Handles static page serving (homepage)
- **api.js**: Defines all API endpoints and maps them to controllers
  - `POST /api/submit-application` - Submit application and get matches
  - `GET /api/apartments` - Get all apartments
  - `GET /api/apartments/:id` - Get specific apartment by ID

### **Controllers** (`/controllers`)
- **applicationController.js**: Handles application submission
  - Processes applicant data
  - Finds matching apartments
  - Calculates match scores
  - Returns sorted results

- **apartmentController.js**: Manages apartment data
  - Retrieves all apartments
  - Retrieves specific apartment by ID

### **Data** (`/data`)
- **apartments.js**: Contains the mock apartment database
  - 8 sample apartments with various criteria
  - In production, this would be replaced with a real database

### **Utils** (`/utils`)
- **qualificationChecker.js**: Contains qualification logic
  - `convertCreditScoreToNumeric()` - Converts credit ranges to numbers
  - `checkQualification()` - Validates applicant against apartment criteria
  - `calculateMatchScore()` - Calculates compatibility score

## 🚀 Running the Application

### Install Dependencies
```bash
npm install
```

### Start Server
```bash
npm start
```

### Development Mode (with auto-restart)
```bash
npm run dev
```

The server will run at `http://localhost:5000`

## 📡 API Endpoints

### Submit Application
**POST** `/api/submit-application`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "desiredCity": "Austin",
  "bedrooms": "2",
  "maxRent": 2000,
  "monthlyIncome": 6000,
  "additionalIncome": 0,
  "creditScore": "good",
  "evictions": "no",
  "bankruptcy": "no",
  "criminalRecord": "no",
  "pets": "dog",
  "numberOfPets": 1,
  "smoking": "no"
}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "matches": [...],
  "applicant": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get All Apartments
**GET** `/api/apartments`

**Response:**
```json
{
  "success": true,
  "apartments": [...]
}
```

### Get Apartment by ID
**GET** `/api/apartments/:id`

**Response:**
```json
{
  "success": true,
  "apartment": {...}
}
```

## 🔧 Benefits of This Structure

1. **Separation of Concerns**: Routes, business logic, and data are separated
2. **Maintainability**: Easy to find and update specific functionality
3. **Scalability**: Easy to add new routes, controllers, or utilities
4. **Testability**: Each component can be tested independently
5. **Reusability**: Utilities can be shared across different controllers
6. **Readability**: Clear organization makes codebase easier to understand

## 🔜 Future Enhancements

- Add database integration (MongoDB/PostgreSQL)
- Implement authentication/authorization
- Add input validation middleware
- Create separate models folder for data schemas
- Add logging middleware
- Implement error handling middleware
- Add unit and integration tests
