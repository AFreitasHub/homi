import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validateMiddleware.js';

export const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'), 
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail()
        .isLength({ max: 100 }).withMessage('Email is too long'), 
    body('password').isLength({ min: 6, max: 256 }).withMessage('Password must be between 6 and 256 characters'), 
    handleValidationErrors
];

export const profileUpdateValidation = [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'), 
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail()
        .isLength({ max: 100 }).withMessage('Email is too long'), 
    body('password').isLength({ min: 6, max: 256 }).withMessage('Password must be between 6 and 256 characters'), 
    handleValidationErrors
];