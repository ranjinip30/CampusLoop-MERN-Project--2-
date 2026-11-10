import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
  category: { type: String, required: true, enum: ['Books', 'Electronics', 'Lab Equipment', 'Clothing', 'Furniture', 'Sports', 'Other'] },
  listingType: { type: String, required: true, enum: ['sell', 'exchange', 'rent', 'lend'], default: 'sell' },
  price: { type: Number, min: 0, default: 0 },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair'], default: 'Good' },
  imageUrl: { type: String, trim: true, default: '' },
  campus: { type: String, required: true, trim: true, maxlength: 120 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'reserved', 'completed', 'hidden'], default: 'available' }
}, { timestamps: true });

listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ campus: 1, category: 1, status: 1, createdAt: -1 });

export default mongoose.model('Listing', listingSchema);
