import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, enum: ['Misleading listing', 'Prohibited item', 'Spam', 'Suspicious user', 'Other'] },
  details: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
