import { useState, FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(username, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-[#0f1a30]">
      <div className="w-[360px]">
        <div className="text-center mb-8">
          <span className="text-white font-bold tracking-widest text-[22px]">LANDAUER</span>
          <p className="text-gray-400 text-[13px] mt-1">RSO Dashboard</p>
        </div>

        <div className="bg-[#1a2744] rounded-lg p-8 border border-white/10">
          <h2 className="text-white font-semibold text-[15px] mb-6">Sign in to your account</h2>

          {error && (
            <div className="bg-red-900/40 border border-red-500/40 text-red-300 text-[13px] rounded-md px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-400 text-[12px] mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#0f1a30] border border-white/20 rounded-md px-3 py-2 text-white text-[13px] placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-[12px] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#0f1a30] border border-white/20 rounded-md px-3 py-2 text-white text-[13px] placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-[13px] px-4 py-2 rounded-md cursor-pointer border-0 transition-colors w-full"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
