import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validateMiddleware.js';

export const itemValidation = [
    body('name').trim().notEmpty().withMessage('Item name is required'),
    body('category').isIn(['Fridge', 'Freezer', 'Pantry']).withMessage('Category must be Fridge, Freezer, or Pantry'),
    body('expiryDate').isISO8601().withMessage('Please provide a valid ISO8601 date format'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be an integer greater than 0'),
    handleValidationErrors
];

export const itemUpdateValidation = [
    body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
    body('category').optional().isIn(['Fridge', 'Freezer', 'Pantry']).withMessage('Category must be Fridge, Freezer, or Pantry'),
    body('expiryDate').optional().isISO8601().withMessage('Please provide a valid date format'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be an integer 0 or greater'),
    handleValidationErrors
];