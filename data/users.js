// User database - PostgreSQL backend with UUID and enhanced features
import db from '../utils/db.js';

function normalizeUserRole(role) {
    const normalized = String(role || 'renter').trim().toLowerCase();

    if (normalized === 'landlord') {
        return 'owner';
    }

    if (normalized === 'manager' || normalized === 'owner' || normalized === 'renter') {
        return normalized;
    }

    return 'renter';
}

export async function createUser(firstName, lastName, username, email, phone, password, role = 'renter') {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const dbRole = normalizeUserRole(role);

        const settingsResult = await client.query(
            'INSERT INTO settings DEFAULT VALUES RETURNING id'
        );
        const settingsId = settingsResult.rows[0].id;

        // Create user with specified role (default: 'renter')
        const userResult = await client.query(`
            INSERT INTO users (first_name, last_name, username, email, phone, password_hash, settings_id, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [firstName, lastName, username, email, phone, password, settingsId, dbRole]);

        const createdUser = userResult.rows[0];

        const preferencesResult = await client.query(`
            INSERT INTO preferences (user_id)
            VALUES ($1)
            RETURNING id
        `, [createdUser.id]);

        const preferencesId = preferencesResult.rows[0].id;

        const finalUserResult = await client.query(`
            UPDATE users
            SET preferences_id = $1
            WHERE id = $2
            RETURNING *
        `, [preferencesId, createdUser.id]);

        await client.query('COMMIT');
        return finalUserResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating user:', error);
        throw error;
    } finally {
        client.release();
    }
}

export async function findUserByEmail(email) {
    try {
        const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
}

export async function findUserByUsername(username) {
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
}

export async function findUserById(id) {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by id:', error);
        throw error;
    }
}

export function getUserPublic(user) {
    if (!user) return null;
    const { password_hash, password, ...publicUser } = user;
    return publicUser;
}

export async function getUserSettings(userId) {
    try {
        const result = await db.query(`
            SELECT s.* 
            FROM settings s
            JOIN users u ON u.settings_id = s.id
            WHERE u.id = $1
        `, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching user settings:', error);
        throw error;
    }
}

export async function getUserPreferences(userId) {
    try {
        const result = await db.query(`
            SELECT p.* 
            FROM preferences p
            JOIN users u ON u.preferences_id = p.id
            WHERE u.id = $1
        `, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        throw error;
    }
}

export async function updateUserSettings(userId, settings) {
    try {
        const user = await findUserById(userId);
        if (!user || !user.settings_id) {
            throw new Error('User or settings not found');
        }

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (settings.text_messages !== undefined) {
            updates.push(`text_messages = $${paramCount++}`);
            values.push(settings.text_messages);
        }
        if (settings.email_list !== undefined) {
            updates.push(`email_list = $${paramCount++}`);
            values.push(settings.email_list);
        }
        if (settings.dark_mode !== undefined) {
            updates.push(`dark_mode = $${paramCount++}`);
            values.push(settings.dark_mode);
        }

        if (updates.length === 0) return null;

        values.push(user.settings_id);
        const result = await db.query(`
            UPDATE settings 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating user settings:', error);
        throw error;
    }
}

export async function updateUserPreferences(userId, preferences) {
    try {
        const user = await findUserById(userId);
        if (!user || !user.preferences_id) {
            throw new Error('User or preferences not found');
        }

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (preferences.price_min !== undefined) {
            updates.push(`price_min = $${paramCount++}`);
            values.push(preferences.price_min);
        }
        if (preferences.price_max !== undefined) {
            updates.push(`price_max = $${paramCount++}`);
            values.push(preferences.price_max);
        }
        if (preferences.pet_preference !== undefined) {
            updates.push(`pet_preference = $${paramCount++}`);
            values.push(preferences.pet_preference);
        }
        if (preferences.bedroom_preference !== undefined) {
            updates.push(`bedroom_preference = $${paramCount++}`);
            values.push(preferences.bedroom_preference);
        }
        if (preferences.bathroom_preference !== undefined) {
            updates.push(`bathroom_preference = $${paramCount++}`);
            values.push(preferences.bathroom_preference);
        }
        if (preferences.term_preference !== undefined) {
            updates.push(`term_preference = $${paramCount++}`);
            values.push(preferences.term_preference);
        }

        if (updates.length === 0) return null;

        values.push(user.preferences_id);
        const result = await db.query(`
            UPDATE preferences 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
    }
}

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const usersFilePath = path.join(__dirname, 'users.json');

// // Load users from file or initialize empty array
// function loadUsers() {
//     try {
//         if (fs.existsSync(usersFilePath)) {
//             const data = fs.readFileSync(usersFilePath, 'utf-8');
//             const loadedUsers = JSON.parse(data);
//             console.log(`✓ Loaded ${loadedUsers.length} user(s) from database`);
//             return loadedUsers;
//         }
//     } catch (error) {
//         console.error('Error loading users:', error);
//     }
//     console.log('✓ Initialized new user database');
//     return [];
// }

// // Save users to file
// function saveUsers() {
//     try {
//         fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
//         console.log(`✓ User database saved (${users.length} total users)`);
//     } catch (error) {
//         console.error('Error saving users:', error);
//     }
// }

// export const users = loadUsers();

// // Function to find user by email
// export function findUserByEmail(email) {
//     return users.find(user => user.email === email);
// }

// // Function to find user by username
// export function findUserByUsername(username) {
//     return users.find(user => user.username === username);
// }

// // Function to find user by ID
// export function findUserById(id) {
//     return users.find(user => user.id === id);
// }

// // Function to create a new user
// export function createUser(email, username, password) {
//     const maxExistingId = users.reduce((maxId, user) => {
//         const numericId = Number.parseInt(user.id, 10);
//         if (Number.isNaN(numericId)) {
//             return maxId;
//         }
//         return Math.max(maxId, numericId);
//     }, 0);

//     const id = (maxExistingId + 1).toString();
//     const newUser = {
//         id,
//         email,
//         username,
//         password, // In production, hash this!
//         createdAt: new Date().toISOString()
//     };
//     users.push(newUser);
//     saveUsers(); // Persist to file
//     return newUser;
// }

// // Function to get user without password (for API responses)
// export function getUserPublic(user) {
//     if (!user) return null;
//     const { password, ...publicUser } = user;
//     return publicUser;
// }
