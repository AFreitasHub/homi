import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validateMiddleware.js';

export const itemValidation = [
    body('name').trim().notEmpty().withMessage('Item name is required')
        .isLength({ max: 50 }).withMessage('Item name cannot exceed 50 characters'), 
    body('category').isIn(['Fridge', 'Freezer', 'Pantry']).withMessage('Category must be Fridge, Freezer, or Pantry'),
    body('expiryDate').isISO8601().withMessage('Please provide a valid date format'),
    body('quantity').optional().isInt({ min: 0, max: 9999 }).withMessage('Quantity must be between 0 and 9999'), 
    body('inShoppingList').optional().isBoolean().withMessage('inShoppingList must be a boolean'),
    handleValidationErrors
];

export const itemUpdateValidation = [
    body('name').optional().trim().notEmpty().withMessage('Item name is required')
        .isLength({ max: 50 }).withMessage('Item name cannot exceed 50 characters'), 
    body('expiryDate').optional().isISO8601().withMessage('Please provide a valid date format'),
    body('quantity').optional().isInt({ min: 0, max: 9999 }).withMessage('Quantity must be between 0 and 9999'), 
    body('inShoppingList').optional().isBoolean().withMessage('inShoppingList must be a boolean'),
    handleValidationErrors
];