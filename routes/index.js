import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve index.html for root path
router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'), {
        headers: {
            'Content-Type': 'text/html'
        }
    });
});

export default router;
