import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  link: { type: String, default: '/requests', trim: true },
  read: { type: Boolean, default: false, index: true },
  type: {
    type: String,
    enum: ['request_received', 'request_accepted', 'request_rejected', 'request_completed', 'listing_update', 'general'],
    default: 'general'
  }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);

