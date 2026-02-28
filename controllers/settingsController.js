// Settings and Preferences Controller
import { getUserSettings, getUserPreferences, updateUserSettings, updateUserPreferences } from '../data/users.js';
import { getSession } from '../data/sessions.js';

export async function getSettings(req, res) {
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

        const settings = await getUserSettings(session.user_id);
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching settings'
        });
    }
}

export async function updateSettings(req, res) {
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

        const updatedSettings = await updateUserSettings(session.user_id, req.body);
        res.json({
            success: true,
            settings: updatedSettings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating settings'
        });
    }
}

export async function getPreferences(req, res) {
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

        const preferences = await getUserPreferences(session.user_id);
        res.json({
            success: true,
            preferences
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching preferences'
        });
    }
}

export async function updatePreferences(req, res) {
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

        const updatedPreferences = await updateUserPreferences(session.user_id, req.body);
        res.json({
            success: true,
            preferences: updatedPreferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating preferences'
        });
    }
}
