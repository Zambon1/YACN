import { APARTMENTS } from '../data/apartments.js';
import { createApplicationRecord, loadApplications } from '../data/applications.js';
import { getSession } from '../data/sessions.js';
import { checkQualification, calculateMatchScore } from '../utils/qualificationChecker.js';

/**
 * Check if user has submitted an application
 */
export const checkUserApplication = (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const session = token ? getSession(token) : null;

        if (!session || !session.userId) {
            return res.json({ hasApplication: false });
        }

        const applications = loadApplications();
        const userApplication = applications.find(app => app.userId === session.userId);

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
export const submitApplication = (req, res) => {
    try {
        const applicantData = req.body;

        const token = req.headers.authorization?.replace('Bearer ', '');
        const session = token ? getSession(token) : null;

        // Find matching apartments and collect rejection reasons
        const matches = [];
        const rejectionReasonCounts = {};

        for (const apartment of APARTMENTS) {
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

        createApplicationRecord({
            userId: session?.userId || null,
            username: session?.username || null,
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
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
