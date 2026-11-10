import Listing from '../models/Listing.js';

const fields = ['title', 'description', 'category', 'listingType', 'price', 'condition', 'imageUrl', 'campus'];
function safeBody(body) {
  const result = {};
  for (const field of fields) if (body[field] !== undefined) result[field] = body[field];
  return result;
}

export async function listListings(req, res, next) {
  try {
    const { q, category, type, campus, sort = 'newest', page = 1, limit = 12 } = req.query;
    const filter = { status: 'available' };
    if (category) filter.category = category;
    if (type) filter.listingType = type;
    if (campus) filter.campus = { $regex: String(campus).slice(0, 80), $options: 'i' };
    if (q) {
      const cleanQ = String(q).trim().slice(0, 100);
      if (cleanQ) {
        const regex = new RegExp(cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { title: regex },
          { description: regex },
          { category: regex }
        ];
      }
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1, createdAt: -1 };
    else if (sort === 'price_desc') sortOption = { price: -1, createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(30, Math.max(1, Number.parseInt(limit, 10) || 12));
    const [items, total] = await Promise.all([
      Listing.find(filter).populate('owner', 'name college').sort(sortOption).skip((pageNum - 1) * pageSize).limit(pageSize),
      Listing.countDocuments(filter)
    ]);
    res.json({ items, total, page: pageNum, pages: Math.ceil(total / pageSize) });
  } catch (error) { next(error); }
}

export async function getListing(req, res, next) {
  try {
    const item = await Listing.findById(req.params.id).populate('owner', 'name college');
    if (!item || (item.status === 'hidden' && req.user?.role !== 'admin')) return res.status(404).json({ message: 'Listing not found.' });
    res.json({ item });
  } catch (error) { next(error); }
}

export async function createListing(req, res, next) {
  try {
    const data = safeBody(req.body);
    data.owner = req.user._id;
    if (!data.campus) data.campus = req.user.college;
    const item = await Listing.create(data);
    res.status(201).json({ item });
  } catch (error) { next(error); }
}

export async function updateListing(req, res, next) {
  try {
    const item = await Listing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Listing not found.' });
    if (String(item.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only edit your own listing.' });
    Object.assign(item, safeBody(req.body));
    await item.save();
    res.json({ item });
  } catch (error) { next(error); }
}

export async function deleteListing(req, res, next) {
  try {
    const item = await Listing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Listing not found.' });
    if (String(item.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only delete your own listing.' });
    item.status = 'hidden';
    await item.save();
    res.json({ message: 'Listing removed from the marketplace.' });
  } catch (error) { next(error); }
}

export async function myListings(req, res, next) {
  try {
    const items = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) { next(error); }
}
