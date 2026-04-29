import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Globe } from 'lucide-react';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    login({ name: 'Traveler', email });
    navigate('/onboarding');
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
        className="relative glass-card p-8 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TRAVISTA</h1>
          <p className="text-white/80">Plan your next adventure with ease</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-white/60 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-white/20 border border-white/30 rounded-xl px-10 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-teal-light transition-all"
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
              className="w-full bg-white/20 border border-white/30 rounded-xl px-10 py-3 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-teal-light transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full btn-accent py-4 font-semibold text-lg"
            type="submit"
          >
            Start Planning
          </motion.button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <div className="flex items-center w-full space-x-2">
            <div className="h-[1px] bg-white/30 flex-grow" />
            <span className="text-white/60 text-sm">Or continue with</span>
            <div className="h-[1px] bg-white/30 flex-grow" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-3 text-white transition-all"
          >
            <Globe className="w-5 h-5" />
            <span>Sign in with Google</span>
          </motion.button>
        </div>

        <p className="text-center mt-6 text-white/70 text-sm">
          Don't have an account? <span className="text-accent font-semibold cursor-pointer">Sign Up</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
