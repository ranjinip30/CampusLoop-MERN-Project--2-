import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck, CalendarDays, Flag, Send, Bookmark } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [kind, setKind] = useState('purchase');
  const [message, setMessage] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get(`/listings/${id}`).then(r => setItem(r.data.item)).catch(e => setError(e.response?.data?.message || 'Listing not found.')); }, [id]);
  if (!item) return <div className="page-container"><Link to="/" className="back-link"><ArrowLeft size={16}/> Back to marketplace</Link>{error ? <div className="notice error-notice">{error}</div> : <div className="page-loading">Loading listing…</div>}</div>;
  const own = user && user.id === item.owner?._id;
  async function requestItem(e) {
    e.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      await api.post('/requests', { listingId: item._id, kind, message, offeredPrice: offeredPrice || undefined });
      setSuccess('Your request has been sent to the listing owner.');
      setMessage(''); setOfferedPrice('');
    } catch (e) { setError(e.response?.data?.message || 'Could not send request.'); }
    finally { setBusy(false); }
  }
  async function report() {
    if (!user) return navigate('/login');
    const reason = window.prompt('Reason: Misleading listing, Prohibited item, Spam, Suspicious user, or Other');
    if (!reason) return;
    const details = window.prompt('Optional details') || '';
    try { await api.post('/reports', { listingId: item._id, reason, details }); setSuccess('Thanks. Your report has been submitted.'); }
    catch (e) { setError(e.response?.data?.message || 'Could not submit report.'); }
  }
  return <div className="page-container">
    <Link to="/" className="back-link"><ArrowLeft size={16}/> Back to marketplace</Link>
    <div className="detail-grid">
      <div className="detail-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.title}/> : <div className="detail-placeholder"><span>{item.category}</span><div>Give it<br/>another loop.</div></div>}</div>
      <div className="detail-content">
        <div className="listing-meta"><span>{item.category}</span><span className="condition">{item.condition}</span></div>
        <h1>{item.title}</h1><div className="detail-price">{Number(item.price) ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Free / discuss'} {item.listingType === 'rent' && <small>per rental</small>}</div>
        <p className="detail-description">{item.description}</p>
        <div className="detail-facts"><span><MapPin size={16}/>{item.campus}</span><span><CalendarDays size={16}/>Listed {new Date(item.createdAt).toLocaleDateString()}</span><span><ShieldCheck size={16}/>{item.owner?.name || 'CampusLoop student'}</span></div>
        <div className="owner-card"><div className="avatar">{(item.owner?.name || 'S').slice(0,1).toUpperCase()}</div><div><strong>{item.owner?.name || 'Student seller'}</strong><span>{item.owner?.college || item.campus}</span></div><span className="verified-label"><ShieldCheck size={14}/> Member</span></div>
        {success && <div className="notice success-notice">{success}</div>}{error && <div className="notice error-notice">{error}</div>}
        {!own && user && item.status === 'available' && <form className="request-box" onSubmit={requestItem}><h3>Interested? Start a request.</h3><label>Request type<select value={kind} onChange={e => setKind(e.target.value)}><option value="purchase">Buy this item</option><option value="exchange">Propose an exchange</option><option value="rental">Rent this item</option><option value="loan">Borrow / lend</option></select></label><label>Your message<textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Hi! Is this still available?" rows="3" maxLength="1000"/></label><label>Offer price in ₹ <span className="optional">(optional)</span><input type="number" min="0" value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} placeholder="Your offer"/></label><button className="btn btn-primary full-btn" disabled={busy}>{busy ? 'Sending…' : 'Send request'} <Send size={16}/></button></form>}
        {!user && <div className="request-box"><h3>Interested in this find?</h3><p>Sign in to send a request to the student who listed it.</p><Link to="/login" className="btn btn-primary full-btn">Sign in to continue</Link></div>}
        {own && <div className="notice">This is your listing. Manage it from <Link to="/my-listings">My listings</Link>.</div>}
        <button className="report-link" onClick={report}><Flag size={15}/> Report this listing</button>
      </div>
    </div>
  </div>;
}
