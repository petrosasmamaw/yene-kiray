import React, { useState } from 'react';
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
  ArrowLeft 
} from 'lucide-react';
import api from '../services/api';
import { compressImage, fileToDataUri } from '../utils/imageCompressor';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentModal({ listing, feeAmount = 200, onClose, onSuccess }) {
  const { t, isAmharic } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!listing) return null;

  // Handle receipt image upload via backend endpoint with client compression & fallback
  const handleReceiptFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      const optimizedFile = await compressImage(file, 1280, 0.82);

      try {
        const formData = new FormData();
        formData.append('image', optimizedFile);
        formData.append('folder', 'yene_kiray/receipts');

        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.image_url) {
          setReceiptUrl(res.data.image_url);
        }
      } catch (uploadErr) {
        console.warn('Backend receipt upload failed, using local fallback:', uploadErr);
        const dataUri = await fileToDataUri(optimizedFile);
        setReceiptUrl(dataUri);
      }
    } catch (err) {
      console.error('Receipt upload error:', err);
      setErrorMessage('Failed to process receipt image. You can still submit with transaction reference.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim() && !receiptUrl) {
      setErrorMessage('Please provide either a Transaction Reference number or upload receipt screenshot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.post('/payments/submit', {
        listing_id: listing.id,
        payment_method: paymentMethod,
        transaction_reference: transactionRef.trim(),
        receipt_image_url: receiptUrl,
        amount: feeAmount
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Payment submit error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit payment proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex items-start sm:items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-4 sm:my-8"
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-950 font-sans">
              {isAmharic ? 'የማስታወቂያ ክፍያ ያረጋግጡ' : 'Complete Listing Payment'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isAmharic ? 'በአስተዳዳሪው የተወሰነ የፖስቲንግ ክፍያ' : 'Pay-to-Post is enabled by platform administrators'}
            </p>
          </div>
        </div>

        {/* Listing & Fee Summary */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-6 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-600 font-semibold uppercase tracking-wider">
                Target Listing
              </span>
              <p className="text-sm font-bold text-neutral-950 truncate max-w-[240px] mt-0.5">
                {listing.title}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-600 font-semibold uppercase tracking-wider">
                Posting Fee
              </span>
              <p className="text-lg font-black text-amber-600">
                {Number(feeAmount).toLocaleString()} ETB
              </p>
            </div>
          </div>
        </div>

        {/* Official Payment Accounts Instructions */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 mb-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Transfer Instructions</span>
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-neutral-950">
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                <span>Telebirr</span>
              </div>
              <p className="text-neutral-700 font-mono mt-1 font-semibold">0911 00 00 00</p>
              <p className="text-[10px] text-neutral-500">Name: Yene Kiray</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-neutral-950">
                <Building className="w-3.5 h-3.5 text-amber-500" />
                <span>CBE (Commercial Bank)</span>
              </div>
              <p className="text-neutral-700 font-mono mt-1 font-semibold">1000 2345 6789 0</p>
              <p className="text-[10px] text-neutral-500">Name: Yene Kiray</p>
            </div>
          </div>

          <p className="text-[11px] text-neutral-600 leading-normal">
            Transfer the exact amount of <strong className="text-amber-600">{feeAmount} ETB</strong> and submit your reference code below.
          </p>
        </div>

        {/* Payment Submission Form */}
        <form onSubmit={handleSubmitProof} className="space-y-4">
          
          {/* Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Payment Method Used
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Telebirr', 'CBE Birr', 'Bank Transfer'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    paymentMethod === m 
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs' 
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:text-neutral-950'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Reference Number Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Transaction Reference / SMS Code
            </label>
            <input 
              type="text"
              placeholder="e.g. TLB890248234 or CBE-998124"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="input-luxury text-sm"
            />
          </div>

          {/* Optional Receipt Screenshot Upload */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Receipt Screenshot (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 text-xs font-semibold text-neutral-800 transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleReceiptFileChange}
                  disabled={isUploading}
                />
              </label>

              {receiptUrl && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Receipt Attached</span>
                </span>
              )}
            </div>
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
              className="w-full btn-gold text-sm py-3.5 font-bold"
            >
              {isSubmitting ? (
                <span>Submitting for Admin Review...</span>
              ) : (
                <>
                  <span>I Have Paid — Submit for Approval</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-neutral-500 mt-2">
              Once submitted, status becomes <strong>Pending</strong> in Admin Panel. When approved, it goes public immediately.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
