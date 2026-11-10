import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', course: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate(location.state?.from || '/');
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="auth-page">
    <div className="auth-aside"><div className="auth-aside-inner"><div className="auth-brand"><ShoppingBag size={22}/> CampusLoop</div><div className="auth-quote-mark">“</div><h2>Good things happen when a campus <em>shares.</em></h2><p>Find what you need. Pass on what you don't. Make campus life more affordable, one loop at a time.</p><div className="auth-points"><span><ShieldCheck size={17}/> Student-first community</span><span><ShieldCheck size={17}/> Reuse more, waste less</span></div><div className="auth-aside-foot">YOUR CAMPUS. YOUR COMMUNITY.</div></div></div>
    <div className="auth-main"><div className="auth-form-wrap"><div className="auth-mobile-brand"><ShoppingBag size={21}/> CampusLoop</div><div className="section-kicker">{isRegister ? 'JOIN THE LOOP' : 'WELCOME BACK'}</div><h1>{isRegister ? 'Make yourself at home.' : 'Good to see you again.'}</h1><p className="auth-subtitle">{isRegister ? 'Create your student account and discover your campus marketplace.' : 'Sign in to pick up where you left off.'}</p>
      <form className="auth-form" onSubmit={submit}>
        {isRegister && <><label>Full name<input name="name" value={form.name} onChange={change} placeholder="e.g. Priya Naik" required maxLength="80"/></label><label>College / university<input name="college" value={form.college} onChange={change} placeholder="Your college name" required maxLength="120"/></label><label>Course <span className="optional">(optional)</span><input name="course" value={form.course} onChange={change} placeholder="e.g. MCA"/></label></>}
        <label>College or personal email<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required autoComplete="email"/></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} required minLength={isRegister ? 8 : 1} autoComplete={isRegister ? 'new-password' : 'current-password'}/></label>
        {error && <div className="notice error-notice">{error}</div>}
        <button className="btn btn-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create my account' : 'Sign in'} <ArrowRight size={17}/></button>
      </form>
      <p className="auth-switch">{isRegister ? 'Already part of the loop?' : 'New to CampusLoop?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p><p className="auth-legal">By continuing, you agree to use the marketplace responsibly and respectfully.</p>
    </div></div>
  </div>;
}
