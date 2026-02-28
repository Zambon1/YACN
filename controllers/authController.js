import { findUserByEmail, findUserByUsername, createUser, getUserPublic } from '../data/users.js';
import { createSession, destroySession, getSession } from '../data/sessions.js';

import { Router } from 'express';
import { createUser } from '../data/users.js';
import { createSession } from '../data/sessions.js';

const router = Router();

function validateCreateUserBody(body) {
    const {firstName, lastName, username, email, phone, password, confirmPassword} = body;
    if (!firstName || !lastName || !email || !password || !username ) {
        res.send("You must fill out all required fiedls.");
        return false;
    };
    if (!email.includes('@')) {
        res.send("must include valid email address.");
        return false;
    }
    if (findUserByEmail(email) != '') {
        res.send("Email already exists.");
        return false;
    }
    if (findUserByUsername(username) != '') {
        res.send("Username already exists.");
        return false;
    }
    if (phone.toString().length > 11 || phone.toString().length < 10) {
        res.send("Invalid phone number");
        return false;
    }
    if (password != confirmPassword) {
        res.send("Passwords do not match!");
        return false;
    }
    return true;
}

router.post("/", async (req, res) => {
    if (validateCreateUserBody(req.body)) {
            const user = await createUser(
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        req.body.phone,
        req.body.password,
        req.body.confirmPassword
        )

        const token = await createSession(user.id);
        res.cookie('session_token', token, {httpOnly: true});
        // 

        res.send("User created");
    }
})

// User signup
// export async function signup(req, res) {
//     const { email, username, password, confirmPassword } = req.body;

//     // Validation
//     if (!email || !username || !password) {
//         return res.status(400).json({
//             success: false,
//             error: 'Email, username, and password are required'
//         });
//     }

//     if (password !== confirmPassword) {
//         return res.status(400).json({
//             success: false,
//             error: 'Passwords do not match'
//         });
//     }

//     if (password.length < 6) {
//         return res.status(400).json({
//             success: false,
//             error: 'Password must be at least 6 characters'
//         });
//     }

//     if (username.length < 4 || username.length > 20) {
//         return res.status(400).json({
//             success: false,
//             error: 'Username must be 4-20 characters'
//         });
//     }

//     // Check if user already exists
//     if (findUserByEmail(email)) {
//         return res.status(409).json({
//             success: false,
//             error: 'Email already registered'
//         });
//     }

//     if (findUserByUsername(username)) {
//         return res.status(409).json({
//             success: false,
//             error: 'Username already taken'
//         });
//     }

//     // Create new user
//     const newUser = createUser(email, username, password);
    
//     // Create session
//     const token = createSession(newUser.id, newUser.email, newUser.username);

//     res.status(201).json({
//         success: true,
//         message: 'Account created successfully',
//         token,
//         user: getUserPublic(newUser)
//     });
// }

// // User login
// export function login(req, res) {
//     const { emailOrUsername, password } = req.body;

//     // Validation
//     if (!emailOrUsername || !password) {
//         return res.status(400).json({
//             success: false,
//             error: 'Email/Username and password are required'
//         });
//     }

//     // Find user by email or username
//     let user = findUserByEmail(emailOrUsername);
//     if (!user) {
//         user = findUserByUsername(emailOrUsername);
//     }
    
//     if (!user) {
//         return res.status(401).json({
//             success: false,
//             error: 'Invalid email/username or password'
//         });
//     }

//     // Check password
//     if (user.password !== password) {
//         return res.status(401).json({
//             success: false,
//             error: 'Invalid email/username or password'
//         });
//     }

//     // Create session
//     const token = createSession(user.id, user.email, user.username);

//     res.json({
//         success: true,
//         message: 'Logged in successfully',
//         token,
//         user: getUserPublic(user)
//     });
// }

// // Get current user (validate session)
// export function getCurrentUser(req, res) {
//     const token = req.headers.authorization?.replace('Bearer ', '');

//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             error: 'No session token provided'
//         });
//     }

//     const session = getSession(token);
//     if (!session) {
//         return res.status(401).json({
//             success: false,
//             error: 'Invalid or expired session'
//         });
//     }

//     res.json({
//         success: true,
//         user: session
//     });
// }

// // User logout
// export function logout(req, res) {
//     const token = req.headers.authorization?.replace('Bearer ', '');

//     if (!token) {
//         return res.status(400).json({
//             success: false,
//             error: 'No session token provided'
//         });
//     }

//     if (destroySession(token)) {
//         res.json({
//             success: true,
//             message: 'Logged out successfully'
//         });
//     } else {
//         res.status(401).json({
//             success: false,
//             error: 'Invalid session token'
//         });
//     }
// }
