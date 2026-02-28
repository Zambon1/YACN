/**
 * Convert credit score range to numeric value for comparison
 */
export function convertCreditScoreToNumeric(creditScoreRange) {
    const scoreMap = {
        "excellent": 775,
        "good": 725,
        "fair": 675,
        "poor": 625,
        "very-poor": 575
    };
    return scoreMap[creditScoreRange] || 600;
}

/**
 * Check if an applicant qualifies for an apartment based on various criteria
 * Returns { qualified: boolean, reasons: string[] }
 */
export function checkQualification(applicant, apartment) {
    const reasons = [];
    
    // 1. Check location match
    if ((applicant.desiredCity || '').toLowerCase() !== apartment.city.toLowerCase()) {
        return { qualified: false, reasons: ["Location doesn't match"] };
    }
    
    // 2. Check bedroom match
    const applicantBedrooms = applicant.bedrooms || '';
    if (applicantBedrooms !== String(apartment.bedrooms)) {
        return { qualified: false, reasons: ["Number of bedrooms doesn't match"] };
    }
    
    // 3. Check rent affordability
    const maxRent = parseFloat(applicant.maxRent || 0);
    if (maxRent < apartment.rent) {
        return { 
            qualified: false, 
            reasons: [`Rent $${apartment.rent} exceeds maximum budget $${maxRent}`] 
        };
    }
    
    // 4. Check income requirement (typically 3x rent)
    const monthlyIncome = parseFloat(applicant.monthlyIncome || 0);
    const additionalIncome = parseFloat(applicant.additionalIncome || 0);
    const totalIncome = monthlyIncome + additionalIncome;
    const requiredIncome = apartment.rent * apartment.min_income_multiplier;
    
    if (totalIncome < requiredIncome) {
        reasons.push(
            `Income $${totalIncome.toFixed(0)} below required $${requiredIncome.toFixed(0)} (${apartment.min_income_multiplier}x rent)`
        );
        return { qualified: false, reasons };
    }
    
    // 5. Check credit score
    const applicantCreditScore = convertCreditScoreToNumeric(applicant.creditScore || 'very-poor');
    if (applicantCreditScore < apartment.min_credit_score) {
        reasons.push(
            `Credit score ~${applicantCreditScore} below minimum ${apartment.min_credit_score}`
        );
        return { qualified: false, reasons };
    }
    
    // 6. Check eviction history
    if (applicant.evictions === 'yes' && !apartment.accepts_evictions) {
        reasons.push("Eviction history not accepted");
        return { qualified: false, reasons };
    }
    
    // 7. Check bankruptcy history
    if (applicant.bankruptcy === 'yes' && !apartment.accepts_bankruptcies) {
        reasons.push("Bankruptcy history not accepted");
        return { qualified: false, reasons };
    }
    
    // 8. Check criminal record
    if (applicant.criminalRecord === 'yes' && !apartment.accepts_criminal_record) {
        reasons.push("Criminal record not accepted");
        return { qualified: false, reasons };
    }
    
    // 9. Check pet policy
    const hasPets = (applicant.pets || 'no') !== 'no';
    if (hasPets) {
        if (!apartment.pets_allowed) {
            reasons.push("Pets not allowed");
            return { qualified: false, reasons };
        }
        
        const petType = applicant.pets || 'no';
        const numPets = parseInt(applicant.numberOfPets || 0);
        
        if (numPets > apartment.max_pets) {
            reasons.push(`Too many pets (limit: ${apartment.max_pets})`);
            return { qualified: false, reasons };
        }
        
        // Check pet type
        if (!apartment.pet_types.includes(petType) && !apartment.pet_types.includes('other')) {
            reasons.push(`Pet type '${petType}' not allowed`);
            return { qualified: false, reasons };
        }
    }
    
    // 10. Check smoking policy
    if (applicant.smoking === 'yes' && !apartment.smoking_allowed) {
        reasons.push("Smoking not allowed");
        return { qualified: false, reasons };
    }
    
    // If we made it here, applicant qualifies!
    return { qualified: true, reasons: ["Qualified!"] };
}

/**
 * Calculate match score for a qualified apartment
 */
export function calculateMatchScore(applicant, apartment) {
    let matchScore = 100;
    
    // Bonus points for better credit
    const creditScore = convertCreditScoreToNumeric(applicant.creditScore || 'very-poor');
    if (creditScore >= 750) {
        matchScore += 10;
    } else if (creditScore >= 700) {
        matchScore += 5;
    }
    
    // Bonus for income well above minimum
    const monthlyIncome = parseFloat(applicant.monthlyIncome || 0);
    const additionalIncome = parseFloat(applicant.additionalIncome || 0);
    const totalIncome = monthlyIncome + additionalIncome;
    const requiredIncome = apartment.rent * apartment.min_income_multiplier;
    
    if (totalIncome >= requiredIncome * 1.5) {
        matchScore += 10;
    } else if (totalIncome >= requiredIncome * 1.25) {
        matchScore += 5;
    }
    
    return Math.min(matchScore, 100); // Cap at 100
}
