import { findUserByEmail, findUserByUsername, createUser, getUserPublic } from '../data/users.js';
import { createSession, destroySession, getSession } from '../data/sessions.js';

// User signup
export function signup(req, res) {
    const { email, username, password, confirmPassword } = req.body;

    // Validation
    if (!email || !username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email, username, and password are required'
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            error: 'Passwords do not match'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters'
        });
    }

    if (username.length < 4 || username.length > 20) {
        return res.status(400).json({
            success: false,
            error: 'Username must be 4-20 characters'
        });
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
        return res.status(409).json({
            success: false,
            error: 'Email already registered'
        });
    }

    if (findUserByUsername(username)) {
        return res.status(409).json({
            success: false,
            error: 'Username already taken'
        });
    }

    // Create new user
    const newUser = createUser(email, username, password);
    
    // Create session
    const token = createSession(newUser.id, newUser.email, newUser.username);

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: getUserPublic(newUser)
    });
}

// User login
export function login(req, res) {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email/Username and password are required'
        });
    }

    // Find user by email or username
    let user = findUserByEmail(emailOrUsername);
    if (!user) {
        user = findUserByUsername(emailOrUsername);
    }
    
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid email/username or password'
        });
    }

    // Check password
    if (user.password !== password) {
        return res.status(401).json({
            success: false,
            error: 'Invalid email/username or password'
        });
    }

    // Create session
    const token = createSession(user.id, user.email, user.username);

    res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: getUserPublic(user)
    });
}

// Get current user (validate session)
export function getCurrentUser(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No session token provided'
        });
    }

    const session = getSession(token);
    if (!session) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired session'
        });
    }

    res.json({
        success: true,
        user: session
    });
}

// User logout
export function logout(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(400).json({
            success: false,
            error: 'No session token provided'
        });
    }

    if (destroySession(token)) {
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
}
