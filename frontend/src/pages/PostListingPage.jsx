import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PlusCircle, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Building, 
  DollarSign, 
  MapPin, 
  Phone,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { createNewListing, fetchCategories } from '../store/slices/listingSlice';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { compressImage, fileToDataUri } from '../utils/imageCompressor';
import { useLanguage } from '../context/LanguageContext';

const getPresetFeatures = (isAmharic) => isAmharic ? [
  'ዕቃ የተሟላለት (Furnished)',
  'የተጠባባቂ ጀነሬተር (Generator)',
  'የውሃ ማጠራቀሚያ ታንከር (Water Tank)',
  'የግል የመኪና ማቆሚያ (Parking)',
  'ፈጣን ዋይፋይ ኢንተርኔት (Wi-Fi)',
  'የ 24/7 የጥበቃ አገልግሎት (Security)',
  'የአየር ማቀዝቀዣ (A/C)',
  'ሹፌር ያለው / የተካተተ',
  'የንግድ ማእድ ቤት / አገልግሎቶች',
  'ኢንሹራንስ ያለው'
] : [
  'Furnished / Ready to Use',
  'Backup Generator',
  'Water Reservoir Tank',
  'Dedicated Parking Space',
  'High-speed Wi-Fi',
  '24/7 Security Guard',
  'Air Conditioning',
  'Driver Included',
  'Commercial Kitchen / Utilities',
  'Insurance Included'
];

