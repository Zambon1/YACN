// User database - stores all registered users
// Persisted to users.json file

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, 'users.json');

// Load users from file or initialize empty array
function loadUsers() {
    try {
        if (fs.existsSync(usersFilePath)) {
            const data = fs.readFileSync(usersFilePath, 'utf-8');
            const loadedUsers = JSON.parse(data);
            console.log(`✓ Loaded ${loadedUsers.length} user(s) from database`);
            return loadedUsers;
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
    console.log('✓ Initialized new user database');
    return [];
}

// Save users to file
function saveUsers() {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
        console.log(`✓ User database saved (${users.length} total users)`);
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

export const users = loadUsers();

// Function to find user by email
export function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

// Function to find user by username
export function findUserByUsername(username) {
    return users.find(user => user.username === username);
}

// Function to find user by ID
export function findUserById(id) {
    return users.find(user => user.id === id);
}

// Function to create a new user
export function createUser(email, username, password) {
    const id = Date.now().toString(); // Simple ID generation
    const newUser = {
        id,
        email,
        username,
        password, // In production, hash this!
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(); // Persist to file
    return newUser;
}

// Function to get user without password (for API responses)
export function getUserPublic(user) {
    if (!user) return null;
    const { password, ...publicUser } = user;
    return publicUser;
}
