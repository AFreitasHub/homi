import Item from '../models/Item.js';
import User from '../models/User.js';

export const createItem = async (req, res) => {
    try {
        const { name, category, expiryDate, quantity, inShoppingList } = req.body;

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
            quantity: quantity !== undefined ? quantity : 1,
            household: user.household,
            inShoppingList: inShoppingList || false
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

        if (req.query.shoppingList !== undefined) {
            query.inShoppingList = req.query.shoppingList === 'true';
        }

        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        if (req.query.category) {
            query.category = req.query.category;
        }

        // sort by expiration date
        const items = await Item.find(query).sort({ expiryDate: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const { permanent } = req.query; // check for a flag
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const user = await User.findById(req.user._id);

        if (item.household.toString() !== user.household?.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete items outside your household' });
        }

        if (permanent === 'true' || item.inShoppingList) {
            await item.deleteOne();
            res.json({ message: 'Item permanently removed' });
        } else {
            item.inShoppingList = true;
            item.quantity = 0;
            await item.save();
            res.json({ message: 'Item moved to shopping list' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const editItem = async (req, res) => {
    try {
        const { name, category, expiryDate, quantity, inShoppingList } = req.body;
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
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        
        if (inShoppingList !== undefined) {
            item.inShoppingList = inShoppingList;
        }

        if (item.inShoppingList && item.quantity > 0) {
            item.inShoppingList = false;
        }

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}