import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  ShieldAlert, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { loginUser, registerUser, clearAuthError } from '../store/slices/authSlice';

export default function AuthModal({ initialMode = 'login', onClose }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await dispatch(loginUser({ email: formData.email, password: formData.password }));
      if (!res.error) onClose();
    } else {
      const res = await dispatch(registerUser(formData));
      if (!res.error) onClose();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex items-start sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#0D0D0D] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-gold-lg my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Back to Home & Close */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Brand Logo & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-black border border-amber-500/40 p-2 flex items-center justify-center shadow-gold-sm mb-3">
            <img src="/logo-key.svg" alt="የኔ ኪራይ" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-sans">
            {mode === 'login' ? 'Welcome Back' : 'Join የኔ ኪራይ'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            {mode === 'login' 
              ? 'Access your rental listings, favorites, and live chats' 
              : 'Create an account to post rentals and contact owners'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-neutral-950 border border-neutral-850 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              if (error) dispatch(clearAuthError());
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' 
                ? 'bg-amber-500 text-black shadow-gold-sm' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              if (error) dispatch(clearAuthError());
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' 
                ? 'bg-amber-500 text-black shadow-gold-sm' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Informational Security Notice */}
        {mode === 'register' && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-[11px] text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Public registrations are assigned <strong>Client (User)</strong> privileges. Administrative roles are provisioned exclusively through internal terminal CLI seeds.
            </p>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Abebe Bikila"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-luxury pl-11 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="input-luxury pl-11 text-sm"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="tel"
                  name="phone"
                  placeholder="+251 911 234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-luxury pl-11 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="input-luxury pl-11 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold text-sm py-3.5"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Account' : 'Register Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
