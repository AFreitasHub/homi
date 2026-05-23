import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, profileUpdateValidation } from '../validators/userValidator.js';

const router = express.Router();

router.post('/', registerValidation, registerUser);

router.post('/login', loginUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, profileUpdateValidation, updateUserProfile)
    .delete(protect, deleteUserProfile);

export default router;