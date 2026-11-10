import Listing from '../models/Listing.js';
import Request from '../models/Request.js';
import Notification from '../models/Notification.js';

export async function createRequest(req, res, next) {
  try {
    const { listingId, kind, message = '', offeredPrice } = req.body;
    if (!listingId || !['purchase', 'exchange', 'rental', 'loan'].includes(kind)) return res.status(400).json({ message: 'Choose a listing and valid request type.' });
    const listing = await Listing.findOne({ _id: listingId, status: 'available' });
    if (!listing) return res.status(404).json({ message: 'This listing is no longer available.' });
    if (String(listing.owner) === String(req.user._id)) return res.status(400).json({ message: 'You cannot request your own listing.' });
    const existing = await Request.findOne({ listing: listing._id, requester: req.user._id, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'You already have a pending request for this listing.' });
    const request = await Request.create({
      listing: listing._id, requester: req.user._id, owner: listing.owner, kind,
      message: String(message).slice(0, 1000),
      offeredPrice: offeredPrice === '' || offeredPrice === undefined ? null : Number(offeredPrice)
    });
    await Notification.create({
      user: listing.owner,
      title: 'New request received',
      message: `${req.user.name} sent a ${kind} request for "${listing.title}".`,
      link: '/requests',
      type: 'request_received'
    }).catch(() => {});
    res.status(201).json({ request });
  } catch (error) { next(error); }
}

export async function mine(req, res, next) {
  try {
    const items = await Request.find({ requester: req.user._id }).populate('listing').populate('owner', 'name college').sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) { next(error); }
}
export async function received(req, res, next) {
  try {
    const items = await Request.find({ owner: req.user._id }).populate('listing').populate('requester', 'name college').sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) { next(error); }
}
export async function updateRequest(req, res, next) {
  try {
    const request = await Request.findById(req.params.id).populate('listing');
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (String(request.owner._id || request.owner) !== String(req.user._id)) return res.status(403).json({ message: 'Only the listing owner can respond.' });
    if (!['accepted', 'rejected', 'completed'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status.' });
    if (request.status !== 'pending' && !(request.status === 'accepted' && req.body.status === 'completed')) {
      return res.status(400).json({ message: 'This request can no longer be updated.' });
    }
    request.status = req.body.status;
    await request.save();
    if (request.status === 'accepted' && request.listing && ['sell', 'exchange'].includes(request.listing.listingType)) {
      request.listing.status = 'reserved';
      await request.listing.save();
    }
    if (request.status === 'completed' && request.listing) {
      request.listing.status = 'completed';
      await request.listing.save();
    }
    await Notification.create({
      user: request.requester,
      title: `Request ${req.body.status}`,
      message: `Your ${request.kind} request for "${request.listing?.title || 'item'}" was marked as ${req.body.status}.`,
      link: '/requests',
      type: `request_${req.body.status}`
    }).catch(() => {});
    res.json({ request });
  } catch (error) { next(error); }
}
