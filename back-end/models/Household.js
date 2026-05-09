import mongoose from "mongoose";

const householdSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    inviteCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const Household = mongoose.model('Household', householdSchema);

export default Household;