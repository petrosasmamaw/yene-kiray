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
  Info,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { createNewListing, fetchCategories } from '../store/slices/listingSlice';
import { setFreeTrialPostsRemaining } from '../store/slices/authSlice';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import { compressImage, fileToDataUri } from '../utils/imageCompressor';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

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
  const toast = useToast();
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

  const [cityOption, setCityOption] = useState('Addis Ababa');
  const [customCity, setCustomCity] = useState('');

  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [images, setImages] = useState([]); // Array of { image_url, public_id }
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Payment Modal State
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    api.get('/listings/user/posting-eligibility')
      .then((res) => setEligibility(res.data?.data))
      .catch((err) => console.warn('Could not load posting eligibility:', err.message));
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
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

    // Validate image mime types and file sizes
    const validFiles = [];
    for (const file of rawFiles) {
      if (!file.type.startsWith('image/')) {
        const msg = isAmharic 
          ? `"${file.name}" ትክክለኛ የምስል ፋይል አይደለም` 
          : `"${file.name}" is not a valid image file`;
        toast.warning(msg);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        const msg = isAmharic 
          ? `የምስሉ መጠን (${file.name}) ከ 20MB በታች መሆን አለበት` 
          : `Image size for "${file.name}" must be under 20MB`;
        toast.warning(msg);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) {
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');

    try {
      for (const file of validFiles) {
        // 1. Compress image to reduce phone uploads to lightweight ~150KB
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
      toast.success(isAmharic ? 'ምስሎች በተሳካ ሁኔታ ተጭነዋል' : 'Images processed successfully');
    } catch (err) {
      console.error('Image processing failed:', err);
      const msg = isAmharic 
        ? 'ምስሎችን በማዘጋጀት ላይ ስህተት ተፈጥሯል፤ እባክዎ እንደገና ይሞክሩ' 
        : 'Image processing error. Please try another image.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Validation checks
    if (!formData.title || formData.title.trim().length < 3) {
      const msg = isAmharic ? 'እባክዎ ትክክለኛ የኪራይ ርዕስ ያስገቡ (ቢያንስ 3 ፊደላት)' : 'Please enter a valid listing title (at least 3 characters)';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }
    if (!formData.category_id) {
      const msg = isAmharic ? 'እባክዎ የኪራይ ዘርፍ ይምረጡ' : 'Please select a category';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }
    if (!formData.rental_price || Number(formData.rental_price) <= 0) {
      const msg = isAmharic ? 'እባክዎ ትክክለኛ የኪራይ ዋጋ ያስገቡ' : 'Please enter a valid rental price';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }
    if (formData.contact_phone && formData.contact_phone.trim().length < 9) {
      const msg = isAmharic ? 'እባክዎ ትክክለኛ የስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number';
      setErrorMsg(msg);
      toast.warning(msg);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        rental_price: Number(formData.rental_price),
        features: selectedFeatures,
        images: images
          .filter((img) => img && (img.image_url || typeof img === 'string'))
          .map((img) => (typeof img === 'string' ? { image_url: img } : { image_url: img.image_url, public_id: img.public_id || null }))
      };

      const result = await dispatch(createNewListing(payload)).unwrap();

      if (result.free_trial_posts_remaining !== undefined) {
        dispatch(setFreeTrialPostsRemaining(result.free_trial_posts_remaining));
        setEligibility((prev) => prev ? {
          ...prev,
          free_posts_remaining: result.free_trial_posts_remaining,
          free_trial_posts_remaining: result.free_trial_posts_remaining,
          is_free_next: result.free_trial_posts_remaining > 0
        } : prev);
      }

      toast.success(isAmharic ? 'ማስታወቂያዎ በተሳካ ሁኔታ ተመዝግቧል!' : 'Listing published successfully!');

      // Check if Admin requires payment
      if (result.requires_payment) {
        setPaymentModalData({
          listing: result.listing,
          fee: result.posting_fee || 200,
          accounts: result.accounts
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
      const msg = typeof err === 'string' ? err : (isAmharic ? 'ማስታወቂያውን መለጠፍ አልተቻለም፤ እባክዎ የኔትወርክ ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ' : 'Could not publish listing. Please check your network and try again.');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-amber-300 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-neutral-950 font-sans">
            {t('postSuccessTitle')}
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
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
    <div className="min-h-screen bg-[#f4f5f7] text-neutral-900 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="border-b border-neutral-200 pb-5 sm:pb-6">
          <button
            type="button"
            onClick={() => {
              if (onGoBack) onGoBack();
              else if (onGoHome) onGoHome();
              else window.history.back();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber-600 transition-colors mb-2.5 group font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-amber-600" />
            <span>{t('back')}</span>
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('postPageBadge')}</span>
            </div>

            {/* Small in-page free trial pill indicator */}
            {eligibility && (
              <div 
                id="free-trial-counter-pill"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all ${
                  eligibility.free_posts_remaining > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {eligibility.free_posts_remaining > 0 ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
                    <span>
                      {isAmharic 
                        ? `${eligibility.free_posts_remaining} ነጻ ፖስት ቀርቷል` 
                        : `${eligibility.free_posts_remaining} Free Post${eligibility.free_posts_remaining === 1 ? '' : 's'} Remaining`}
                    </span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {isAmharic 
                        ? `የሚከፈልበት ፖስት (${eligibility.posting_fee || 200} ብር)` 
                        : `Paid Listing (${eligibility.posting_fee || 200} ETB)`}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 font-sans leading-tight">
            {t('postPageTitle')}
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            {t('postPageSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{isAmharic ? 'እንደገና ሞክር' : 'Retry'}</span>
            </button>
          </div>
        )}

        {/* Dynamic Business Free Trial / Payment Status Badge */}
        {eligibility && (
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all shadow-2xs ${
            eligibility.is_free_next 
              ? 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/30 to-white border-emerald-300 text-emerald-950'
              : 'bg-gradient-to-r from-amber-50/90 via-amber-50/30 to-white border-amber-300 text-amber-950'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                  eligibility.is_free_next 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                    : 'bg-amber-100 text-amber-700 border-amber-300'
                }`}>
                  {eligibility.is_free_next ? <Sparkles className="w-4 h-4 stroke-[2.2]" /> : <CreditCard className="w-4 h-4 stroke-[2.2]" />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black font-sans tracking-tight">
                    {eligibility.is_free_next 
                      ? (isAmharic ? `የነጻ ማስታወቂያ ሙከራ: ${eligibility.free_posts_remaining} ቀሪ ፖስት` : `Free Trial Balance: ${eligibility.free_posts_remaining} free post(s) remaining`)
                      : (isAmharic ? `የነጻ ሙከራ ፖስቶች አልቀዋል (0 ቀርቷል)` : `Free Trial Balance: 0 remaining`)}
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                    {eligibility.is_free_next
                      ? (isAmharic ? 'በመመዝገቢያዎ የተሰጠዎት ነጻ የፖስት እድል ነው። ይህ ማስታወቂያ ክፍያ ሳይጠይቅ ወዲያውኑ በነጻ ይለጠፋል!' : 'From your account registration grant. This listing will publish live immediately for free!')
                      : (isAmharic ? `የመመዝገቢያ ነጻ ፖስቶችዎን አጠናቀዋል። ማስታወቂያዎን ለማስቀጠል ${eligibility.posting_fee} ብር በቴሌብር ወይም በንግድ ባንክ ክፍያ ፈጽመው ደረሰኝ ያያይዙ።` : `You have used your free trial posts. A listing fee of ${eligibility.posting_fee} ETB via Telebirr or CBE is required to publish.`)}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                eligibility.is_free_next 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {eligibility.is_free_next ? (isAmharic ? `${eligibility.free_posts_remaining} ነጻ ቀሪ` : `${eligibility.free_posts_remaining} Free Left`) : (isAmharic ? 'የሚከፈልበት' : 'Paid Post')}
              </span>
            </div>
          </div>
        )}

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-8">
          
          {/* Card 1: Basic Info */}
          <div className="card-obsidian space-y-4 sm:space-y-5 p-4 sm:p-6">
            <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Building className="w-4 h-4 text-amber-500" />
              <span>{t('postCardRentalInfo')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  {t('postLabelCategory')}
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="input-luxury text-sm cursor-pointer"
                >
                  <option value="" className="bg-white text-neutral-900">{isAmharic ? 'የኪራይ ዘርፍ ይምረጡ' : 'Select Category'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white text-neutral-900">
                      {getCategoryTitle(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    {t('postLabelPeriod')}
                  </label>
                  <select
                    name="price_period"
                    value={formData.price_period}
                    onChange={handleChange}
                    className="input-luxury text-sm cursor-pointer"
                  >
                    <option value="month" className="bg-white text-neutral-900">{t('periodMonth')}</option>
                    <option value="day" className="bg-white text-neutral-900">{t('periodDay')}</option>
                    <option value="year" className="bg-white text-neutral-900">{t('periodYear')}</option>
                    <option value="hour" className="bg-white text-neutral-900">{t('periodHour')}</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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
            <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{t('postCardLocation')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  {t('postLabelCity')}
                </label>
                <select
                  value={cityOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCityOption(val);
                    if (val === 'Other') {
                      setFormData((prev) => ({ ...prev, city: customCity.trim() || 'Other' }));
                    } else {
                      setFormData((prev) => ({ ...prev, city: val }));
                    }
                  }}
                  className="input-luxury text-sm cursor-pointer mb-2"
                >
                  <option value="Addis Ababa">{t('cityAddisAbaba')}</option>
                  <option value="Hawassa">{t('cityHawassa')}</option>
                  <option value="Adama">{t('cityAdama')}</option>
                  <option value="Bahir Dar">{t('cityBahirDar')}</option>
                  <option value="Bishoftu">{t('cityBishoftu')}</option>
                  <option value="Mekelle">{t('cityMekelle')}</option>
                  <option value="Dire Dawa">{t('cityDireDawa')}</option>
                  <option value="Gondar">{t('cityGondar')}</option>
                  <option value="Jimma">{t('cityJimma')}</option>
                  <option value="Other">{t('cityOther')}</option>
                </select>

                {cityOption === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder={t('specifyOtherCity')}
                    value={customCity}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomCity(val);
                      setFormData((prev) => ({ ...prev, city: val.trim() || 'Other' }));
                    }}
                    className="input-luxury text-sm animate-in fade-in duration-200"
                    autoFocus
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
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
            <h3 className="text-base font-bold text-neutral-950 flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>{t('postCardImages')}</span>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                {images.length} {isAmharic ? 'ፎቶዎች ተካተዋል' : 'uploaded'}
              </span>
            </h3>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group shadow-2xs">
                  <img src={img.image_url} alt="upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 text-rose-500 hover:text-rose-700 shadow-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 shadow-xs">
                      {isAmharic ? 'ዋና ፎቶ' : 'Cover'}
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Trigger Button */}
              <label className="cursor-pointer aspect-[4/3] rounded-xl border-2 border-dashed border-neutral-300 hover:border-amber-500 bg-neutral-50 hover:bg-neutral-100/70 flex flex-col items-center justify-center text-center p-3 sm:p-4 transition-all">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mb-1.5 sm:mb-2" />
                <span className="text-xs font-semibold text-neutral-800">
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
            <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-3">
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
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center gap-2.5 shadow-2xs ${
                      checked
                        ? 'bg-amber-50 border-amber-500 text-amber-900'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:border-neutral-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${checked ? 'text-amber-600' : 'text-neutral-400'}`} />
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100 pt-5">
            {eligibility ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                {eligibility.free_posts_remaining > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {isAmharic 
                        ? `ይህ ፖስት በነጻ ይለጠፋል (${eligibility.free_posts_remaining} ነጻ ፖስት ይቀራል)` 
                        : `Publishes for free (${eligibility.free_posts_remaining} free post${eligibility.free_posts_remaining === 1 ? '' : 's'} remaining)`}
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {isAmharic 
                        ? `የማስታወቂያ ክፍያ ያስፈልጋል (${eligibility.posting_fee || 200} ብር)` 
                        : `Listing fee required (${eligibility.posting_fee || 200} ETB)`}
                    </span>
                  </span>
                )}
              </div>
            ) : <div />}

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
          accounts={paymentModalData.accounts}
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
