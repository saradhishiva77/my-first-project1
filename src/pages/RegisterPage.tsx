import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, CloudRain } from 'lucide-react';
import { AuthLayout, AuthField, AuthError, useAuthForm } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { loading, setLoading, error, setError } = useAuthForm();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) setError(error);
    else navigate('/login');
  }

  return (
    <AuthLayout>
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
          <CloudRain className="w-5 h-5 text-white" />
        </div>
        <p className="font-display font-bold text-white text-lg">DisasterAI</p>
      </div>

      <h2 className="font-display font-bold text-2xl text-white">Create your account</h2>
      <p className="text-slate-400 mt-1 text-sm">Start predicting disaster risks in minutes.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <AuthField label="Full Name" value={fullName} onChange={setFullName} placeholder="Jane Doe" required />
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" required />
        <AuthError message={error} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
