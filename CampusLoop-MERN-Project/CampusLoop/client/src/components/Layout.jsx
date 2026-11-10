import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Bell, LogIn, LogOut, UserRound, CheckCheck } from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';
import api from '../api.js';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  function signOut() { logout(); navigate('/'); }

  async function loadNotifications() {
    if (!user) { setNotifications([]); setUnreadCount(0); return; }
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // ignore silently if offline or token expired
    }
  }

  useEffect(() => {
    loadNotifications();
    if (!user) return;
    const timer = setInterval(loadNotifications, 25000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleNotificationClick(notif) {
    if (!notif.read) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setUnreadCount(c => Math.max(0, c - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch {}
    }
    setShowNotifs(false);
    if (notif.link) navigate(notif.link);
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  }

  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/"><span className="brand-icon"><ShoppingBag size={21}/></span><span>Campus<span className="brand-accent">Loop</span><small>your campus, connected</small></span></Link>
      <nav className="nav-links">
        <NavLink to="/" end>Explore</NavLink>
        {user && <NavLink to="/my-listings">My listings</NavLink>}
        {user && <NavLink to="/saved">Saved</NavLink>}
        {user && <NavLink to="/requests">Requests</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-actions">
        {user ? <>
          <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              style={{ position: 'relative' }}
              title="Notifications"
              onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) loadNotifications(); }}
            >
              <Bell size={17}/>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px', background: 'var(--purple)',
                  color: 'white', fontSize: '9px', fontWeight: '800', borderRadius: '10px',
                  padding: '1px 5px', minWidth: '15px', height: '15px', display: 'grid', placeItems: 'center'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div style={{
                position: 'absolute', right: 0, top: '42px', width: '320px', background: 'white',
                border: '1px solid var(--line)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                zIndex: 100, overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
                  <strong style={{ fontSize: '13px' }}>Notifications</strong>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="btn btn-ghost btn-small" style={{ padding: '2px 6px', fontSize: '10px' }}>
                      <CheckCheck size={12}/> Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '330px', overflowY: 'auto' }}>
                  {!notifications.length ? (
                    <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '11px 15px',
                          borderBottom: '1px solid var(--line)',
                          cursor: 'pointer',
                          background: n.read ? 'white' : '#f5f2ff',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>{n.title}</strong>
                          <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#686a7c', lineHeight: 1.4 }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Link className="user-chip" to="/profile"><UserRound size={16}/><span>{user.name.split(' ')[0]}</span></Link>
          <button className="btn btn-ghost btn-small" onClick={signOut}><LogOut size={15}/> Sign out</button>
        </> : <Link className="btn btn-primary btn-small" to="/login"><LogIn size={15}/> Sign in</Link>}
      </div>
    </header>
    <main>{children}</main>
    <footer className="footer"><div className="footer-brand">CampusLoop <span>· Made for campus life</span></div><div>Buy smarter. Share more. Waste less.</div></footer>
  </div>;
}
