// ─── Login ────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Film } from 'lucide-react';
import { loginUser } from '../../store/slices/authSlice';
import { useTitle } from '../../hooks/useDebounce';

export function Login() {
  useTitle('Sign In');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (!result.error) navigate('/');
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your CinemaVerse account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" value={form.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))} placeholder="you@example.com" required />

        <div>
          <label className="text-sm text-brand-muted block mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              required
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-xs text-brand-red hover:text-red-400">Forgot password?</Link>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-brand-muted mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-red hover:text-red-400">Create one</Link>
      </p>
    </AuthLayout>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────
import { registerUser } from '../../store/slices/authSlice';

export function Register() {
  useTitle('Create Account');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (!result.error) navigate('/');
  };

  return (
    <AuthLayout title="Join CinemaVerse" subtitle="Create your free account today">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded p-3">{error}</div>}
        <Field label="Full Name" value={form.name} onChange={(v) => setForm(p => ({ ...p, name: v }))} placeholder="Your name" required />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm(p => ({ ...p, email: v }))} placeholder="you@example.com" required />

        <div>
          <label className="text-sm text-brand-muted block mb-1.5">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Min 6 characters" required className="input pr-10" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Field label="Confirm Password" type="password" value={form.confirm}
          onChange={(v) => setForm(p => ({ ...p, confirm: v }))} placeholder="Repeat password" required />

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-brand-muted mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-red hover:text-red-400">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

// ─── ForgotPassword ───────────────────────────────────────────────────────────
import api from '../../services/api';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  useTitle('Forgot Password');
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (_) {
      setSent(true); // Always show success to prevent email enumeration
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send you a reset link">
      {sent
        ? <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <p className="text-brand-light text-sm">If that email exists, a reset link has been sent. Check your inbox.</p>
            <Link to="/login" className="text-brand-red hover:text-red-400 text-sm mt-4 inline-block">Back to sign in</Link>
          </div>
        : <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-brand-muted hover:text-white">Back to sign in</Link>
            </div>
          </form>
      }
    </AuthLayout>
  );
}

// ─── ResetPassword ────────────────────────────────────────────────────────────
import { useParams } from 'react-router-dom';

export function ResetPassword() {
  useTitle('Set New Password');
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="New Password" subtitle="Enter your new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" required />
        <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" required />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
}

// ─── Shared Auth Layout ───────────────────────────────────────────────────────
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Film className="w-8 h-8 text-brand-red" />
            <span className="font-display text-2xl tracking-wider">CINEMAVERSE</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-brand-muted text-sm mt-1">{subtitle}</p>
        </div>
        <div className="card p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="text-sm text-brand-muted block mb-1.5">{label}</label>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input"
      />
    </div>
  );
}

export default Login;
