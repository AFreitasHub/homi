import express from 'express';
import { createHousehold, getHousehold, joinHousehold } from '../controllers/householdController.js';
import { protect } from '../middleware/authMiddleware.js';
import { strictLimiter } from '../middleware/rateLimitMiddleware.js';
import { createHouseholdValidation, joinHouseholdValidation } from '../validators/householdValidator.js'; 

const router = express.Router();

router.post('/', protect, createHouseholdValidation, createHousehold);

router.post('/join', protect, strictLimiter, joinHouseholdValidation, joinHousehold);

router.get('/', protect, getHousehold);

export default router;