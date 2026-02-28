import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve index.html for root path
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

export default router;
