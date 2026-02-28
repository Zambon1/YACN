import db from '../utils/db.js';
import { createApplicationRecord, getApplicationByUserId, getApplicationByEmail, getApplicantSubmissionData, compareApplicantToRequirements } from '../data/applications.js';
import { getSession } from '../data/sessions.js';
import { checkQualification, calculateMatchScore } from '../utils/qualificationChecker.js';

/**
 * Get all apartments from database
 */
async function getAllApartmentsFromDB() {
    const query = `
        SELECT 
            c.id,
            c.name,
            c.street as address,
            c.city,
            c.us_state as state,
            u.bedroom as bedrooms,
            u.bathroom as bathrooms,
            u.price as rent,
            u.deposit,
            c.min_credit_score,
            c.min_income_multiplier,
            c.pets_allowed,
            c.pet_types,
            c.max_pets,
            c.pet_deposit,
            c.smoking_allowed,
            c.accepts_evictions,
            c.accepts_bankruptcies,
            c.accepts_criminal_record,
            c.amenities,
            c.image
        FROM complex c
        JOIN unit u ON c.id = u.complex_id
        WHERE c.name IS NOT NULL
        ORDER BY c.id
    `;
    
    const result = await db.query(query);
    return result.rows;
}

/**
 * Check if user has submitted an application
 */
export const checkUserApplication = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const session = token ? await getSession(token) : null;

        let userApplication = null;

        // Primary check: by userId if logged in
        if (session && session.user_id) {
            userApplication = await getApplicationByUserId(session.user_id);
        }

        // Fallback: check by email from session or query params
        if (!userApplication) {
            const emailToCheck = session?.email || req.query?.email;
            if (emailToCheck) {
                userApplication = await getApplicationByEmail(emailToCheck);
            }
        }

        res.json({ 
            hasApplication: !!userApplication,
            application: userApplication || null
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handle application submission and return matching apartments
 */
export const submitApplication = async (req, res) => {
    try {
        const applicantData = req.body;

        const token = req.headers.authorization?.replace('Bearer ', '');
        const session = token ? await getSession(token) : null;

        // Get all apartments from database
        const apartments = await getAllApartmentsFromDB();

        // Find matching apartments and collect rejection reasons
        const matches = [];
        const rejectionReasonCounts = {};

        for (const apartment of apartments) {
            const { qualified, reasons } = checkQualification(applicantData, apartment);

            if (qualified) {
                const matchScore = calculateMatchScore(applicantData, apartment);

                // Add to matches
                const matchInfo = {
                    ...apartment,
                    match_score: matchScore
                };
                matches.push(matchInfo);
            } else if (Array.isArray(reasons)) {
                reasons.forEach((reason) => {
                    if (!reason) return;
                    rejectionReasonCounts[reason] = (rejectionReasonCounts[reason] || 0) + 1;
                });
            }
        }

        // Sort by match score (highest first)
        matches.sort((a, b) => b.match_score - a.match_score);

        const topRejectionReasons = Object.entries(rejectionReasonCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([reason, count]) => ({ reason, count }));

        await createApplicationRecord({
            userId: session?.user_id || null,
            email: session?.email || applicantData.email || null,
            applicantData,
            matchCount: matches.length,
            topRejectionReasons
        });

        res.json({
            success: true,
            count: matches.length,
            matches: matches,
            topRejectionReasons,
            applicant: {
                name: `${applicantData.firstName || ''} ${applicantData.lastName || ''}`,
                email: applicantData.email || ''
            }
        });

    } catch (error) {
        console.error('submitApplication error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get applicant submission data for an application
 * GET /api/application/:applicationId/submission
 */
export const getApplicationSubmission = async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!applicationId) {
            return res.status(400).json({
                success: false,
                error: 'applicationId is required'
            });
        }

        const submissionData = await getApplicantSubmissionData(applicationId);
        if (!submissionData) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Applicant submission data retrieved',
            data: submissionData
        });
    } catch (error) {
        console.error('getApplicationSubmission error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Compare applicant submission against complex requirements
 * POST /api/application/:applicationId/compare/:complexId
 */
export const compareApplicationToRequirements = async (req, res) => {
    try {
        const { applicationId, complexId } = req.params;

        if (!applicationId || !complexId) {
            return res.status(400).json({
                success: false,
                error: 'applicationId and complexId are required'
            });
        }

        const comparisonResult = await compareApplicantToRequirements(applicationId, complexId);

        res.json({
            success: true,
            message: 'Applicant compared against requirements',
            data: comparisonResult
        });
    } catch (error) {
        console.error('compareApplicationToRequirements error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
