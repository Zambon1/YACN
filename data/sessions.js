// Session database - PostgreSQL backend
import db from '../utils/db.js';
import crypto from 'crypto';

export async function createSession(userId) {
    try {
        const token = crypto.randomBytes(64).toString('hex');
        await db.query(`
            INSERT INTO sessions (user_id, token)
            VALUES ($1, $2)
        `, [userId, token]);
        return token;
    } catch (error) {
        console.error('Error creating session:', error);
        throw error;
    }
}

export async function getSession(token) {
    try {
        const result = await db.query(`
            SELECT s.*, u.id as user_id, u.email, u.username, u.first_name, u.last_name
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = $1
        `, [token]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting session:', error);
        throw error;
    }
}

export async function destroySession(token) {
    try {
        const result = await db.query('DELETE FROM sessions WHERE token = $1', [token]);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error destroying session:', error);
        throw error;
    }
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
