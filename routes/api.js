import express from 'express';
import { submitApplication, checkUserApplication } from '../controllers/applicationController.js';
import { getAllApartments, getApartmentById } from '../controllers/apartmentController.js';
import { signup, login, getCurrentUser, logout } from '../controllers/authController.js';
import { getSettings, updateSettings, getPreferences, updatePreferences } from '../controllers/settingsController.js';
import { searchUnits, getUnit } from '../controllers/unitsController.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/user', getCurrentUser);
router.post('/logout', logout);

// Application routes
router.get('/user-application', checkUserApplication);
router.post('/submit-application', submitApplication);

// Apartment routes
router.get('/apartments', getAllApartments);
router.get('/apartments/:id', getApartmentById);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Preferences routes
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Units routes (database-driven)
router.get('/units/search', searchUnits);
router.get('/units/:id', getUnit);

export default router;
