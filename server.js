import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRoutes from './routes/index.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🏠 RentMatch server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
