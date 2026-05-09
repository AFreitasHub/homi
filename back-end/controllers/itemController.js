import Item from '../models/Item.js';

export const createItem = async (req, res) => {
    try {
        const { name, category, expiryDate, quantity } = req.body;

        if (!name || !expiryDate) {
            return res.status(400).json({ message: 'Please provide both a name and an expiry date' });
        }

        const item = await Item.create({
            name,
            category,
            expiryDate,
            quantity,
            user: req.user._id
        });
        
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getItems = async (req, res) => {
    try {
        // fetch and sort (ascending)
        const items = await Item.find({ user: req.user._id }).sort({ expiryDate: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this item' });
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

        if (item.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this item' });
        }

        item.name = name || item.name;
        item.category = category || item.category;
        item.expiryDate = expiryDate || item.expiryDate;
        item.quantity = quantity || item.quantity;

        const updatedItem = await item.save();

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message });
    }
}