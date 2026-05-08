import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import User from './models/User.js';
import Item from './models/Item.js';

import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.json({ message: 'is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));