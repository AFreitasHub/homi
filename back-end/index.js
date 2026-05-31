import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB from './config/db.js';
import User from './models/User.js';
import Item from './models/Item.js';

import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import householdRoutes from './routes/householdRoutes.js';
import { globalLimiter } from './middleware/rateLimitMiddleware.js';

dotenv.config();

connectDB();

const app = express();

app.use(helmet());
app.use(globalLimiter);
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query) mongoSanitize.sanitize(req.query);
    next();
});

// test route
app.get('/', (req, res) => {
    res.json({ message: 'is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/households', householdRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));