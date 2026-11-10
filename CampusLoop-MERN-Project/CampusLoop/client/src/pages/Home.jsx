import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Laptop, FlaskConical, Shirt, Armchair, Trophy, Package, Plus, ShieldCheck, Recycle, Users } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../state/AuthContext.jsx';
import ListingCard from '../components/ListingCard.jsx';

const categories = [
  { name: 'All items', icon: Package },
  { name: 'Books', icon: BookOpen },
  { name: 'Electronics', icon: Laptop },
  { name: 'Lab Equipment', icon: FlaskConical },
  { name: 'Clothing', icon: Shirt },
  { name: 'Furniture', icon: Armchair },
  { name: 'Sports', icon: Trophy }
];

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [category, setCategory] = useState('All items');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(queryToUse = appliedQ) {
    setLoading(true); setError('');
    try {
      const params = {};
      if (queryToUse.trim()) params.q = queryToUse.trim();
      if (category !== 'All items') params.category = category;
      if (type) params.type = type;
      if (sort) params.sort = sort;
      const { data } = await api.get('/listings', { params });
      setItems(data.items);
    } catch (e) { setError(e.response?.data?.message || 'Could not load listings. Check that the backend is running.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(appliedQ); }, [category, type, sort, appliedQ]);
  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    api.get('/users/saved').then(r => setSavedIds(r.data.items.map(x => x._id))).catch(() => {});
  }, [user]);
  async function save(id, wasSaved) {
    try {
      if (wasSaved) { await api.delete(`/users/saved/${id}`); setSavedIds(old => old.filter(x => x !== id)); }
      else { await api.post(`/users/saved/${id}`); setSavedIds(old => [...old, id]); }
    } catch (e) { alert(e.response?.data?.message || 'Please sign in to save listings.'); }
  }
  function submitSearch(e) {
    e.preventDefault();
    setAppliedQ(q.trim());
    setTimeout(() => {
      document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }
  function handleSearchChange(e) {
    const val = e.target.value;
    setQ(val);
    if (!val.trim() && appliedQ) {
      setAppliedQ('');
    }
  }
  return <div>
    <section className="hero">
      <div className="hero-glow glow-one"/><div className="hero-glow glow-two"/>
      <div className="hero-content">
        <div className="eyebrow"><span className="eyebrow-dot"/> THE STUDENT-POWERED MARKETPLACE</div>
        <h1>Good finds.<br/><span>Great campus</span> stories.</h1>
        <p className="hero-copy">Pass it on, find what you need, and make student life a little more affordable. Your campus community starts here.</p>
        <form className="hero-search" onSubmit={submitSearch}><Search size={19}/><input value={q} onChange={handleSearchChange} placeholder="Search books, calculators, lab coats..."/><button type="submit" aria-label="Search"><ArrowRight size={19}/></button></form>
        <div className="hero-note"><ShieldCheck size={16}/> Built for students, powered by community</div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
        <div className="floating-card card-book"><div className="mini-art book-art"><BookOpen size={38}/></div><div><strong>Semester savers</strong><span>Books worth passing on</span></div><span className="tiny-badge">−60%</span></div>
        <div className="floating-card card-laptop"><div className="mini-art laptop-art"><Laptop size={39}/></div><div><strong>Tech finds</strong><span>Good gear, better prices</span></div></div>
        <div className="floating-card card-note"><div className="note-emoji">♻</div><div><strong>Give it a second life</strong><span>Buy · Sell · Exchange</span></div></div>
        <div className="art-center"><div className="center-ring"><Package size={65}/></div><span>LOOP IT FORWARD</span></div>
      </div>
      <div className="hero-bottom"><span>MADE FOR CAMPUS LIFE</span><div><span className="hero-dot"/> Affordable finds <span className="hero-dot"/> Less waste <span className="hero-dot"/> More community</div></div>
    </section>

    <section className="benefits-strip">
      <div><span className="benefit-icon"><Users size={19}/></span><span><strong>Student community</strong><small>Made for campus connections</small></span></div>
      <div><span className="benefit-icon"><Recycle size={19}/></span><span><strong>Give items a second life</strong><small>Reuse more, waste less</small></span></div>
      <div><span className="benefit-icon"><ShieldCheck size={19}/></span><span><strong>Community reporting</strong><small>Help keep listings responsible</small></span></div>
    </section>

    <section className="market-section" id="marketplace">
      <div className="section-heading"><div><div className="section-kicker">THE MARKETPLACE</div><h2>Find your next <em>favourite.</em></h2><p>Good stuff from students, for students.</p></div>{user && <Link to="/create" className="btn btn-primary"><Plus size={17}/> List an item</Link>}</div>
      <div className="category-row">{categories.map(({ name, icon: Icon }) => <button key={name} onClick={() => setCategory(name)} className={`category-chip ${category === name ? 'active' : ''}`}><Icon size={17}/>{name}</button>)}</div>
      <div className="filter-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span>{loading ? 'Finding good stuff…' : `${items.length} ${items.length === 1 ? 'item' : 'items'} to explore`}</span>
          {appliedQ && <button className="btn btn-ghost btn-small" style={{ padding: '3px 9px', fontSize: '11px' }} onClick={() => { setQ(''); setAppliedQ(''); }}>Clear "{appliedQ}" ✕</button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--line)', borderRadius: '8px', padding: '5px 10px', gap: '6px' }}>
            <Search size={14} color="#8d89a8"/>
            <input
              type="text"
              value={q}
              onChange={handleSearchChange}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setAppliedQ(q.trim()); } }}
              placeholder="Search listings..."
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', width: '130px' }}
            />
          </div>
          <select value={type} onChange={e => setType(e.target.value)} aria-label="Filter by listing type">
            <option value="">All listing types</option>
            <option value="sell">For sale</option>
            <option value="exchange">Exchange</option>
            <option value="rent">Rent</option>
            <option value="lend">Lend</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort listings">
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
      {error && <div className="notice error-notice">{error}</div>}
      {loading ? <div className="loading-grid">{[1,2,3,4].map(n => <div className="skeleton" key={n}/>)}</div> :
        items.length ? <div className="listing-grid">{items.map(item => <ListingCard key={item._id} item={item} user={user} saved={savedIds.includes(item._id)} onSave={save}/>)}</div> :
        <div className="empty-state">
          <div className="empty-icon"><Package size={32}/></div>
          <h3>{appliedQ ? `No results for "${appliedQ}"` : 'No listings just yet'}</h3>
          <p>{appliedQ ? 'Try checking for typos or searching a broader term.' : 'Try another category or search. Your next great find might be around the corner.'}</p>
          {appliedQ ? <button className="btn btn-primary" onClick={() => { setQ(''); setAppliedQ(''); }}>Clear search</button> : user && <Link to="/create" className="btn btn-primary">Be the first to list <ArrowRight size={16}/></Link>}
        </div>}
    </section>
    <section className="bottom-cta"><div><span className="section-kicker">HAVE SOMETHING TO PASS ON?</span><h2>Someone on campus<br/>might need <em>exactly that.</em></h2><p>Turn your unused things into someone else's next favourite.</p></div><Link to={user ? '/create' : '/register'} className="btn btn-light">{user ? 'List your first item' : 'Join CampusLoop'} <ArrowRight size={17}/></Link></section>
  </div>;
}
