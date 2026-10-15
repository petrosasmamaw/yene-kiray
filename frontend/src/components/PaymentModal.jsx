import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Building, 
  Smartphone, 
  ArrowRight, 
  ShieldAlert, 
  ArrowLeft,
  Copy,
  Check,
  Eye,
  Trash2,
  Cloud
} from 'lucide-react';
import api from '../services/api';
import { compressImage, fileToDataUri } from '../utils/imageCompressor';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentModal({ 
  listing = null, 
  isMembership = false, 
  feeAmount = 200, 
  accounts: initialAccounts, 
  onClose, 
  onSuccess 
}) {
  const { t, isAmharic } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Dynamic admin accounts state
  const [accounts, setAccounts] = useState(initialAccounts || {
    telebirr: { name: 'የኔ ኪራይ (Yene Kiray)', number: '0911000000' },
    cbe: { name: 'የኔ ኪራይ (Yene Kiray)', number: '1000234567890' }
  });
  const [currentFee, setCurrentFee] = useState(feeAmount || 200);

  // Fetch latest public payment accounts from admin settings
  useEffect(() => {
    let isMounted = true;
    api.get('/admin/settings/public')
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.settings?.accounts) {
          setAccounts(res.data.settings.accounts);
        }
        if (res.data?.settings?.posting_fee_amount) {
          setCurrentFee(res.data.settings.posting_fee_amount);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch public payment settings, using defaults:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  if (!listing && !isMembership) return null;

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // Upload receipt screenshot to Cloudinary via backend /api/upload
  const handleReceiptFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isAmharic ? 'እባክዎ ትክክለኛ የምስል ፋይል (PNG ወይም JPG) ይምረጡ' : 'Please upload a valid image file (PNG/JPG)');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      // 1. Optimize & compress image before upload
      const optimizedFile = await compressImage(file, 1600, 0.85);

      // 2. Upload to Cloudinary folder 'yene_kiray/receipts'
      const formData = new FormData();
      formData.append('image', optimizedFile);
      formData.append('folder', 'yene_kiray/receipts');

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.image_url) {
        setReceiptUrl(res.data.image_url);
      } else {
        throw new Error('Upload response missing image URL');
      }
    } catch (uploadErr) {
      console.warn('Cloudinary upload warning, trying local data fallback:', uploadErr);
      try {
        const dataUri = await fileToDataUri(file);
        setReceiptUrl(dataUri);
      } catch (fallbackErr) {
        setErrorMessage(isAmharic ? 'የደረሰኝ ፎቶ ማስገባት አልተሳካም። እባክዎ በድጋሚ ይሞክሩ።' : 'Failed to upload receipt screenshot. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl('');
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!receiptUrl && !transactionRef.trim()) {
      setErrorMessage(
        isAmharic 
          ? 'እባክዎ የከፈሉበትን ደረሰኝ ፎቶ (Screenshot) ያስገቡ ወይም የግብይት ቁጥር (Reference) ይጻፉ።'
          : 'Please upload the payment receipt screenshot or enter the transaction reference code.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.post('/payments/submit', {
        listing_id: isMembership ? null : (listing?.id || null),
        payment_type: isMembership ? 'unlimited_access' : 'listing_fee',
        payment_method: paymentMethod,
        transaction_reference: transactionRef.trim() || 'RECEIPT_ATTACHED',
        receipt_image_url: receiptUrl || null,
        amount: currentFee
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Payment submit error:', err);
      setErrorMessage(
        err.response?.data?.message || 
        (isAmharic ? 'የክፍያ መረጃውን ማስገባት አልተቻለም፤ እባክዎ እንደገና ይሞክሩ።' : 'Failed to submit payment proof. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white border border-neutral-200 rounded-3xl p-5 sm:p-7 shadow-2xl my-4 sm:my-8 text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Back & Close */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 text-neutral-800 text-xs font-semibold tracking-wide transition-all group shadow-2xs"
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

        {/* Modal Brand Title */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
            <CreditCard className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-neutral-950 font-sans tracking-tight">
              {isMembership 
                ? (isAmharic ? 'ያልተገደበ ማስታወቂያ የመለጠፍ ፈቃድ ይክፈቱ' : 'Unlock Unlimited Posting Access')
                : (isAmharic ? 'የማስታወቂያ ክፍያ ያረጋግጡ' : 'Complete Listing Payment')}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isMembership
                ? (isAmharic ? 'አንድ ጊዜ ብቻ በመክፈል ለወደፊቱ ያልተገደቡ የኪራይ ማስታወቂያዎችን በነጻ ይለጥፉ!' : 'Pay once and unlock lifetime unlimited rental postings without paying per post!')
                : (isAmharic ? 'የነጻ ሙከራ ገደብ አልቋል፤ ክፍያ ፈጽመው ደረሰኝ ይላኩ' : 'Free trial limit reached. Pay fee & submit screenshot to activate post.')}
            </p>
          </div>
        </div>

        {/* Target Listing & Fee Card */}
        <div className="bg-gradient-to-br from-amber-50 via-amber-50/60 to-white border border-amber-200 rounded-2xl p-4 mb-5 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {isMembership 
                  ? (isAmharic ? 'የአባልነት አይነት' : 'Membership Access')
                  : (isAmharic ? 'የሚለጠፈው ንብረት' : 'Target Rental Listing')}
              </span>
              <p className="text-sm font-black text-neutral-950 truncate mt-0.5">
                {isMembership 
                  ? (isAmharic ? 'የአንድ ጊዜ ያልተገደበ አባልነት' : 'Lifetime Unlimited Membership')
                  : listing?.title}
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                {isMembership 
                  ? (isAmharic ? 'ያልተገደበ ማስታወቂያ በነጻ የመለጠፍ ፈቃድ' : 'Post unlimited rentals anytime for free')
                  : `${listing?.city || ''} ${listing?.subcity ? `• ${listing.subcity}` : ''}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {isMembership 
                  ? (isAmharic ? 'የአንድ ጊዜ ክፍያ' : 'One-Time Fee')
                  : (isAmharic ? 'የማስታወቂያ ክፍያ' : 'Posting Fee')}
              </span>
              <p className="text-xl font-black text-amber-600 font-sans">
                {Number(currentFee).toLocaleString()} <span className="text-xs font-bold">ETB</span>
              </p>
            </div>
          </div>
        </div>

        {/* Official Admin Payment Accounts (Telebirr & CBE) */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{isAmharic ? 'የክፍያ አካውንቶች (አስተዳዳሪ የመደበው)' : 'Official Payment Accounts'}</span>
            </h4>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {isAmharic ? 'የተረጋገጠ' : 'Verified'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Telebirr Account Card */}
            <div 
              onClick={() => setPaymentMethod('Telebirr')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                paymentMethod === 'Telebirr'
                  ? 'bg-amber-50/50 border-amber-500 shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-950">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <span>Telebirr</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(accounts.telebirr?.number, 'telebirr');
                  }}
                  className="p-1 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors shadow-2xs"
                  title="Copy Number"
                >
                  {copiedKey === 'telebirr' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="font-mono text-sm font-extrabold text-neutral-950 tracking-wider">
                {accounts.telebirr?.number || '0911000000'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
                Name: <span className="font-semibold text-neutral-700">{accounts.telebirr?.name || 'የኔ ኪራይ (Yene Kiray)'}</span>
              </div>
            </div>

            {/* CBE Account Card */}
            <div 
              onClick={() => setPaymentMethod('CBE')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                paymentMethod === 'CBE'
                  ? 'bg-amber-50/50 border-amber-500 shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-950">
                  <Building className="w-4 h-4 text-amber-500" />
                  <span>CBE (Commercial Bank)</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(accounts.cbe?.number, 'cbe');
                  }}
                  className="p-1 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors shadow-2xs"
                  title="Copy Account"
                >
                  {copiedKey === 'cbe' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="font-mono text-sm font-extrabold text-neutral-950 tracking-wider">
                {accounts.cbe?.number || '1000234567890'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5 truncate">
                Name: <span className="font-semibold text-neutral-700">{accounts.cbe?.name || 'የኔ ኪራይ (Yene Kiray)'}</span>
              </div>
            </div>

          </div>

          <p className="text-[11px] text-neutral-500 leading-normal">
            {isAmharic 
              ? `እባክዎ ልክ ${currentFee} ብር ወደ ቴሌብር ወይም ንግድ ባንክ ያስገቡና የከፈሉበትን ደረሰኝ ስክሪንሽት ከታች ይስቀሉ።`
              : `Transfer exactly ${currentFee} ETB via Telebirr or CBE and attach the transaction screenshot below.`}
          </p>
        </div>

        {/* Payment Submission Form */}
        <form onSubmit={handleSubmitProof} className="space-y-4">
          
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              {isAmharic ? 'የከፈሉበት መንገድ' : 'Selected Payment Method'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Telebirr')}
                className={`py-2.5 px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'Telebirr'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Telebirr</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CBE')}
                className={`py-2.5 px-4 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'CBE'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>CBE (ንግድ ባንክ)</span>
              </button>
            </div>
          </div>

          {/* Screenshot Receipt Upload (Cloudinary) */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{isAmharic ? 'የክፍያ ደረሰኝ ፎቶ (ስክሪንሽት) *' : 'Payment Screenshot Receipt *'}</span>
              <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                Cloudinary Storage
              </span>
            </label>

            {!receiptUrl ? (
              <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-amber-50/20 hover:bg-amber-50/40 transition-colors group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleReceiptFileChange}
                  disabled={isUploading}
                  className="hidden" 
                />
                <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-200 text-amber-600 flex items-center justify-center mb-2 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-900">
                  {isUploading 
                    ? (isAmharic ? 'ፎቶው ወደ Cloudinary እየተጫነ ነው...' : 'Uploading receipt to Cloudinary...') 
                    : (isAmharic ? 'የደረሰኝ ፎቶ እዚህ ይጫኑ' : 'Click to upload payment screenshot')}
                </span>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  PNG, JPG or WEBP (Telebirr SMS or Bank transfer slip)
                </span>
              </label>
            ) : (
              <div className="p-3 rounded-2xl bg-neutral-50 border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    onClick={() => setPreviewOpen(true)}
                    className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-300 overflow-hidden shrink-0 cursor-pointer group relative"
                  >
                    <img 
                      src={receiptUrl} 
                      alt="Receipt" 
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                      <Eye className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isAmharic ? 'ደረሰኝ ተያይዟል' : 'Receipt Uploaded to Cloudinary'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="text-[11px] text-amber-600 hover:underline font-semibold text-left block truncate mt-0.5"
                    >
                      {isAmharic ? 'ደረሰኙን በትልቁ እይ' : 'Click to preview screenshot'}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-200 transition-colors shrink-0"
                  title="Remove screenshot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Transaction Reference / SMS Code Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              {isAmharic ? 'የግብይት ቁጥር / Transaction Ref (አማራጭ)' : 'Transaction Reference / SMS Code (Optional)'}
            </label>
            <input 
              type="text"
              placeholder="e.g. TLB98124701 or CBE-829148"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="input-luxury text-xs font-mono"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full btn-gold text-xs sm:text-sm py-3.5 font-bold shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>{isAmharic ? 'ወደ አስተዳዳሪ በመላክ ላይ...' : 'Submitting to Admin for Review...'}</span>
              ) : (
                <>
                  <span>{isAmharic ? 'ከፍያለሁ — ለማረጋገጫ ላክ' : 'I Have Paid — Submit for Admin Approval'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-neutral-500 mt-2">
              {isAmharic 
                ? 'የላኩት ክፍያ በአስተዳዳሪው ሲረጋገጥ ማስታወቂያዎ ወዲያውኑ ለተከራዮች ይታያል።' 
                : 'Your post will become active and available immediately once the admin approves the payment.'}
            </p>
          </div>

        </form>

        {/* Receipt Image Lightbox Preview Modal */}
        {previewOpen && receiptUrl && (
          <div 
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <div 
              className="relative max-w-2xl max-h-[90vh] bg-neutral-900 border border-neutral-700 rounded-3xl p-3 overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 px-2 border-b border-neutral-800">
                <span className="text-xs font-bold text-neutral-200">Receipt Screenshot Preview</span>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center overflow-auto max-h-[75vh]">
                <img 
                  src={receiptUrl} 
                  alt="Receipt Preview" 
                  className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-lg" 
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
