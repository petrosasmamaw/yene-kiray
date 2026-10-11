import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const realisticCategories = [
  {
    name: 'Residential Houses & Villas',
    slug: 'residential-houses',
    description: 'Furnished luxury villas, modern apartments, family homes, and studios for rent across Ethiopia',
    icon_name: 'Home'
  },
  {
    name: 'Cars & Luxury Vehicles',
    slug: 'cars-vehicles',
    description: 'Chauffeur and self-drive 4x4 SUVs, luxury wedding sedans, and commercial vans',
    icon_name: 'Car'
  },
  {
    name: 'Commercial & Office Spaces',
    slug: 'commercial-offices',
    description: 'Fitted office floors, retail commercial shops, co-working suites, and warehouses',
    icon_name: 'Building2'
  },
  {
    name: 'Heavy Machinery & Trucks',
    slug: 'heavy-machinery',
    description: 'Excavators, mobile cranes, bulldozers, dump trucks, and commercial site power generators',
    icon_name: 'Truck'
  },
  {
    name: 'Event Venues & Reception Halls',
    slug: 'event-venues',
    description: 'Grand wedding reception halls, conference auditoriums, outdoor garden grounds, and party venues',
    icon_name: 'Sparkles'
  }
];

const listingsData = [
  // 1. Residential Houses & Villas (5 listings)
  {
    categorySlug: 'residential-houses',
    title: 'ዘመናዊ ባለ 4 መኝታ ቪላ በቦሌ ቡልቡላ (Modern 4-Bedroom Luxury Villa)',
    description: 'High-end 4-bedroom luxury villa in Bole Bulbula with beautiful interior design, master suite with jacuzzi, modern kitchen, private landscaped compound, 24/7 security guard post, and standby generator.',
    rental_price: 120000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole / Bulbula',
    specific_location: 'Near Bulbula St. George Church',
    contact_phone: '+251 911 234 567',
    features: ['Standby Generator', '24/7 Guard Post', 'Landscaped Garden', 'High-Speed Fiber Internet', 'Water Tank (10kL)', 'Maid Quarters'],
    image_url: 'https://d21tw07c6rnmp0.cloudfront.net/media/uploads/3/residential/2026/5/3_0d7535742a2345d18be1480d94197094_t_w_1440_h_900.avif'
  },
  {
    categorySlug: 'residential-houses',
    title: 'ቅንጦት ባለ 3 መኝታ ኮንዶሚኒየም አፓርታማ በሲኤምሲ (Executive 3-Bedroom Apartment)',
    description: 'Spacious newly-furnished 3-bedroom apartment on the 5th floor with elevator access, city view balcony, fully equipped modern kitchen, dedicated parking, backup generator, and continuous water reserve.',
    rental_price: 65000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Yeka / CMC',
    specific_location: 'CMC Summit, near Michael Roundabout',
    contact_phone: '+251 912 345 678',
    features: ['Automatic Elevator', 'Underground Parking', 'Backup Generator', 'Balcony City View', 'CCTV Security'],
    image_url: 'https://d21tw07c6rnmp0.cloudfront.net/media/uploads/3/residential/2026/5/3_0e916137da6746ee83074aae148a51fd_t_w_1376_h_774.avif'
  },
  {
    categorySlug: 'residential-houses',
    title: 'አስደናቂ ጂ+2 ዘመናዊ መኖሪያ ቤት በኦልድ ኤርፖርት (Executive G+2 Villa in Old Airport)',
    description: 'Magnificent diplomatic-standard G+2 villa featuring 5 ensuite bedrooms, expansive reception salon, open European kitchen plus traditional dirty kitchen, servant quarters, electric fence, and manicured private garden.',
    rental_price: 160000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Old Airport',
    specific_location: 'Old Airport, walking distance to ICS',
    contact_phone: '+251 911 889 900',
    features: ['Diplomatic Security', 'Standby Silent Generator', 'Electric Perimeter Fence', 'Parking for 4 Cars', 'Solar Water Heating'],
    image_url: 'https://d21tw07c6rnmp0.cloudfront.net/media/uploads/3/residential/2026/3/3_72b4e8e07c4c4480a78ebaebc616389f_t_w_1440_h_900.avif'
  },
  {
    categorySlug: 'residential-houses',
    title: 'ሙሉ በሙሉ የተሟላ ዘመናዊ 2 መኝታ አፓርታማ በቦሌ አትላስ (Furnished 2-Bedroom in Bole Atlas)',
    description: 'Chic and modern serviced 2-bedroom apartment with premium Italian furnishings, high-speed WiFi, smart TV, weekly housekeeping, intercom, and secure keycard entry. Ideal for expats and embassy personnel.',
    rental_price: 55000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole / Atlas',
    specific_location: 'Atlas Hotel area, behind Edna Mall',
    contact_phone: '+251 913 456 789',
    features: ['Fully Furnished', 'Weekly Housekeeping', 'High-Speed WiFi', 'Intercom & Keycard Entry', 'Elevator & Parking'],
    image_url: 'https://d21tw07c6rnmp0.cloudfront.net/media/uploads/3/residential/2026/6/3_9677e24a30ab4966874e15d6505e1fa1_t_w_1440_h_900.avif'
  },
  {
    categorySlug: 'residential-houses',
    title: 'ባለ 3 መኝታ ቪላ ቤት በሰፊ ግቢ በሳርቤት (Spacious 3-Bedroom Family Villa in Sarbet)',
    description: 'Family-friendly 3-bedroom villa in tranquil Sarbet residential area. Generous green lawn, ample parking for 5 vehicles, self-contained service quarters, robust water storage, and 24-hour guarded neighborhood.',
    rental_price: 80000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Sarbet',
    specific_location: 'Sarbet near International Evangelical Church',
    contact_phone: '+251 944 112 233',
    features: ['Large Green Compound', 'Parking for 5 Vehicles', 'Water Reserve (8,000L)', 'Quiet Residential Zone', 'Service Quarters'],
    image_url: 'https://d21tw07c6rnmp0.cloudfront.net/media/uploads/3/residential/2026/4/3_0279f3c5e28f4e1382232cb3f5a72b01_t_w_1440_h_900.avif'
  },
  {
    categorySlug: 'residential-houses',
    title: 'አዲስ የተገነባ ዘመናዊ ጂ+3 ቪላ በቦሌ ብራስ (Ultra-Modern G+3 Luxury Mansion in Bole Brass)',
    description: 'Newly completed architectural masterpiece G+3 executive mansion in the prestigious embassy neighborhood of Bole Brass. Features 6 ensuite bedrooms, multiple panoramic glass balconies, rooftop sky lounge with 360-degree city views, automated security gate, standby generator, and parking for 5 vehicles.',
    rental_price: 180000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole / Brass',
    specific_location: 'Bole Brass, near Japan Embassy',
    contact_phone: '+251 911 234 890',
    features: ['Automated Electric Gate', 'Standby Diesel Generator', '6 Ensuite Bedrooms', 'Rooftop Sky Lounge', 'CCTV & Electric Fence', 'Parking for 5 Vehicles', 'High-Speed Fiber WiFi'],
    image_url: '/houses/mansion_exterior.jpg'
  },
  {
    categorySlug: 'residential-houses',
    title: 'ቅንጦት ባለ 3 መኝታ ቪአይፒ ፔንትሃውስ በካዛንቺስ (VIP Luxury 3-Bedroom Penthouse in Kazanchis)',
    description: 'Ultra-luxurious fully furnished 3-bedroom penthouse with designer LED tray ceilings, plush Turkish furniture, modern open-concept Italian kitchen, 75-inch smart 4K entertainment center, elevator access, 24/7 power and uninterrupted water.',
    rental_price: 95000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Kazanchis',
    specific_location: 'Kazanchis, walking distance to UNECA and Radisson Blu',
    contact_phone: '+251 912 345 987',
    features: ['Designer Italian Furniture', 'Automatic High-Speed Elevator', '75-inch 4K Home Theater', 'Uninterrupted Water Reserve', '24/7 Security & Keycard Entry', 'Standby Generator'],
    image_url: '/houses/luxury_living_room.jpg'
  },
  {
    categorySlug: 'residential-houses',
    title: 'የግል ሳውና እና እስቲም ያለው ቪላ በኦልድ ኤርፖርት (Executive Villa with Private Sauna & Spa)',
    description: 'Exclusive 5-bedroom residence in Old Airport featuring a private in-home Scandinavian pine sauna, digital glass steam shower, master Jacuzzi suite, serene landscaped yard, maid quarters, and diplomatic security standards.',
    rental_price: 150000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Old Airport',
    specific_location: 'Old Airport, diplomatic zone near ICS',
    contact_phone: '+251 913 888 777',
    features: ['Private Home Pine Sauna', 'Digital Glass Steam Room', 'Master Jacuzzi Ensuite', 'Standby Silent Generator', 'Diplomatic Guard Post', '24/7 High-Security Compound'],
    image_url: '/houses/home_sauna_spa.jpg'
  },

  // 2. Cars & Luxury Vehicles (5 listings)
  {
    categorySlug: 'cars-vehicles',
    title: 'ቶዮታ ላንድ ክሩዘር ቪ8 (Toyota Land Cruiser V8 Executive VIP)',
    description: 'High-end Toyota Land Cruiser V8 with luxury leather interior, cool box, dual air conditioning, and professional chauffeur option. Available for wedding escorts, diplomatic delegations, and regional safari/project trips.',
    rental_price: 12000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Bole Airport & Hotel delivery',
    contact_phone: '+251 911 556 677',
    features: ['Chauffeur Included', 'Full Comprehensive Insurance', 'Dual AC & Cooler Box', 'Unlimited Mileage in City', 'Airport Pickup Available'],
    image_url: 'https://zerihuncarrent.com/wp-content/uploads/2025/05/WhatsApp-Image-2025-07-20-at-4.58.45-PM-1-1-e1753033938257.jpeg'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'ዘመናዊ ሂዩንዳይ ቱክሰን 2022 አውቶማቲክ (Hyundai Tucson 2022 Auto)',
    description: 'Fuel-efficient, smooth compact SUV with Apple CarPlay, rear camera, push-start ignition, and spacious luggage room. Ideal for daily city commutes, family outings, and weekend getaways.',
    rental_price: 3500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Meskel Square',
    specific_location: 'Meskel Square / Mexico area',
    contact_phone: '+251 912 998 877',
    features: ['Automatic Transmission', 'Apple CarPlay & Android Auto', 'Rear Parking Camera', 'Low Fuel Consumption', 'Clean Interior'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmep2hcR7BFhUenuVH9JliFpV9Ux-2Zsv6u5e4Z67aoA&s=10'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'ቶዮታ ሃይሉክስ ዳብል ካቢን 4x4 (Toyota Hilux Double Cabin 4WD)',
    description: 'Rugged 4WD Toyota Hilux pickup engineered for challenging topography, NGO field missions, construction oversight, and mining projects. Regularly serviced with high ground clearance and heavy-duty suspension.',
    rental_price: 5500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Nifas Silk',
    specific_location: 'Gotera Interchange area',
    contact_phone: '+251 911 776 655',
    features: ['4x4 All-Wheel Drive', 'Heavy Duty Suspension', 'High Clearance', 'Full Field Kit & Spare', 'GPS Tracking'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6FNyYtjNDZuwkyzo54BMZ60lQK5f6hK-xAarHtD2ZZA&s=10'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'መርሴዲስ ቤንዝ ኢ-ክላስ የሰርግ እና ቪአይፒ (Mercedes-Benz E-Class Luxury)',
    description: 'Premium luxury Mercedes-Benz E-Class sedan with pristine black leather interior, ambient lighting, and executive uniformed chauffeur. Perfect for high-profile wedding events, graduation celebrations, and VIP airport hospitality.',
    rental_price: 15000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole / Medhanialem',
    specific_location: 'Bole Medhanialem area',
    contact_phone: '+251 913 223 344',
    features: ['Executive Uniformed Chauffeur', 'Complimentary Ribbon Decor Option', 'Surround Sound Audio', 'Spotless Condition', 'VIP Escort'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbN4tVpIcRLlgKBpvDvxrfVkYVkfjlSIvRD499yXwHRA&s=10'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'ቶዮታ ሃይኤስ ባለ 15 ወንበር ሚኒባስ (Toyota HiAce 15-Seater Van)',
    description: 'Clean, air-conditioned 15-passenger high-roof Toyota HiAce van with ample luggage capacity and reclining seats. Excellent for family vacations, tour groups, staff transport, and airport group transfers.',
    rental_price: 6000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole / Sarbet',
    specific_location: 'Addis Ababa & Out-of-town trips',
    contact_phone: '+251 944 112 233',
    features: ['15 Reclining Seats', 'High-Roof Extra Headroom', 'Rear AC Vents', 'Ample Luggage Compartment', 'Professional Driver'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLT1a88gZiTgnqeTYNNvsb4zpVoJh-ymb-EcrtXi9ZoA&s=10'
  },

  // 3. Commercial & Office Spaces / Shops (4 listings)
  {
    categorySlug: 'commercial-offices',
    title: 'ዘመናዊ የንግድ ሱቅ በቦሌ መድኃኔዓለም ሞል ውስጥ (Modern Retail Shop Space in Bole Medhanialem Mall)',
    description: 'Prime 45 sqm ground-floor retail shop in a high-foot-traffic luxury commercial mall near Bole Medhanialem Cathedral. Features expansive transparent glass frontage, electric security roller shutter, polished porcelain tiled flooring, LED spotlighting, central HVAC ventilation, and standby generator power.',
    rental_price: 68000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole / Medhanialem',
    specific_location: 'Bole Medhanialem, opposite Edna Mall commercial corridor',
    contact_phone: '+251 911 445 566',
    features: ['High Foot-Traffic Mall', 'Full Glass Display Frontage', 'Electric Roller Shutter', 'Standby Generator', '24/7 Security & CCTV', 'Customer Parking'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwAzULNNye3GMrQR6lLA3ErTPMzTiAvYjdAdAMb5FIzA&s=10'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'ሰፊ የንግድ ሱቅ ወይም ሾውሩም በካዛንቺስ ዋና መንገድ (Spacious Commercial Showroom / Store in Kazanchis)',
    description: 'Strategically situated 85 sqm roadside commercial retail showroom on the bustling Kazanchis main avenue. Perfect for boutique clothing, electronics, cosmetics, or premium specialty retail. Equipped with 3-phase commercial electric meter, private washroom, dedicated storage stockroom, and street-level customer access.',
    rental_price: 85000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Kazanchis',
    specific_location: 'Kazanchis Main Road, near UNECA roundabout',
    contact_phone: '+251 912 778 899',
    features: ['Roadside Frontage', '3-Phase Commercial Power', 'Private Restroom & Stockroom', 'High Visibility Signage Space', 'Backup Water Reserve', 'Dedicated Parking'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWi7yuK1eWyYfAhqNgDArZfUwlmoLiYyrYiHltFBuz4w&s=10'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'አዲስ የተጠናቀቀ የንግድ ሱቅ በ22 ማዞሪያ (Newly Finished Retail Shop in 22 Mazoria Commercial Center)',
    description: 'Modern 38 sqm retail shop space located on the 1st floor of a newly inaugurated commercial plaza in 22 Mazoria. Ideal for phone & computer accessories, gift shop, optical center, or salon boutique. Features high-speed elevator access, wide customer corridor, modern fire alarm system, and continuous power backup.',
    rental_price: 48000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Yeka / 22 Mazoria',
    specific_location: '22 Mazoria, next to Golagol Tower',
    contact_phone: '+251 913 223 344',
    features: ['Commercial Plaza 1st Floor', 'High-Speed Elevators', 'Fire Protection & Sprinklers', 'Constant Backup Power', 'Night Guard Security', 'Clean Shared Amenities'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz7pyZiwkaobb_eQDIytDcEQbZlUR0FMM6fCBMptlgHw&s=10'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'ዋና መንገድ ዳር የፋርማሲ ወይም የቡቲክ ሱቅ በሲኤምሲ (Prime Roadside Retail Shop Space in CMC)',
    description: 'Corner-unit 60 sqm commercial space with dual-aspect street visibility along the main CMC residential-commercial highway. Approved for pharmacy, mini-mart, cafe-takeaway, or luxury retail boutique. Complete with wide pedestrian walkway frontage, ample parking spaces, water installation, and heavy commercial foot traffic.',
    rental_price: 75000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'CMC / Michael',
    specific_location: 'CMC Main Avenue, near St. Michael Church commercial hub',
    contact_phone: '+251 911 890 123',
    features: ['Corner Commercial Unit', 'Dual Street Visibility', 'Heavy Neighborhood Traffic', 'Ample Customer Parking', 'Dedicated Water Line', '3-Phase Power'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSswV5W1cYEFPo920oIbo1YpM9A19YGiln5RBc5m0Z5Kg&s=10'
  },

  // 4. Heavy Machinery & Trucks (4 listings)
  {
    categorySlug: 'heavy-machinery',
    title: 'ካተርፒላር 320ዲ ከባድ ኤክስካቫተር (CAT 320D Hydraulic Track Excavator)',
    description: 'Heavy-duty 21-ton hydraulic crawler excavator for foundation excavation, road works, quarrying, and trenching. Equipped with 1.2 m³ heavy-rock bucket, auxiliary piping for hydraulic breaker, low-hour engine, and an experienced certified heavy-equipment operator.',
    rental_price: 35000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Akaki Kaliti',
    specific_location: 'Kaliti Machinery Depot, Ring Road access',
    contact_phone: '+251 911 345 678',
    features: ['1.2 m³ Heavy Rock Bucket', 'Certified Senior Operator Included', 'Hydraulic Breaker Line Ready', 'Dry / Wet Rental Contracts', 'On-Site Field Mechanic Support'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQovuydKuHI4dSzntIJCrdNk2YOt35TJfntwFdmcRMDyA&s=10'
  },
  {
    categorySlug: 'heavy-machinery',
    title: 'ኤስዲኤልጂ 956ኤል ዊል ሎደር (SDLG / CAT 5-Ton Wheel Loader)',
    description: 'High-performance 5-ton wheel loader with 3.0 m³ general purpose bucket. Ideal for batching plants, aggregate loading, gravel, sand handling, and civil site clearing. High fuel efficiency, articulated steering, and immediate Addis Ababa site delivery.',
    rental_price: 28000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole / Bulbula',
    specific_location: 'Bole Lemi Industrial Zone route',
    contact_phone: '+251 912 678 901',
    features: ['3.0 m³ High-Capacity Bucket', '4WD Heavy Articulated Chassis', 'Air-Conditioned Operator Cab', 'Daily & Monthly Lease Rates', 'Licensed Operator Included'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxEqU93-UtjR9O8S9TaurgjkNqXG7uAWJLu2XqQ05UCg&s=10'
  },
  {
    categorySlug: 'heavy-machinery',
    title: 'ሲኖትራክ ሆዎ 20 ሜ.ኪዩብ ገልባጭ መኪና (Sinotruk HOWO 20m³ Dump Truck)',
    description: 'Rugged 6x4 Sinotruk Howo 371HP heavy dump truck with 20 cubic meter reinforced high-tensile steel cargo bed. Perfect for bulk earth transport, stone quarry delivery, asphalt hauling, and construction debris clearing across all Ethiopian regions.',
    rental_price: 16000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Nifas Silk / Lafto',
    specific_location: 'Kality / Hana Mariam transport depot',
    contact_phone: '+251 913 890 234',
    features: ['20m³ Reinforced Steel Bed', '371 HP Turbocharged Intercooled Diesel', '6x4 Heavy-Duty Axles', 'Full Comprehensive Insurance', 'Experienced Professional Chauffeur'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTcm3atGAojaQprBLsEKjfn3HX58uaZP-XiZ7rkw8UrQ&s=10'
  },
  {
    categorySlug: 'heavy-machinery',
    title: 'ካተርፒላር 140ኬ ሞተር ግሬደር (CAT 140K Heavy Road Motor Grader)',
    description: 'Precision Caterpillar 140K motor grader with 14-foot moldboard and rear multi-shank ripper. Essential for road construction, surface leveling, sub-base preparation, embankment slope maintenance, and airport runaway projects. Available for commercial infrastructure tenders.',
    rental_price: 32000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Yeka / Ayat',
    specific_location: 'Ayat Construction Zone, Tafo Road',
    contact_phone: '+251 911 567 890',
    features: ['14-Foot Precision Blade', 'Rear Multi-Shank Ripper & Scarifier', 'Hydraulic Load-Sensing Power', 'Certified Grade Specialist Operator', 'Project-Long Mobilization Ready'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQecQkPCq3p_gS6_iYBk0ZQGo2xEiMMHLnEtghWNXlvjQ&s=10'
  },

  // 5. Event Venues & Reception Halls (4 listings)
  {
    categorySlug: 'event-venues',
    title: 'ግራንድ ሮያል ሰርግና የግብዣ አዳራሽ በቦሌ (Grand Royal Wedding & Banquet Ballroom in Bole)',
    description: 'Breathtaking 800-guest luxury wedding reception hall near Bole Medhanialem. Complete with grand crystal chandeliers, motorized stage lighting, decorated VIP bridal stage, dedicated bridal suite dressing room, high-end audio & PA system, and dedicated parking for 150 vehicles.',
    rental_price: 130000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole / Medhanialem',
    specific_location: 'Bole Medhanialem, next to Atlas commercial district',
    contact_phone: '+251 911 234 567',
    features: ['Capacity: 800 Seated Guests', 'Crystal Chandeliers & Stage Lighting', 'Private Bridal Suite Dressing Room', 'High-Fidelity Audio & DJ Station', 'Parking for 150 Vehicles', 'Standby Heavy Generator'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2n8n3mKAV6ZnWpg4Ve_qfHnejdKADv_iapr0nyj_hWnhWGtgDckP-uv9B&s=10'
  },
  {
    categorySlug: 'event-venues',
    title: 'ሳፋየር ቪአይፒ የሰርግ እና የኮንፈረንስ አዳራሽ በቦሌ (Sapphire VIP Luxury Ballroom in Bole)',
    description: 'Five-star standard hotel banquet ballroom accommodating up to 500 guests. Featuring integrated audio-visual presentation stage, multi-color mood ambient lighting, red carpet aisle, central air conditioning, commercial catering support, and high-security hotel amenities.',
    rental_price: 110000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole / Namibia St',
    specific_location: 'Bole Namibia Street, near Edna Mall',
    contact_phone: '+251 912 345 678',
    features: ['5-Star Hotel Banquet Standard', 'Integrated Audio-Visual Stage', 'Multi-Color LED Mood Lighting', 'Central Climate Control AC', 'Underground Secure Parking', 'Backup Power Generator'],
    image_url: 'https://www.alladdisevents.com/wp-content/uploads/2022/05/Sapphire-Addis-Hotel-8-1080x650.jpg'
  },
  {
    categorySlug: 'event-venues',
    title: 'የሰርግ ሙሽሮች መድረክ እና የደስታ አዳራሽ በሲኤምሲ (Elegant Bridal Reception Hall with Decorated Stage in CMC)',
    description: 'Charming and beautifully decorated bridal hall for up to 450 guests. Highlights include a raised bridal throne stage (Manber) with floral backdrop, red carpet aisle, professional acoustics and lighting, bride and groom preparation rooms, and safe enclosed compound.',
    rental_price: 85000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'CMC / Michael',
    specific_location: 'CMC Main Avenue, near St. Michael Church',
    contact_phone: '+251 913 456 789',
    features: ['Decorated Bridal Stage (Manber)', 'Red Carpet Central Walkway', 'Professional Acoustics & Lighting', 'Bride & Groom Dressing Rooms', '24/7 Security & Standby Power', 'Dedicated Buffet Station'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5uvoPKRY89cD9lEOLctyRfdrDEFEmccZFAzArchPLga6CTCyslBlgyks&s=10'
  },
  {
    categorySlug: 'event-venues',
    title: 'ሮማንቲክ የሰርግ እና የብርይዳል ሻወር አዳራሽ በሳርቤት (Romantic Bridal & Engagement Celebration Hall in Sarbet)',
    description: 'Intimate boutique celebration hall for 250-350 guests, ideal for modern weddings, bridal showers, and engagement ceremonies. Features fairytale fairy-light curtain backdrop, round banquet tables with fine linen, photo-shoot selfie zones, and spacious green yard.',
    rental_price: 65000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Sarbet',
    specific_location: 'Sarbet, near International Evangelical Church',
    contact_phone: '+251 911 889 900',
    features: ['Fairy-Light Curtain Backdrop', 'Photo-Shoot Selfie Zones', 'Round Banquet Tables with Linen', 'Sound & Mic System Included', 'Quiet Garden Compound with Parking', 'Kitchen & Buffet Area'],
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_VzVz4yb1h1v-9SCvKlsZvbo8jxNNZjrcgFTydaHy3T51Rjgwm-YvT1Ja&s=10'
  }
];

async function seedRealisticData() {
  console.log('🚀 Starting realistic 5-category and 25-listing seed for የኔ ኪራይ...');

  try {
    // 1. Get or confirm the admin user
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
    const userRes = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [adminEmail]);

    if (userRes.rows.length === 0) {
      console.error(`❌ Admin user "${adminEmail}" not found. Please run "npm run seed:admin" first.`);
      process.exit(1);
    }

    const adminUserId = userRes.rows[0].id;
    console.log(`👤 Using Admin User: ${userRes.rows[0].name} (${userRes.rows[0].email}) - ID: ${adminUserId}`);

    // 2. Ensure the 5 Categories exist (and deactivate any old extra ones)
    console.log('📦 Upserting 5 realistic categories...');
    const categoryMap = {}; // slug -> id

    // Deactivate all old categories first to ensure ONLY these 5 appear
    await pool.query('UPDATE categories SET is_active = false');

    for (const cat of realisticCategories) {
      const catRes = await pool.query(
        `INSERT INTO categories (name, slug, description, icon_name, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             description = EXCLUDED.description,
             icon_name = EXCLUDED.icon_name,
             is_active = true
         RETURNING id, name, slug`,
        [cat.name, cat.slug, cat.description, cat.icon_name]
      );
      categoryMap[cat.slug] = catRes.rows[0].id;
      console.log(`  ✓ Category active: "${cat.name}" (ID: ${catRes.rows[0].id})`);
    }

    // 3. Clean up existing listings to ensure clean, authentic 5-per-category showcase
    console.log('🧹 Purging outdated demo listings...');
    await pool.query('DELETE FROM listings WHERE user_id = $1', [adminUserId]);

    // 4. Insert 25 realistic listings (5 in each of the 5 categories)
    console.log(`📝 Inserting ${listingsData.length} realistic listings...`);

    let count = 0;
    for (const item of listingsData) {
      const categoryId = categoryMap[item.categorySlug];
      if (!categoryId) {
        console.warn(`⚠️ Warning: Category not found for slug ${item.categorySlug}`);
        continue;
      }

      // Insert listing
      const listingRes = await pool.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 12
        ) RETURNING id, title`,
        [
          adminUserId,
          categoryId,
          item.title,
          item.description,
          item.rental_price,
          item.price_period,
          item.city,
          item.subcity,
          item.specific_location,
          item.contact_phone,
          JSON.stringify(item.features)
        ]
      );

      const listingId = listingRes.rows[0].id;

      // Insert primary image into listing_images
      await pool.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary)
         VALUES ($1, $2, true)`,
        [listingId, item.image_url]
      );

      count++;
      console.log(`  [${count}/25] Inserted: "${item.title}" in [${item.categorySlug}]`);
    }

    console.log('===============================================================');
    console.log(`🎉 SUCCESS: 5 Categories and ${count} Realistic Listings Seeded!`);
    console.log('===============================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed realistic data:', error.message);
    process.exit(1);
  }
}

seedRealisticData();
