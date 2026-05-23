import express from "express";
import { body } from 'express-validator';
import { createItem, getItems, deleteItem, editItem } from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";
import { itemValidation, itemUpdateValidation } from '../validators/itemValidator.js';

const router = express.Router();

router.post('/', protect, itemValidation, createItem);

router.get('/', protect, getItems);

router.delete('/:id', protect, deleteItem);

router.put('/:id', protect, itemUpdateValidation, editItem);

export default router;