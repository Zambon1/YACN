import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const applicationsFilePath = path.join(__dirname, 'applications.json');

export function loadApplications() {
    try {
        if (fs.existsSync(applicationsFilePath)) {
            const data = fs.readFileSync(applicationsFilePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading applications:', error);
    }
    return [];
}

function saveApplications() {
    try {
        fs.writeFileSync(applicationsFilePath, JSON.stringify(applications, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving applications:', error);
    }
}

export const applications = loadApplications();

export function createApplicationRecord(payload) {
    const payloadEmail = payload?.email ? String(payload.email).toLowerCase() : null;

    const existingIndex = applications.findIndex((application) => {
        if (payload?.userId && application?.userId && application.userId === payload.userId) {
            return true;
        }

        if (payloadEmail && application?.email) {
            return String(application.email).toLowerCase() === payloadEmail;
        }

        return false;
    });

    if (existingIndex !== -1) {
        const existingRecord = applications[existingIndex];
        const updatedRecord = {
            ...existingRecord,
            ...payload,
            id: existingRecord.id,
            createdAt: existingRecord.createdAt,
            updatedAt: new Date().toISOString()
        };

        applications[existingIndex] = updatedRecord;
        saveApplications();

        return updatedRecord;
    }

    const maxExistingId = applications.reduce((maxId, application) => {
        const numericId = Number.parseInt(application.id, 10);
        if (Number.isNaN(numericId)) {
            return maxId;
        }
        return Math.max(maxId, numericId);
    }, 0);

    const id = (maxExistingId + 1).toString();

    const record = {
        id,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    applications.push(record);
    saveApplications();

    return record;
}
