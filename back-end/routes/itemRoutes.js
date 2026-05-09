import express from "express";
import { createItem, getItems, deleteItem, editItem } from "../controllers/itemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', protect, createItem);

router.get('/', protect, getItems);

router.delete('/:id', protect, deleteItem);

router.put('/:id', protect, editItem);

export default router;