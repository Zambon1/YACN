import { findUserByEmail, findUserByUsername, createUser, getUserPublic, findUserById } from '../data/users.js';
import { createSession, destroySession, getSession } from '../data/sessions.js';

export async function signup(req, res) {
    try {
        const { firstName, lastName, username, email, phone, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !username || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
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

        const newUser = await createUser(firstName, lastName, username, email, phone, password);
        const token = await createSession(newUser.id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: getUserPublic(newUser)
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating account'
        });
    }
}

export async function login(req, res) {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email/Username and password are required'
            });
        }

        let user = await findUserByEmail(emailOrUsername);
        if (!user) {
            user = await findUserByUsername(emailOrUsername);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email/username or password'
            });
        }

        // Support both password and password_hash fields
        const storedPassword = user.password_hash || user.password;
        if (storedPassword !== password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email/username or password'
            });
        }

        const token = await createSession(user.id);

        res.json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: getUserPublic(user)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Error logging in'
        });
    }
}

export async function getCurrentUser(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No session token provided'
            });
        }

        const session = await getSession(token);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }

        const user = await findUserById(session.user_id);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: getUserPublic(user)
        });
    } catch (error) {
        console.error('getCurrentUser error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching user'
        });
    }
}

export async function logout(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'No session token provided'
            });
        }

        const success = await destroySession(token);
        if (success) {
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Invalid session token'
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Error logging out'
        });
    }
}
/**
 * Check if email is available (not already in use)
 * GET /api/check-email?email=...
 */
export async function checkEmailAvailability(req, res) {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                available: false,
                error: 'Email is required'
            });
        }

        if (!email.includes('@')) {
            return res.status(400).json({
                available: false,
                error: 'Invalid email format'
            });
        }

        const existingUser = await findUserByEmail(email);

        res.json({
            available: !existingUser,
            email: email,
            message: existingUser ? 'Email already in use' : 'Email is available'
        });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            available: null,
            error: 'Error checking email availability'
        });
    }
}

/**
 * Check if username is available (not already in use)
 * GET /api/check-username?username=...
 */
export async function checkUsernameAvailability(req, res) {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({
                available: false,
                error: 'Username is required'
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                available: false,
                error: 'Username must be at least 3 characters'
            });
        }

        if (username.length > 20) {
            return res.status(400).json({
                available: false,
                error: 'Username must be less than 20 characters'
            });
        }

        // Check for valid username format (alphanumeric and underscore only)
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({
                available: false,
                error: 'Username can only contain letters, numbers, and underscores'
            });
        }

        const existingUser = await findUserByUsername(username);

        res.json({
            available: !existingUser,
            username: username,
            message: existingUser ? 'Username already taken' : 'Username is available'
        });
    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({
            available: null,
            error: 'Error checking username availability'
        });
    }
}