import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Fridge', 'Freezer', 'Pantry'],
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  inShoppingList: {
    type: Boolean,
    default: false,
  }
});

const Item = mongoose.model('Item', itemSchema);

export default Item;