import User from '../models/User.js';
import Listing from '../models/Listing.js';

export async function getSaved(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'savedListings', populate: { path: 'owner', select: 'name college' } });
    res.json({ items: (user?.savedListings || []).filter(x => x.status === 'available') });
  } catch (error) { next(error); }
}

export async function saveListing(req, res, next) {
  try {
    const listing = await Listing.findOne({ _id: req.params.listingId, status: 'available' });
    if (!listing) return res.status(404).json({ message: 'Available listing not found.' });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedListings: listing._id } });
    res.json({ message: 'Listing saved.' });
  } catch (error) { next(error); }
}

export async function unsaveListing(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedListings: req.params.listingId } });
    res.json({ message: 'Listing removed from saved items.' });
  } catch (error) { next(error); }
}
