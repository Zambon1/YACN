// User database - stores all registered users
// In production, this would be a real database like MongoDB or PostgreSQL

export const users = [
    // Example user for testing:
    // {
    //     id: '1',
    //     email: 'test@example.com',
    //     username: 'testuser',
    //     password: 'password123',
    //     createdAt: new Date().toISOString()
    // }
];

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
    return newUser;
}

// Function to get user without password (for API responses)
export function getUserPublic(user) {
    if (!user) return null;
    const { password, ...publicUser } = user;
    return publicUser;
}
