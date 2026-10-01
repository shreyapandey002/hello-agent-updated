import { Moon, SunMedium } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { user, loading, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/mailbox', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">Loading…</div>;
  }

  if (user) {
    return <Navigate to="/mailbox" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || 'Signup failed');
      return;
    }

    navigate('/mailbox', { replace: true });
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-[#f5f7fb] text-slate-800'}`}>
      <button
        type="button"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
        className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
      >
        {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div className={`w-full max-w-md rounded-2xl border p-7 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white shadow-slate-200/60'}`}>
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <span className="font-display text-2xl font-bold">H</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">Hello<span className="text-blue-600">Agent</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-blue-500' : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500'}`}
              placeholder="Alex Morgan"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Work email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-blue-500' : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500'}`}
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-blue-500' : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500'}`}
              placeholder="At least 8 characters"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={`w-full rounded-xl border px-3 py-3 text-sm outline-none transition ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100 focus:border-blue-500' : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500'}`}
              placeholder="Repeat password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
