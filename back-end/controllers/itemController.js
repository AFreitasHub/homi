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