import { APARTMENTS } from '../data/apartments.js';
import { checkQualification, calculateMatchScore } from '../utils/qualificationChecker.js';

/**
 * Handle application submission and return matching apartments
 */
export const submitApplication = (req, res) => {
    try {
        const applicantData = req.body;
        
        // Find matching apartments
        const matches = [];
        
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
            }
        }
        
        // Sort by match score (highest first)
        matches.sort((a, b) => b.match_score - a.match_score);
        
        res.json({
            success: true,
            count: matches.length,
            matches: matches,
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
