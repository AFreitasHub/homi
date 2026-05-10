import express from 'express';
import { createHousehold } from '../controllers/householdController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createHousehold);

export default router;