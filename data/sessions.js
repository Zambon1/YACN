// Session database - stores active user sessions
// Each session has a unique token that clients use to authenticate

import db from '../utils/db.js';
import crypto from 'crypto';

export async function createSession(userId) {
    const token = crypto.randomBytes(64).toString('hex');
    const client = await db.connect();
    try {
        await client.query(`
            INSERT INTO sessions (user_id, token, created_at)
            VALUES ($1, $2, NOW())
        `, [userId, token]);
        return token;
    } finally {
        client.release();
    }
}

export async function getSession(token) {
    const client = await db.connect();
    try {
        const {rows} = await client.query(`
            SELECT s.*, u.id, u.email, u.username, u.first_name, u.last_name
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = $1
        `, [token]);
        return rows[0] || null;
    } finally {
        client.release();
    }
}

export async function destroySession(token) {
    const client = await db.connect();
    try {
        const {rowCount} = await client.query(`
            DELETE FROM sessions WHERE token = $1
        `, [token]);
        return rowCount > 0;
    } finally {
        client.release();
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
