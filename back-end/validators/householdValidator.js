import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validateMiddleware.js';

export const createHouseholdValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Household name is required')
        .isLength({ max: 50 }).withMessage('Household name cannot exceed 50 characters'),
    handleValidationErrors
];

export const joinHouseholdValidation = [
    body('inviteCode')
        .trim()
        .notEmpty().withMessage('Invite code is required')
        .isLength({ min: 6, max: 6 }).withMessage('Invite code must be exactly 6 characters')
        .isAlphanumeric().withMessage('Invite code must contain only letters and numbers'),
    handleValidationErrors
];