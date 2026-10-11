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
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { loginUser, registerUser, clearAuthError } from '../store/slices/authSlice';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ initialMode = 'login', onClose }) {
  const dispatch = useDispatch();
  const { t, isAmharic } = useLanguage();
  const toast = useToast();
  const { loading, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError('');
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      const msg = isAmharic ? 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ' : 'Please enter a valid email address.';
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (formData.password.length < 6) {
      const msg = isAmharic ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት' : 'Password must be at least 6 characters.';
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (mode === 'login') {
      const res = await dispatch(loginUser({ email: formData.email.trim(), password: formData.password }));
      if (!res.error) {
        toast.success(isAmharic ? 'በተሳካ ሁኔታ ገብተዋል!' : 'Welcome back! Signed in successfully.');
        onClose();
      } else {
        toast.error(res.payload || (isAmharic ? 'መግባት አልተሳካም' : 'Login failed'));
      }
    } else {
      if (!formData.name.trim()) {
        const msg = isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Please enter your full name.';
        setValidationError(msg);
        toast.error(msg);
        return;
      }
      const res = await dispatch(registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password
      }));
      if (!res.error) {
        toast.success(isAmharic ? 'መለያዎ በተሳካ ሁኔታ ተፈጥሯል!' : 'Account created successfully!');
        onClose();
      } else {
        toast.error(res.payload || (isAmharic ? 'ምዝገባ አልተሳካም' : 'Registration failed'));
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex items-start sm:items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Back to Home & Close */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 text-neutral-800 text-xs font-semibold tracking-wide transition-all group shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t('back')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 border border-neutral-200 transition-colors"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Brand Logo & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 p-2 flex items-center justify-center shadow-xs mb-3">
            <img src="/logo-key.svg" alt="የኔ ኪራይ" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-neutral-950 font-sans">
            {mode === 'login' ? (isAmharic ? 'እንኳን ደህና መጡ' : 'Welcome Back') : (isAmharic ? 'የኔ ኪራይ ይቀላቀሉ' : 'Join የኔ ኪራይ')}
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs">
            {mode === 'login' 
              ? (isAmharic ? 'የኪራይ ማስታወቂያዎችዎን፣ የተወደዱትን እና መልዕክቶችዎን ያግኙ' : 'Access your rental listings, favorites, and live chats') 
              : (isAmharic ? 'ኪራይ ለመለጠፍ እና ከአከራዮች ጋር ለመገናኘት መለያ ይክፈቱ' : 'Create an account to post rentals and contact owners')}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 border border-neutral-200 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              if (error) dispatch(clearAuthError());
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' 
                ? 'bg-amber-500 text-neutral-950 shadow-xs' 
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            {t('navSignIn')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              if (error) dispatch(clearAuthError());
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' 
                ? 'bg-amber-500 text-neutral-950 shadow-xs' 
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            {t('navCreateAccount')}
          </button>
        </div>

        {/* Informational Security Notice */}
        {mode === 'register' && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {isAmharic ? 'አዲስ የተመዘገቡ ተጠቃሚዎች መደበኛ የተጠቃሚ ፍቃድ ያገኛሉ። የአስተዳዳሪ ሚናዎች በውስጣዊ ቁጥጥር ብቻ ይሰጣሉ።' : 'Public registrations are assigned Client (User) privileges. Administrative roles are provisioned exclusively through internal terminal CLI seeds.'}
            </p>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                {t('authFullName')}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
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
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              {t('authEmail')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
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
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                {t('authPhone')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
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
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              {t('authPassword')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
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
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold text-sm py-3.5 font-bold"
            >
              {loading ? (
                <span>{t('loading')}</span>
              ) : (
                <>
                  <span>{mode === 'login' ? t('authSubmitLogin') : t('authSubmitRegister')}</span>
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
