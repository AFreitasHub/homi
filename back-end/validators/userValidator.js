import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validateMiddleware.js';

export const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
];

export const profileUpdateValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
];