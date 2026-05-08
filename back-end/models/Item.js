import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false 
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
  },
});

const Item = mongoose.model('Item', itemSchema);

export default Item;