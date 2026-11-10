import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  college: { type: String, required: true, trim: true, maxlength: 120 },
  course: { type: String, trim: true, maxlength: 120, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
