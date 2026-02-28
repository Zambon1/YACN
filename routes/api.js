import express from 'express';
import { submitApplication, checkUserApplication } from '../controllers/applicationController.js';
import { getAllApartments, getApartmentById } from '../controllers/apartmentController.js';
import { signup, login, getCurrentUser, logout } from '../controllers/authController.js';

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

export default router;
