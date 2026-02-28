// Application Requirements database - PostgreSQL backend
// Stores qualification criteria per complex/property (what landlords require)
// Separate from applications.js which stores what applicants submitted

import db from '../utils/db.js';

/**
 * Create application requirements for a complex
 * These are the CRITERIA/RULES a landlord sets
 */
export async function createApplicationRequirements(requirementData) {
    try {
        const {
            complex_id,
            first_name = true,
            last_name = true,
            gender,
            email = true,
            photo_id = false,
            employment_status,
            min_monthly_income_ratio = 3.0,
            valid_pay_stubs = false,
            pets = 0,
            birthday = false,
            driver_license = false,
            employment_hist = false,
            children_allowed = 10,
            guarantor_allowed = true,
            credit_score_min,
            evictions = false,
            criminal_record = false
        } = requirementData;

        const result = await db.query(`
            INSERT INTO application_requirements (
                complex_id, first_name, last_name, gender, email, photo_id,
                employment_status, min_monthly_income_ratio, valid_pay_stubs,
                pets, birthday, driver_license, employment_hist, children_allowed,
                guarantor_allowed, credit_score_min, evictions, criminal_record
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        `, [
            complex_id, first_name, last_name, gender, email, photo_id,
            employment_status, min_monthly_income_ratio, valid_pay_stubs,
            pets, birthday, driver_license, employment_hist, children_allowed,
            guarantor_allowed, credit_score_min, evictions, criminal_record
        ]);

        return result.rows[0];
    } catch (error) {
        console.error('Error creating application requirements:', error);
        throw error;
    }
}

/**
 * Get requirements for a specific complex
 */
export async function getRequirementsForComplex(complexId) {
    try {
        const result = await db.query(
            'SELECT * FROM application_requirements WHERE complex_id = $1',
            [complexId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching requirements for complex:', error);
        throw error;
    }
}

/**
 * Update application requirements for a complex
 */
export async function updateApplicationRequirements(complexId, updates) {
    try {
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // List of allowed fields to update
        const allowedFields = [
            'first_name', 'last_name', 'gender', 'email', 'photo_id',
            'employment_status', 'min_monthly_income_ratio', 'valid_pay_stubs',
            'pets', 'birthday', 'driver_license', 'employment_hist',
            'children_allowed', 'guarantor_allowed', 'credit_score_min',
            'evictions', 'criminal_record'
        ];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = $${paramCount++}`);
                values.push(updates[field]);
            }
        }

        if (updateFields.length === 0) return null;

        values.push(complexId);
        const result = await db.query(`
            UPDATE application_requirements 
            SET ${updateFields.join(', ')}
            WHERE complex_id = $${paramCount}
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating application requirements:', error);
        throw error;
    }
}

/**
 * Check if an applicant meets requirements for a complex
 * Compares applicant data against requirement criteria
 */
export async function checkApplicantMeetsRequirements(applicationId, complexId) {
    try {
        // Get the application data
        const appResult = await db.query(
            'SELECT * FROM applications WHERE id = $1',
            [applicationId]
        );

        if (!appResult.rows[0]) {
            throw new Error('Application not found');
        }

        const application = appResult.rows[0];

        // Get the requirements
        const reqResult = await db.query(
            'SELECT * FROM application_requirements WHERE complex_id = $1',
            [complexId]
        );

        if (!reqResult.rows[0]) {
            // No requirements set = no filtering
            return { passes: true, failedRules: [] };
        }

        const requirements = reqResult.rows[0];
        const failedRules = [];

        // Check income requirement (monthly_income >= min_monthly_income_ratio * rent)
        if (requirements.min_monthly_income_ratio) {
            const unitResult = await db.query(
                'SELECT price FROM unit WHERE id = $1',
                [application.unit_id]
            );
            if (unitResult.rows[0]) {
                const requiredIncome = unitResult.rows[0].price * requirements.min_monthly_income_ratio;
                if (application.monthly_income < requiredIncome) {
                    failedRules.push({
                        rule: 'income_requirement',
                        required: requiredIncome,
                        provided: application.monthly_income
                    });
                }
            }
        }

        // Check employment status
        if (requirements.employment_status && application.employment_status) {
            const allowedStatuses = requirements.employment_status.split(',').map(s => s.trim());
            if (!allowedStatuses.includes(application.employment_status)) {
                failedRules.push({
                    rule: 'employment_status',
                    required: allowedStatuses,
                    provided: application.employment_status
                });
            }
        }

        // Check credit score
        if (requirements.credit_score_min && application.credit_score) {
            const scoreMap = { 'poor': 1, 'fair': 2, 'good': 3, 'excellent': 4, 'very poor': 0 };
            const applicantScore = scoreMap[application.credit_score.toLowerCase()] || 0;
            const requiredScore = scoreMap[requirements.credit_score_min.toLowerCase()] || 0;
            if (applicantScore < requiredScore) {
                failedRules.push({
                    rule: 'credit_score',
                    required: requirements.credit_score_min,
                    provided: application.credit_score
                });
            }
        }

        // Check pets allowed
        if (requirements.pets !== null && application.pets) {
            if (application.pets > requirements.pets) {
                failedRules.push({
                    rule: 'pets_limit',
                    required: requirements.pets,
                    provided: application.pets
                });
            }
        }

        // Check children allowed
        if (requirements.children_allowed !== null && application.children) {
            if (application.children > requirements.children_allowed) {
                failedRules.push({
                    rule: 'children_limit',
                    required: requirements.children_allowed,
                    provided: application.children
                });
            }
        }

        // Check eviction history
        if (requirements.evictions === false && application.evictions === true) {
            failedRules.push({
                rule: 'evictions_not_allowed',
                required: false,
                provided: true
            });
        }

        // Check criminal record
        if (requirements.criminal_record === false && application.criminal_record === true) {
            failedRules.push({
                rule: 'criminal_record_not_allowed',
                required: false,
                provided: true
            });
        }

        return {
            passes: failedRules.length === 0,
            failedRules
        };
    } catch (error) {
        console.error('Error checking applicant against requirements:', error);
        throw error;
    }
}

/**
 * Get all requirements with complex details
 */
export async function getAllRequirementsWithComplexInfo() {
    try {
        const result = await db.query(`
            SELECT 
                ar.*,
                c.us_state, c.city, c.street,
                l.first_name as landlord_first, l.last_name as landlord_last, l.company
            FROM application_requirements ar
            LEFT JOIN complex c ON ar.complex_id = c.id
            LEFT JOIN leaser l ON c.leaser_id = l.id
            ORDER BY c.us_state, c.city
        `);

        return result.rows;
    } catch (error) {
        console.error('Error fetching all requirements:', error);
        throw error;
    }
}

/**
 * Delete requirements for a complex
 */
export async function deleteApplicationRequirements(complexId) {
    try {
        const result = await db.query(
            'DELETE FROM application_requirements WHERE complex_id = $1 RETURNING id',
            [complexId]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting application requirements:', error);
        throw error;
    }
}
