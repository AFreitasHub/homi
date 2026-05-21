import express from 'express';
import { createHousehold, getHousehold, joinHousehold } from '../controllers/householdController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createHousehold);

router.post('/join', protect, joinHousehold);

router.get('/', protect, getHousehold);

export default router;