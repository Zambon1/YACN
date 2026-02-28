import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

const result = dotenv.config({ path: envPath });
console.log('dotenv.config result:', result.parsed);
console.log('DB_NAME env var:', process.env.DB_NAME);
console.log('DB_USER env var:', process.env.DB_USER);
console.log('DB_PASSWORD env var:', process.env.DB_PASSWORD);
console.log('All process.env keys:',  Object.keys(process.env).filter(k => k.startsWith('DB_')));
