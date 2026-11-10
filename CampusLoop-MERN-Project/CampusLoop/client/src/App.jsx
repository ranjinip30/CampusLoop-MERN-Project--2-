import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import ListingDetails from './pages/ListingDetails.jsx';
import { AdminPage, ListingForm, MyListings, ProfilePage, RequestsPage, SavedListings } from './pages/Dashboard.jsx';
import { useAuth } from './state/AuthContext.jsx';

function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading">Loading CampusLoop…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="loading-mark">C</div><span>Getting your campus ready…</span></div>;
  return <Layout><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Auth mode="login"/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route path="/listing/:id" element={<ListingDetails/>}/>
    <Route path="/create" element={<Protected><ListingForm/></Protected>}/>
    <Route path="/edit/:id" element={<Protected><ListingForm edit/></Protected>}/>
    <Route path="/my-listings" element={<Protected><MyListings/></Protected>}/>
    <Route path="/saved" element={<Protected><SavedListings/></Protected>}/>
    <Route path="/requests" element={<Protected><RequestsPage/></Protected>}/>
    <Route path="/profile" element={<Protected><ProfilePage/></Protected>}/>
    <Route path="/admin" element={<Protected admin><AdminPage/></Protected>}/>
    <Route path="*" element={<div className="page-container"><h1>Page not found</h1><a href="/">Return home</a></div>}/>
  </Routes></Layout>;
}
