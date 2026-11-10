import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Pencil, Trash2, ArrowUpRight, Inbox, Check, X, Clock3, LayoutDashboard, Users, Flag, Upload, Bookmark } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';

export function SavedListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/users/saved');
      setItems(data.items);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load saved listings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUnsave(id) {
    try {
      await api.delete(`/users/saved/${id}`);
      setItems(old => old.filter(x => x._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Could not remove saved listing.');
    }
  }

  return (
    <div className="page-container">
      <div className="page-title-row">
        <div>
          <div className="section-kicker">SAVED ITEMS</div>
          <h1>My Saved Listings</h1>
          <p>Items you've bookmarked to check out later.</p>
        </div>
        <Link className="btn btn-primary" to="/"><Package size={17}/> Explore marketplace</Link>
      </div>
      {error && <div className="notice error-notice">{error}</div>}
      {loading ? (
        <div className="loading-grid">{[1,2,3,4].map(n => <div className="skeleton" key={n}/>)}</div>
      ) : items.length ? (
        <div className="listing-grid">
          {items.map(item => (
            <ListingCard key={item._id} item={item} user={user} saved={true} onSave={handleUnsave}/>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><Bookmark size={30}/></div>
          <h3>No saved items yet</h3>
          <p>Click the bookmark icon on any item while exploring to save it for later.</p>
          <Link className="btn btn-primary" to="/"><Package size={16}/> Start exploring</Link>
        </div>
      )}
    </div>
  );
}

export function MyListings() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  async function load() { try { setItems((await api.get('/listings/mine')).data.items); } catch(e) { setError(e.response?.data?.message || 'Could not load listings.'); } }
  useEffect(() => { load(); }, []);
  async function remove(id) { if (!confirm('Remove this listing from the marketplace?')) return; try { await api.delete(`/listings/${id}`); load(); } catch(e) { alert(e.response?.data?.message || 'Could not remove listing.'); } }
  return <div className="page-container"><div className="page-title-row"><div><div className="section-kicker">YOUR MARKETPLACE</div><h1>My listings</h1><p>Keep your listings up to date.</p></div><Link className="btn btn-primary" to="/create"><Plus size={17}/> List an item</Link></div>{error && <div className="notice error-notice">{error}</div>}{items.length ? <div className="listing-grid">{items.map(item => <article className="listing-card" key={item._id}><div className="listing-image-wrap">{item.imageUrl ? <img className="listing-image" src={item.imageUrl} alt={item.title}/> : <div className="image-placeholder"><Package size={34}/><span>{item.category}</span></div>}<span className={`type-pill status-${item.status}`}>{item.status}</span></div><div className="listing-body"><div className="listing-meta"><span>{item.category}</span><span>{item.listingType}</span></div><Link className="listing-title" to={`/listing/${item._id}`}>{item.title}</Link><div className="listing-bottom"><div className="price">{Number(item.price) ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Free / discuss'}</div><div className="card-actions"><Link className="icon-btn" title="Edit listing" to={`/edit/${item._id}`}><Pencil size={16}/></Link><button className="icon-btn danger-icon" title="Remove listing" onClick={() => remove(item._id)}><Trash2 size={16}/></button></div></div></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Package size={32}/></div><h3>Your first listing starts a loop.</h3><p>List something you no longer need and help another student find it.</p><Link className="btn btn-primary" to="/create"><Plus size={17}/> Create a listing</Link></div>}</div>;
}

export function ListingForm({ edit = false }) {
  const { id } = useParamsSafe();
  const navigate = useNavigateSafe();
  const [form, setForm] = useState({ title:'', description:'', category:'Books', listingType:'sell', price:'', condition:'Good', imageUrl:'', campus:'' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(edit);
  const { user } = useAuth();
  useEffect(() => {
    if (!edit || !id) return;
    api.get(`/listings/${id}`).then(({data}) => {
      if (data.item.owner?._id !== user?.id && user?.role !== 'admin') { setError('You can only edit your own listing.'); return; }
      setForm({ title:data.item.title, description:data.item.description, category:data.item.category, listingType:data.item.listingType, price:String(data.item.price ?? ''), condition:data.item.condition, imageUrl:data.item.imageUrl || '', campus:data.item.campus });
    }).catch(e => setError(e.response?.data?.message || 'Could not load listing.')).finally(() => setLoading(false));
  }, [edit, id, user]);
  function change(e) { setForm({...form, [e.target.name]:e.target.value}); }
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setError('');
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed. Max 5MB allowed.');
    } finally {
      setUploading(false);
    }
  }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const payload = {...form, price: Number(form.price || 0)};
      if (edit) await api.patch(`/listings/${id}`, payload); else await api.post('/listings', payload);
      navigate('/my-listings');
    } catch(e) { setError(e.response?.data?.message || 'Could not save listing.'); }
    finally { setBusy(false); }
  }
  if (loading) return <div className="page-container">Loading listing…</div>;
  return <div className="page-container narrow-container"><Link to="/my-listings" className="back-link">← Back to my listings</Link><div className="section-kicker">{edit ? 'UPDATE YOUR ITEM' : 'PASS IT ON'}</div><h1>{edit ? 'Edit your listing.' : 'List something good.'}</h1><p className="form-intro">Give your item a second life with someone on campus.</p><form className="listing-form" onSubmit={submit}>
    <label>Item title<input name="title" value={form.title} onChange={change} placeholder="e.g. Engineering Mathematics textbook" minLength="3" maxLength="120" required/></label>
    <div className="form-two"><label>Category<select name="category" value={form.category} onChange={change}>{['Books','Electronics','Lab Equipment','Clothing','Furniture','Sports','Other'].map(x=><option key={x}>{x}</option>)}</select></label><label>Listing type<select name="listingType" value={form.listingType} onChange={change}>{[['sell','For sale'],['exchange','Exchange'],['rent','Rent'],['lend','Lend']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>
    <div className="form-two"><label>Price (₹)<input type="number" min="0" name="price" value={form.price} onChange={change} placeholder="0 for free / discuss"/></label><label>Condition<select name="condition" value={form.condition} onChange={change}>{['New','Like New','Good','Fair'].map(x=><option key={x}>{x}</option>)}</select></label></div>
    <label>Description<textarea name="description" value={form.description} onChange={change} placeholder="Describe the condition, edition, size, or anything a student should know…" minLength="10" maxLength="3000" rows="5" required/></label>
    <div style={{ marginBottom: '19px' }}>
      <label style={{ marginBottom: '6px' }}>Listing Photo</label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
        <label className="btn btn-ghost btn-small" style={{ margin: 0, cursor: uploading ? 'wait' : 'pointer' }}>
          <Upload size={15}/> {uploading ? 'Uploading…' : 'Upload photo from device'}
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading}/>
        </label>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>or paste image URL below</span>
      </div>
      <input type="url" name="imageUrl" value={form.imageUrl} onChange={change} placeholder="https://example.com/item-photo.jpg or uploaded automatically" style={{ marginTop: '8px' }}/>
      {form.imageUrl && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={form.imageUrl} alt="Listing preview" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}/>
          <button type="button" className="btn btn-ghost btn-small danger-icon" style={{ padding: '6px 10px', fontSize: '11px' }} onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}>Remove photo</button>
        </div>
      )}
    </div>
    <label>College / campus<input name="campus" value={form.campus} onChange={change} placeholder={user?.college || 'Your campus'} maxLength="120"/></label>
    {error && <div className="notice error-notice">{error}</div>}
    <button className="btn btn-primary full-btn" disabled={busy || uploading}>{busy ? 'Saving…' : edit ? 'Save changes' : 'Publish listing'} <ArrowUpRight size={17}/></button>
  </form></div>;
}

// Tiny hooks keep the form component's route dependencies explicit.
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
function useParamsSafe() { return useParams(); }
function useNavigateSafe() { return useNavigate(); }

export function RequestsPage() {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [tab, setTab] = useState('received');
  const [error, setError] = useState('');
  async function load() {
    try {
      const [a,b] = await Promise.all([api.get('/requests/mine'), api.get('/requests/received')]);
      setSent(a.data.items); setReceived(b.data.items);
    } catch(e) { setError(e.response?.data?.message || 'Could not load requests.'); }
  }
  useEffect(() => { load(); }, []);
  async function update(id, status) {
    try { await api.patch(`/requests/${id}`, {status}); load(); }
    catch(e) { alert(e.response?.data?.message || 'Could not update request.'); }
  }
  const list = tab === 'received' ? received : sent;
  return <div className="page-container"><div className="section-kicker">YOUR CAMPUS CONNECTIONS</div><h1>Requests & exchanges</h1><p className="form-intro">Keep track of items you want and people interested in yours.</p>
    <div className="tabs"><button className={tab==='received'?'active':''} onClick={()=>setTab('received')}>Received ({received.length})</button><button className={tab==='sent'?'active':''} onClick={()=>setTab('sent')}>Sent ({sent.length})</button></div>
    {error && <div className="notice error-notice">{error}</div>}
    {!list.length ? <div className="empty-state compact-empty"><div className="empty-icon"><Inbox size={30}/></div><h3>No {tab} requests yet</h3><p>When someone requests an item, it will appear here.</p></div> :
    <div className="request-list">{list.map(r=><article className="request-card" key={r._id}><div className="request-card-main"><div className="request-kind">{r.kind}</div><h3>{r.listing?.title || 'Listing no longer available'}</h3><p>{tab==='received' ? `From ${r.requester?.name || 'student'}` : `To ${r.owner?.name || 'student'}`}</p>{r.message && <blockquote>{r.message}</blockquote>}{r.offeredPrice != null && <div className="offer-price">Offer: ₹{Number(r.offeredPrice).toLocaleString('en-IN')}</div>}<div className="request-date"><Clock3 size={14}/> {new Date(r.createdAt).toLocaleString()}</div></div><div className="request-side"><span className={`request-status status-${r.status}`}>{r.status}</span>{tab==='received' && r.status==='pending' && <div className="request-actions"><button className="btn btn-primary btn-small" onClick={()=>update(r._id,'accepted')}><Check size={15}/> Accept</button><button className="btn btn-ghost btn-small" onClick={()=>update(r._id,'rejected')}><X size={15}/> Decline</button></div>}{tab==='received' && r.status==='accepted' && <button className="btn btn-primary btn-small" onClick={()=>update(r._id,'completed')}>Mark complete</button>}</div></article>)}</div>}
  </div>;
}

export function ProfilePage() {
  const { user } = useAuth();
  return <div className="page-container narrow-container"><div className="section-kicker">YOUR ACCOUNT</div><h1>Your campus profile.</h1><div className="profile-card"><div className="profile-avatar">{user?.name?.slice(0,1).toUpperCase()}</div><h2>{user?.name}</h2><p>{user?.email}</p><div className="profile-details"><div><span>College</span><strong>{user?.college}</strong></div><div><span>Course</span><strong>{user?.course || 'Not specified'}</strong></div><div><span>Account type</span><strong>{user?.role === 'admin' ? 'Administrator' : 'Student member'}</strong></div></div><Link className="btn btn-primary" to="/my-listings">Manage my listings <ArrowUpRight size={16}/></Link></div></div>;
}

export function AdminPage() {
  const [summary,setSummary] = useState(null);
  const [items,setItems] = useState([]);
  const [reports,setReports] = useState([]);
  const [error,setError] = useState('');
  async function load() { try { const [s,l,r] = await Promise.all([api.get('/admin/summary'),api.get('/admin/listings'),api.get('/admin/reports')]); setSummary(s.data); setItems(l.data.items); setReports(r.data.items); } catch(e) { setError(e.response?.data?.message || 'Admin access required.'); } }
  useEffect(()=>{load();},[]);
  async function setStatus(id,status) { try { await api.patch(`/admin/listings/${id}/status`,{status}); load(); } catch(e) { alert(e.response?.data?.message || 'Update failed.'); } }
  async function setReport(id,status) { try { await api.patch(`/admin/reports/${id}`,{status}); load(); } catch(e) { alert(e.response?.data?.message || 'Update failed.'); } }
  return <div className="page-container"><div className="section-kicker">CAMPUSLOOP CONTROL ROOM</div><h1>Community overview.</h1><p className="form-intro">Manage listings and review community reports.</p>{error && <div className="notice error-notice">{error}</div>}
    {summary && <div className="stats-grid">{[['Students & admins',summary.users,Users],['All listings',summary.listings,Package],['Available',summary.availableListings,LayoutDashboard],['Open reports',summary.openReports,Flag]].map(([label,value,Icon])=><div className="stat-card" key={label}><span><Icon size={18}/>{label}</span><strong>{value}</strong></div>)}</div>}
    <div className="admin-section"><h2>Listings moderation</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Listing</th><th>Owner</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map(x=><tr key={x._id}><td>{x.title}<small>{x.category}</small></td><td>{x.owner?.name || 'Unknown'}</td><td><span className={`request-status status-${x.status}`}>{x.status}</span></td><td><select value={x.status} onChange={e=>setStatus(x._id,e.target.value)}><option value="available">Available</option><option value="hidden">Hide</option><option value="completed">Completed</option></select></td></tr>)}</tbody></table></div></div>
    <div className="admin-section"><h2>Community reports</h2>{!reports.length ? <p className="muted">No reports have been submitted.</p> : <div className="request-list">{reports.map(r=><article className="request-card" key={r._id}><div className="request-card-main"><div className="request-kind">{r.reason}</div><h3>{r.listing?.title || 'Listing removed'}</h3><p>Reported by {r.reporter?.name || 'member'} · {r.status}</p>{r.details && <p>{r.details}</p>}</div><div className="request-side"><button className="btn btn-primary btn-small" onClick={()=>setReport(r._id,'reviewed')}>Reviewed</button><button className="btn btn-ghost btn-small" onClick={()=>setReport(r._id,'dismissed')}>Dismiss</button></div></article>)}</div>}</div>
  </div>;
}
