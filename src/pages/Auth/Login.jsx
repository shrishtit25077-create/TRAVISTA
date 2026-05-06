import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back! 🌍');
        window.location.href = '/';
      } else {
        await signup(email, password);
        toast.success('Account created! Let's plan your first trip 🗺️');
        window.location.href = '/onboarding';
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google! 🎉');
      window.location.href = '/';
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000')` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative glass-card p-8 rounded-2xl w-full max-w-md shadow-2xl bg-black/40 border border-white/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TRAVISTA</h1>
          <p className="text-white/70 text-sm">
            {isLogin ? 'Plan your next adventure with ease' : 'Join the ultimate travel planner'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-white/60 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              className="w-full bg-white/20 border border-white/30 rounded-xl px-10 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-[#1D9E75] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-white/60 w-5 h-5" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full bg-white/20 border border-white/30 rounded-xl px-10 pr-12 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-[#1D9E75] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-3.5 text-white/50 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-[#1D9E75] hover:bg-[#15825f] text-white py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait...</>
            ) : (
              isLogin ? 'Start Planning' : 'Create Account'
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-white/90 text-slate-800 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Toggle Login/Signup */}
        <p className="text-center mt-6 text-white/60 text-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); }}
            className="text-[#1D9E75] font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up Free' : 'Log In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