export default function PostListingPage({ onListingSuccess, onGoBack, onGoHome }) {
  const dispatch = useDispatch();
  const { t, getCategoryTitle, isAmharic } = useLanguage();
  const { categories } = useSelector((state) => state.listings);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    rental_price: '',
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: '',
    specific_location: '',
    contact_phone: user?.phone || ''
  });

  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [images, setImages] = useState([]); // Array of { image_url, public_id }
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Payment Modal State
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleFeature = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  // Upload image to Cloudinary/server with client compression & fallback
  const handleImageFileChange = async (e) => {
    const rawFiles = Array.from(e.target.files);
    if (!rawFiles.length) return;

    setUploadingImage(true);
    setErrorMsg('');

    try {
      for (const file of rawFiles) {
        // 1. Compress image to reduce 10MB phone uploads to lightweight ~150KB
        const optimizedFile = await compressImage(file, 1280, 0.82);

        try {
          const data = new FormData();
          data.append('image', optimizedFile);
          data.append('folder', 'yene_kiray/listings');

          const res = await api.post('/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data?.image_url) {
            setImages((prev) => [...prev, { image_url: res.data.image_url, public_id: res.data.public_id || '' }]);
            continue;
          }
        } catch (uploadErr) {
          console.warn('Backend upload failed, using high-speed local data URI fallback:', uploadErr);
          // 2. Reliable data URI fallback so user listing is never blocked
          const dataUri = await fileToDataUri(optimizedFile);
          setImages((prev) => [...prev, { image_url: dataUri, public_id: 'client_stored' }]);
        }
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      setErrorMsg('Image processing error. Please try another image.');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title || !formData.description || !formData.rental_price || !formData.contact_phone) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || (categories[0]?.id || 1),
        rental_price: parseFloat(formData.rental_price),
        features: selectedFeatures,
        images
      };

      const result = await dispatch(createNewListing(payload)).unwrap();

      // Check if Admin requires payment
      if (result.requires_payment) {
        setPaymentModalData({
          listing: result.listing,
          fee: result.posting_fee || 200
        });
      } else {
        // Free posting / approved: scroll to top and navigate directly to listings list!
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (onListingSuccess) {
          onListingSuccess(result.listing);
        } else {
          setPaymentSuccess(true);
        }
      }
    } catch (err) {
      console.error('Failed to post listing:', err);
      setErrorMsg(typeof err === 'string' ? err : 'Error publishing listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0D0D0D] border border-amber-500/40 rounded-3xl p-8 text-center space-y-4 shadow-gold-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white font-sans">
            {t('postSuccessTitle')}
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {t('postSuccessDesc')}
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                if (onListingSuccess) onListingSuccess();
              }}
              className="w-full btn-gold text-sm py-3 font-bold"
            >
              {t('postViewInMyListings')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="border-b border-neutral-800 pb-5 sm:pb-6">
          <button
            type="button"
            onClick={() => {
              if (onGoBack) onGoBack();
              else if (onGoHome) onGoHome();
              else window.history.back();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 transition-colors mb-2.5 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t('back')}</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('postPageBadge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-sans leading-tight">
            {t('postPageTitle')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {t('postPageSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-8">
          
          {/* Card 1: Basic Info */}
          <div className="card-obsidian space-y-4 sm:space-y-5 p-4 sm:p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Building className="w-4 h-4 text-amber-500" />
              <span>{t('postCardRentalInfo')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  {t('postLabelTitle')}
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder={t('postPlaceholderTitle')}
                  value={formData.title}
                  onChange={handleChange}
                  className="input-luxury text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  {t('postLabelCategory')}
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="input-luxury text-sm cursor-pointer"
                >
                  <option value="" className="bg-[#111111]">{isAmharic ? 'የኪራይ ዘርፍ ይምረጡ' : 'Select Category'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#111111]">
                      {getCategoryTitle(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    {t('postLabelPrice')}
                  </label>
                  <input
                    type="number"
                    name="rental_price"
                    required
                    min="1"
                    placeholder="25000"
                    value={formData.rental_price}
                    onChange={handleChange}
                    className="input-luxury text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    {t('postLabelPeriod')}
                  </label>
                  <select
                    name="price_period"
                    value={formData.price_period}
                    onChange={handleChange}
                    className="input-luxury text-sm cursor-pointer"
                  >
                    <option value="month" className="bg-[#111111]">{t('periodMonth')}</option>
                    <option value="day" className="bg-[#111111]">{t('periodDay')}</option>
                    <option value="year" className="bg-[#111111]">{t('periodYear')}</option>
                    <option value="hour" className="bg-[#111111]">{t('periodHour')}</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  {t('postLabelDesc')}
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder={t('postPlaceholderDesc')}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-luxury text-sm"
                />
              </div>

            </div>
          </div>

          {/* Card 2: Location & Contact */}
          <div className="card-obsidian space-y-4 sm:space-y-5 p-4 sm:p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{t('postCardLocation')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  {t('postLabelCity')}
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="input-luxury text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  {t('postLabelSubcity')}
                </label>
                <input
                  type="text"
                  name="subcity"
                  placeholder={t('postPlaceholderSubcity')}
                  value={formData.subcity}
                  onChange={handleChange}
                  className="input-luxury text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  {t('postLabelLocation')}
                </label>
                <input
                  type="text"
                  name="specific_location"
                  placeholder={t('postPlaceholderLocation')}
                  value={formData.specific_location}
                  onChange={handleChange}
                  className="input-luxury text-sm"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  {t('postLabelPhone')}
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  required
                  placeholder={t('postPlaceholderPhone')}
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="input-luxury text-sm"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Cloudinary Image Uploads */}
          <div className="card-obsidian space-y-4 sm:space-y-5 p-4 sm:p-6">
            <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>{t('postCardImages')}</span>
              </div>
              <span className="text-xs text-neutral-400 font-normal">
                {images.length} {isAmharic ? 'ፎቶዎች ተካተዋል' : 'uploaded'}
              </span>
            </h3>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900 group">
                  <img src={img.image_url} alt="upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-rose-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black">
                      {isAmharic ? 'ዋና ፎቶ' : 'Cover'}
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Trigger Button */}
              <label className="cursor-pointer aspect-[4/3] rounded-xl border-2 border-dashed border-neutral-800 hover:border-amber-500/60 bg-neutral-950 flex flex-col items-center justify-center text-center p-3 sm:p-4 transition-all">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mb-1.5 sm:mb-2" />
                <span className="text-xs font-semibold text-neutral-300">
                  {uploadingImage ? t('postPublishing') : (isAmharic ? 'ፎቶዎችን ጨምር' : 'Add Images')}
                </span>
                <span className="text-[10px] text-neutral-500 mt-0.5 sm:mt-1">{isAmharic ? 'PNG, JPG እስከ 10MB' : 'PNG, JPG up to 10MB'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* Card 4: Features & Amenities */}
          <div className="card-obsidian space-y-3.5 sm:space-y-4 p-4 sm:p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('postLabelFeatures')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              {getPresetFeatures(isAmharic).map((feat) => {
                const checked = selectedFeatures.includes(feat);
                return (
                  <button
                    type="button"
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2.5 ${
                      checked
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${checked ? 'text-amber-400' : 'text-neutral-600'}`} />
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 sm:pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="w-full sm:w-auto btn-gold text-sm sm:text-base py-3.5 sm:py-4 px-8 sm:px-10 font-bold justify-center"
            >
              {submitting ? (
                <span>{t('postPublishing')}</span>
              ) : (
                <>
                  <span>{t('postPublishButton')}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Payment Modal if Pay-to-Post is ON */}
      {paymentModalData && (
        <PaymentModal
          listing={paymentModalData.listing}
          feeAmount={paymentModalData.fee}
          onClose={() => setPaymentModalData(null)}
          onSuccess={() => {
            setPaymentModalData(null);
            if (onListingSuccess) onListingSuccess();
          }}
        />
      )}
    </div>
  );
}
