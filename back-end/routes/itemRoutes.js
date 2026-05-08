import express from "express";
import { createItem, getItems, deleteItem } from "../controllers/itemController.js";

const router = express.Router()

router.post('/', createItem);

router.get('/', getItems);

router.delete('/:id', deleteItem);

export default router;