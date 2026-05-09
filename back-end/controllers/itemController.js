import Item from '../models/Item.js';

export const createItem = async (req, res) => {
    try {
        const { name, category, expiryDate, quantity, user } = req.body;

        if (!name || !expiryDate) {
            return res.status(400).json({ message: 'Please provide both a name and an expiry date' });
        }

        const item = await Item.create({
            name,
            category,
            expiryDate,
            quantity,
            user // Manually providing a User ID from Atlas for now to keep testing simple
        });
        
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getItems = async (req, res) => {
    try {
        // TEMPORARY - will use JWT tokens later instead of url param
        const userId = req.query.user;

        if (!userId) {
            return res.status(400).json({ message: 'Error: Missing User ID' });
        }

        // fetch and sort (ascending)
        const items = await Item.find({ user: userId }).sort({ expiryDate: 1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (item) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const editItem = async (req, res) => {
    try {
        const { name, category, expiryDate, quantity, user } = req.body;

        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
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