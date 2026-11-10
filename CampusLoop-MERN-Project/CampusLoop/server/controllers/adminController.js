import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Report from '../models/Report.js';

export async function summary(_req, res, next) {
  try {
    const [users, listings, available, reports] = await Promise.all([
      User.countDocuments(), Listing.countDocuments(), Listing.countDocuments({ status: 'available' }), Report.countDocuments({ status: 'open' })
    ]);
    res.json({ users, listings, availableListings: available, openReports: reports });
  } catch (error) { next(error); }
}
export async function allListings(_req, res, next) {
  try {
    const items = await Listing.find().populate('owner', 'name email college').sort({ createdAt: -1 }).limit(200);
    res.json({ items });
  } catch (error) { next(error); }
}
export async function setListingStatus(req, res, next) {
  try {
    if (!['available', 'hidden', 'completed'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid listing status.' });
    const item = await Listing.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Listing not found.' });
    res.json({ item });
  } catch (error) { next(error); }
}
export async function allReports(_req, res, next) {
  try {
    const items = await Report.find().populate('listing').populate('reporter', 'name email').sort({ createdAt: -1 }).limit(200);
    res.json({ items });
  } catch (error) { next(error); }
}
export async function updateReport(req, res, next) {
  try {
    const status = req.body.status;
    if (!['reviewed', 'dismissed'].includes(status)) return res.status(400).json({ message: 'Invalid report status.' });
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json({ report });
  } catch (error) { next(error); }
}
