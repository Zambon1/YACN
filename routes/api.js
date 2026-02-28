import express from 'express';
import { submitApplication, checkUserApplication, getApplicationSubmission, compareApplicationToRequirements } from '../controllers/applicationController.js';
import { getAllApartments, getApartmentById } from '../controllers/apartmentController.js';
import { signup, login, getCurrentUser, logout, checkEmailAvailability, checkUsernameAvailability } from '../controllers/authController.js';
import { getSettings, updateSettings, getPreferences, updatePreferences } from '../controllers/settingsController.js';
import { searchUnits, getUnit } from '../controllers/unitsController.js';
import {
    createRequirements,
    getRequirements,
    updateRequirements,
    deleteRequirements,
    checkApplicantMeetsRequirements,
    getAllRequirements
} from '../controllers/requirementsController.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/user', getCurrentUser);
router.post('/logout', logout);
router.get('/check-email', checkEmailAvailability);
router.get('/check-username', checkUsernameAvailability);

// Application routes
router.get('/user-application', checkUserApplication);
router.post('/submit-application', submitApplication);
router.get('/application/:applicationId/submission', getApplicationSubmission);
router.post('/application/:applicationId/compare/:complexId', compareApplicationToRequirements);

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

// Requirements routes (landlord-defined criteria)
router.get('/requirements', getAllRequirements);
router.post('/requirements', createRequirements);
router.get('/requirements/:complexId', getRequirements);
router.put('/requirements/:complexId', updateRequirements);
router.delete('/requirements/:complexId', deleteRequirements);
router.post('/requirements/:complexId/check', checkApplicantMeetsRequirements);

export default router;
