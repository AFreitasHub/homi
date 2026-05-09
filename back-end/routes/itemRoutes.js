import express from "express";
import { createItem, getItems, deleteItem, editItem } from "../controllers/itemController.js";

const router = express.Router()

router.post('/', createItem);

router.get('/', getItems);

router.delete('/:id', deleteItem);

router.put('/:id', editItem);

export default router;