import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['purchase', 'exchange', 'rental', 'loan'], required: true },
  message: { type: String, trim: true, maxlength: 1000, default: '' },
  offeredPrice: { type: Number, min: 0, default: null },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'pending' }
}, { timestamps: true });

requestSchema.index({ listing: 1, requester: 1, status: 1 });
export default mongoose.model('Request', requestSchema);
