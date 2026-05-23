import Item from '../models/Item.js';
import Household from '../models/Household.js';
import User from '../models/User.js';

export const createItem = async (req, res) => {
    try {
        const { name, category, expiryDate, quantity } = req.body;

        if (!name || !expiryDate) {
            return res.status(400).json({ message: 'Please provide both a name and an expiry date' });
        }

        const user = await User.findById(req.user._id);
        if (!user.household) {
            return res.status(400).json({ message: 'You must create or join a household before managing items' });
        }

        const item = await Item.create({
            name,
            category,
            expiryDate,
            quantity,
            household: user.household 
        });
        
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getItems = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.household) {
            return res.status(200).json([]);
        }

        const query = { household: user.household };

        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        if (req.query.category) {
            query.category = req.query.category;
        }

        const items = await Item.find(query).sort({ expiryDate: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const user = await User.findById(req.user._id);

        if (item.household.toString() !== user.household?.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete items outside your household' });
        }

        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const editItem = async (req, res) => {
    try {
        const { name, category, expiryDate, quantity } = req.body;
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const user = await User.findById(req.user._id);
        if (item.household.toString() !== user.household?.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit items outside your household' });
        }

        item.name = name || item.name;
        item.category = category || item.category;
        item.expiryDate = expiryDate || item.expiryDate;
        item.quantity = quantity || item.quantity;

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}