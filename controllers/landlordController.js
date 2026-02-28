// Landlord controller - Handle landlord account creation and complex management
import { createUser, findUserByEmail, findUserByUsername, getUserPublic, findUserById } from '../data/users.js';
import { createSession } from '../data/sessions.js';
import * as complexes from '../data/complexes.js';
import * as leasers from '../data/leasers.js';
import * as requirements from '../data/requirements.js';

function isLandlordRole(role) {
    return role === 'owner' || role === 'manager' || role === 'landlord';
}

/**
 * Landlord Signup
 * POST /api/landlord/signup
 */
export async function landlordSignup(req, res) {
    try {
        const { 
            firstName, lastName, username, email, phone, password, confirmPassword,
            companyName, licenseNumber 
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !username || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        if (!companyName) {
            return res.status(400).json({
                success: false,
                error: 'Company name is required'
            });
        }

        if (!licenseNumber || String(licenseNumber).trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'License number is required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Passwords do not match'
            });
        }

        if (!email.includes('@')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        if (phone.toString().length < 10 || phone.toString().length > 11) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number'
            });
        }

        // Check for duplicate email
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                error: `Email already registered: ${email}`,
                errorType: 'EMAIL_EXISTS',
                field: 'email'
            });
        }

        // Check for duplicate username
        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                error: `Username already taken: ${username}`,
                errorType: 'USERNAME_EXISTS',
                field: 'username'
            });
        }

        // Create landlord user (normalized to an allowed DB role)
        const newUser = await createUser(firstName, lastName, username, email, phone, password, 'landlord');
        
        // Create leaser profile for the landlord
        const leaser = await leasers.createLeaser({
            first_name: firstName,
            last_name: lastName,
            company: companyName,
            email: email,
            username: username,
            phone: phone,
            license_number: licenseNumber,
            user_id: newUser.id
        });

        const token = await createSession(newUser.id);

        res.status(201).json({
            success: true,
            message: 'Landlord account created successfully',
            token,
            user: {
                ...getUserPublic(newUser),
                leaser_id: leaser.id,
                company: leaser.company
            }
        });
    } catch (error) {
        console.error('Landlord signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating landlord account'
        });
    }
}

/**
 * Get landlord profile (includes complexes)
 * GET /api/landlord/profile
 * Requires auth token
 */
export async function getLandlordProfile(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Get session to retrieve user
        const { getSession } = await import('../data/sessions.js');
        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        const user = await findUserById(session.user_id);
        if (!user || !isLandlordRole(user.role)) {
            return res.status(403).json({
                success: false,
                error: 'This endpoint is for landlords only'
            });
        }

        // Get leaser info
        const leaser = await leasers.getLeaserByUserId(user.id);
        if (!leaser) {
            return res.status(404).json({
                success: false,
                error: 'Leaser profile not found'
            });
        }

        // Get all complexes for this leaser
        const userComplexes = await complexes.getComplexesByLeaserId(leaser.id);

        res.json({
            success: true,
            user: getUserPublic(user),
            leaser: leaser,
            complexes: userComplexes
        });
    } catch (error) {
        console.error('Get landlord profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching profile'
        });
    }
}

/**
 * Create a new complex
 * POST /api/landlord/complex
 * Requires auth token
 */
export async function createLandlordComplex(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Get session to verify user is landlord
        const { getSession } = await import('../data/sessions.js');
        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        const user = await findUserById(session.user_id);
        if (!user || !isLandlordRole(user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Only landlords can create complexes'
            });
        }

        // Get leaser profile
        const leaser = await leasers.getLeaserByUserId(user.id);
        if (!leaser) {
            return res.status(400).json({
                success: false,
                error: 'Leaser profile not found'
            });
        }

        const { propertyName, street, city, state, areaCode } = req.body;

        if (!propertyName || !street || !city || !state) {
            return res.status(400).json({
                success: false,
                error: 'Property name, street, city, and state are required'
            });
        }

        // Create the complex
        const newComplex = await complexes.createComplex({
            leaser_id: leaser.id,
            us_state: state,
            city: city,
            street: street,
            area_code: areaCode || null,
            property_name: propertyName
        });

        res.status(201).json({
            success: true,
            message: 'Complex created successfully',
            complex: newComplex
        });
    } catch (error) {
        console.error('Create complex error:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating complex'
        });
    }
}

