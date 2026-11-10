import { Link } from 'react-router-dom';
import { Bookmark, MapPin, ArrowUpRight, Tag } from 'lucide-react';

const fallback = {
  Books: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
  'Lab Equipment': 'https://images.unsplash.com/photo-1581093458791-9d42e3c4e5a0?w=800',
  Clothing: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  Furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
  Other: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800'
};

export default function ListingCard({ item, saved, onSave, user }) {
  const price = Number(item.price || 0);
  return <article className="listing-card">
    <Link to={`/listing/${item._id}`} className="listing-image-wrap">
      {item.imageUrl ? <img className="listing-image" src={item.imageUrl} alt={item.title} onError={e => { e.currentTarget.style.display = 'none'; }} /> : <div className={`image-placeholder placeholder-${(item.category || 'other').toLowerCase().replaceAll(' ', '-')}`}><Tag size={34}/><span>{item.category}</span></div>}
      <span className="type-pill">{item.listingType}</span>
    </Link>
    <div className="listing-body">
      <div className="listing-meta"><span>{item.category}</span><span className="condition">{item.condition}</span></div>
      <Link className="listing-title" to={`/listing/${item._id}`}>{item.title}</Link>
      <p className="listing-description">{item.description}</p>
      <div className="listing-location"><MapPin size={14}/>{item.campus}</div>
      <div className="listing-bottom">
        <div className="price">{price === 0 ? 'Free / discuss' : `₹${price.toLocaleString('en-IN')}`}<small>{item.listingType === 'rent' ? ' / rental' : ''}</small></div>
        <div className="card-actions">
          {user && user.id !== item.owner?._id && <button title={saved ? 'Remove saved listing' : 'Save listing'} className={`icon-btn ${saved ? 'is-saved' : ''}`} onClick={() => onSave?.(item._id, saved)}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'}/></button>}
          <Link className="open-link" to={`/listing/${item._id}`} aria-label="View listing"><ArrowUpRight size={18}/></Link>
        </div>
      </div>
    </div>
  </article>;
}
