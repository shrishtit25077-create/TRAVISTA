import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Welcome back!");
        window.location.href = "/";
      } else {
        await signup(email, password);
        toast.success("Account created successfully!");
        window.location.href = "/onboarding";
      }
    } catch (err) {
      toast.error(err.message || "Invalid credentials");
    }
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000')` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative glass-card p-8 rounded-2xl w-full max-w-md shadow-2xl bg-black/40 border border-white/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TRAVISTA</h1>
          <p className="text-white/80">{isLogin ? 'Plan your next adventure with ease' : 'Join the ultimate travel planner'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-white/60 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-white/20 border border-white/30 rounded-xl px-10 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-[#1D9E75] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-white/60 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-white/20 border border-white/30 rounded-xl px-10 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-[#1D9E75] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#1D9E75] hover:bg-[#15825f] text-white py-4 rounded-xl font-bold text-lg transition-all"
            type="submit"
          >
            {isLogin ? 'Start Planning' : 'Create Account'}
          </motion.button>
        </form>

        <p className="text-center mt-6 text-white/70 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} className="text-[#1D9E75] font-semibold cursor-pointer">
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