/**
 * Update complex
 * PUT /api/landlord/complex/:complexId
 * Requires auth token
 */
export async function updateLandlordComplex(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { complexId } = req.params;

        // Verify user owns this complex
        const { getSession } = await import('../data/sessions.js');
        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const user = await findUserById(session.user_id);
        const leaser = await leasers.getLeaserByUserId(user.id);
        const complex = await complexes.getComplexById(complexId);

        if (!complex || complex.leaser_id !== leaser.id) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to edit this complex'
            });
        }

        const updates = {};
        if (req.body.propertyName) updates.property_name = req.body.propertyName;
        if (req.body.street) updates.street = req.body.street;
        if (req.body.city) updates.city = req.body.city;
        if (req.body.state) updates.us_state = req.body.state;
        if (req.body.areaCode) updates.area_code = req.body.areaCode;

        const updatedComplex = await complexes.updateComplex(complexId, updates);

        res.json({
            success: true,
            message: 'Complex updated successfully',
            complex: updatedComplex
        });
    } catch (error) {
        console.error('Update complex error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating complex'
        });
    }
}

/**
 * Delete complex
 * DELETE /api/landlord/complex/:complexId
 * Requires auth token
 */
export async function deleteLandlordComplex(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { complexId } = req.params;

        // Verify user owns this complex
        const { getSession } = await import('../data/sessions.js');
        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const user = await findUserById(session.user_id);
        const leaser = await leasers.getLeaserByUserId(user.id);
        const complex = await complexes.getComplexById(complexId);

        if (!complex || complex.leaser_id !== leaser.id) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this complex'
            });
        }

        const success = await complexes.deleteComplex(complexId);
        if (!success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to delete complex'
            });
        }

        res.json({
            success: true,
            message: 'Complex deleted successfully'
        });
    } catch (error) {
        console.error('Delete complex error:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting complex'
        });
    }
}

/**
 * Get requirements for a complex
 * GET /api/landlord/complex/:complexId/requirements
 * Requires auth token
 */
export async function getComplexRequirements(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { complexId } = req.params;

        // Verify user owns this complex
        const { getSession } = await import('../data/sessions.js');
        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const user = await findUserById(session.user_id);
        const leaser = await leasers.getLeaserByUserId(user.id);
        const complex = await complexes.getComplexById(complexId);

        if (!complex || complex.leaser_id !== leaser.id) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to access this complex'
            });
        }

        // Get requirements
        let reqs = await requirements.getRequirementsForComplex(complexId);
        
        // If no requirements exist, return defaults
        if (!reqs) {
            reqs = {
                complex_id: complexId,
                first_name: true,
                last_name: true,
                gender: false,
                email: true,
                photo_id: false,
                employment_status: false,
                min_monthly_income_ratio: 3.0,
                valid_pay_stubs: false,
                pets: 0,
                birthday: false,
                driver_license: false,
                employment_hist: false,
                children_allowed: 10,
                guarantor_allowed: true,
                credit_score_min: null,
                evictions: false,
                criminal_record: false
            };
        }

        res.json({
            success: true,
            requirements: reqs
        });
    } catch (error) {
        console.error('Get requirements error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching requirements'
        });
    }
}

/**
 * Update requirements for a complex
 * PUT /api/landlord/complex/:complexId/requirements
 * Requires auth token
 */
export async function updateComplexRequirements(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { complexId } = req.params;

        // Verify user owns this complex
        const { getSession } = await import('../data/sessions.js');
        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid session'
            });
        }

        const user = await findUserById(session.user_id);
        const leaser = await leasers.getLeaserByUserId(user.id);
        const complex = await complexes.getComplexById(complexId);

        if (!complex || complex.leaser_id !== leaser.id) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to edit this complex'
            });
        }

        // Check if requirements exist, if not create them
        let existingReqs = await requirements.getRequirementsForComplex(complexId);
        
        let updatedReqs;
        if (!existingReqs) {
            updatedReqs = await requirements.createApplicationRequirements({
                complex_id: complexId,
                ...req.body
            });
        } else {
            updatedReqs = await requirements.updateApplicationRequirements(complexId, req.body);
        }

        res.json({
            success: true,
            message: 'Requirements updated successfully',
            requirements: updatedReqs
        });
    } catch (error) {
        console.error('Update requirements error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating requirements'
        });
    }
}
