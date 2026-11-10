import Listing from '../models/Listing.js';
import Report from '../models/Report.js';

export async function createReport(req, res, next) {
  try {
    const { listingId, reason, details = '' } = req.body;
    if (!listingId || !['Misleading listing', 'Prohibited item', 'Spam', 'Suspicious user', 'Other'].includes(reason)) {
      return res.status(400).json({ message: 'Select a listing and valid report reason.' });
    }
    if (!await Listing.findById(listingId)) return res.status(404).json({ message: 'Listing not found.' });
    const report = await Report.create({ listing: listingId, reporter: req.user._id, reason, details: String(details).slice(0, 1000) });
    res.status(201).json({ report, message: 'Report submitted for review.' });
  } catch (error) { next(error); }
}
