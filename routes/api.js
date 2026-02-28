import express from 'express';
import { submitApplication } from '../controllers/applicationController.js';
import { getAllApartments, getApartmentById } from '../controllers/apartmentController.js';

const router = express.Router();

// Application routes
router.post('/submit-application', submitApplication);

// Apartment routes
router.get('/apartments', getAllApartments);
router.get('/apartments/:id', getApartmentById);

export default router;
