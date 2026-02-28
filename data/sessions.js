// Session database - stores active user sessions
// Each session has a unique token that clients use to authenticate

import db from '../utils/db.js';
import crypto from 'crypto';

export async function createSession(userId) {
    const token = crypto.randomBytes(64).toString('utf-8');
    const client = await db.connect();
    await client.query(`
        INSERT INTO sessions (user_id, token)
        VALUES ($1, $2)
        `, userId, token);
}


// export const sessions = {}; // { token: { userId, email, username, createdAt } }

// // Generate a random session token
// export function generateSessionToken() {
//     return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
// }

// // Create a new session for a user
// export function createSession(userId, email, username) {
//     const token = generateSessionToken();
//     sessions[token] = {
//         userId,
//         email,
//         username,
//         createdAt: new Date().toISOString()
//     };
//     return token;
// }

// // Get session by token
// export function getSession(token) {
//     return sessions[token] || null;
// }

// // Destroy a session
// export function destroySession(token) {
//     if (sessions[token]) {
//         delete sessions[token];
//         return true;
//     }
//     return false;
// }

// // Check if session exists and is valid
// export function isValidSession(token) {
//     return sessions[token] !== undefined;
// }

// // Get all active sessions (for debugging)
// export function getAllSessions() {
//     return Object.keys(sessions).map(token => ({
//         token,
//         ...sessions[token]
//     }));
// }
