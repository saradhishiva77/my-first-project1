import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CloudRain, LogIn, Loader2 } from 'lucide-react';
import { AuthLayout, AuthField, AuthError, useAuthForm } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { loading, setLoading, error, setError } = useAuthForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate('/dashboard');
  }

  function fillDemo(role: 'admin' | 'user') {
    setEmail(role === 'admin' ? 'admin@disaster.ai' : 'user@disaster.ai');
    setPassword(role === 'admin' ? 'Admin@12345' : 'User@12345');
  }

  return (
    <AuthLayout>
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
          <CloudRain className="w-5 h-5 text-white" />
        </div>
        <p className="font-display font-bold text-white text-lg">DisasterAI</p>
      </div>

      <h2 className="font-display font-bold text-2xl text-white">Welcome back</h2>
      <p className="text-slate-400 mt-1 text-sm">Sign in to access the risk dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
        <AuthError message={error} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 p-4 rounded-xl bg-bg-surface/60 border border-border-subtle">
        <p className="text-xs text-slate-400 mb-2 font-medium">Demo accounts — click to fill:</p>
        <div className="flex gap-2">
          <button onClick={() => fillDemo('admin')} className="btn-outline flex-1 text-xs py-2">
            Admin
          </button>
          <button onClick={() => fillDemo('user')} className="btn-outline flex-1 text-xs py-2">
            User
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-slate-400 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
