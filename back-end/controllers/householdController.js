import Household from '../models/Household.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const createHousehold = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Household name is required' });
        }

        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const household = await Household.create({
            name,
            inviteCode,
            owner: req.user._id,
            members: [req.user._id]
        });

        await User.findByIdAndUpdate(req.user._id, { household: household._id });

        res.status(201).json(household);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};