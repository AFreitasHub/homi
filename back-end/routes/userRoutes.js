import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, profileUpdateValidation } from '../validators/userValidator.js';
import { strictLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/', strictLimiter, registerValidation, registerUser);

router.post('/login', strictLimiter, loginUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, profileUpdateValidation, updateUserProfile)
    .delete(protect, deleteUserProfile);

export default router;