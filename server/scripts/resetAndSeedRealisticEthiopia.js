import pool from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const categoriesToSeed = [
  {
    name: 'Residential Houses & Villas',
    slug: 'residential-houses',
    description: 'Furnished luxury villas, modern apartments, family homes, and studios for rent across Ethiopia',
    icon_name: 'Home',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cars & Luxury Vehicles',
    slug: 'cars-vehicles',
    description: 'Chauffeur and self-drive 4x4 SUVs, luxury wedding sedans, and commercial vans',
    icon_name: 'Car',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Commercial & Office Spaces',
    slug: 'commercial-offices',
    description: 'Fitted office floors, retail commercial shops, co-working suites, and warehouses',
    icon_name: 'Building2',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Heavy Machinery & Trucks',
    slug: 'heavy-machinery',
    description: 'Excavators, mobile cranes, bulldozers, dump trucks, and commercial site power generators',
    icon_name: 'Truck',
    image_url: 'https://images.unsplash.com/photo-1579847188804-ecba0e2ea330?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Event Venues & Reception Halls',
    slug: 'event-venues',
    description: 'Grand wedding reception halls, conference auditoriums, outdoor garden grounds, and party venues',
    icon_name: 'Sparkles',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Tools & Everyday Equipment',
    slug: 'tools-equipment',
    description: 'Professional cinematography cameras, concert audio sound systems, and industrial power tools',
    icon_name: 'Wrench',
    image_url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80'
  }
];

const imageMapping = {
  'Modern 2-Bedroom Furnished Apartment in Bole Atlas':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCFJ27JekM0gv_L8YikXgHs_bgtB6Djl6FAvwuQHBzfA&s=10',

  'Suzuki Dzire (2023) - Fuel Efficient Daily Rental':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9QLZQvdgCFZRR5rFD5IlDras9GLArHdMi8nEtl7Z9Kw&s',

  'Executive 4-Bedroom Furnished Villa in Old Airport':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOOmAdzWnLZsxBv3ZpAwexrMhrK-R_D5h9un8Sz8vmQg&s=10',

  'CAT 320 Hydraulic Excavator with Certified Operator':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIuOHPAbNSe46sMLwMuDUBgACOBKtp6SlZfPSXKwyQpQ&s=10',

  'Grand Royal Ballroom for Weddings & Banquets (800 Guests)':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaGDco6dbnk1fR-h-kCGVBJHJfWaboDoOqUb-c9xs1Ew&s=10',

  'Secure Industrial Warehouse (600 sqm) in Kality':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnRFC3U2ozfektXYXLLZfaYiC5aM5Xw9Ne_rjeKSNXLg&s=10',

  'Bosch Heavy-Duty Demolition Hammer & Concrete Core Drill':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTAzmcWbdEVLCRlteS-lVOOEzlsZ2d6fzfo--M35eaWQ&s=10',

  'Spacious 3-Bedroom Family Home in CMC Michael':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfsBXzO9u_jcg5wFbvObm4obknaSRdiQB02wnPAZ6oMw&s=10',

  'Sinotruk Howo Dump Truck (16 CBM) for Earthmoving':
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',

  'Lush Green Garden Venue for Outdoor Weddings in Bisrate Gabriel':
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',

  'Toyota HiAce Van (14-Seater) for Tours & Group Travel':
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',

  '150 kVA Cummins Silent Standby Generator':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3uUOhbD1xztRU4W3Ko5t0rmD77lrDcYlqcyBRx_HHnA&s=10',

  'Retail Ground-Floor Showroom (120 sqm) in Kazanchis':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqN1DTaRTnEJY_LlKUcdtylR6fk5tSVgUaA5jxlSKs0A&s=10',

  'Toyota Land Cruiser V8 (2022) with Professional Driver':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXABxnHEiXWPWkKF3bkQqmWjC7QR-iXbP8JUg6AmgAPQ&s=10',

  'Sony FX3 Cinema Camera + GM Prime Lens Kit for Production':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7KeZCkSrFuDgS6D7WxrV6pVGjvWUrJelx_-AKL5IZ4Q&s=10',

  'JBL Line Array Concert Sound System + Digital Mixer':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcQCz4w0XMMmRxuA3iBGBLLFtkDYVcZZR6-xIOFTMJvg&s=10',

  'Modern Corporate Auditorium & Conference Center in Kazanchis':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFJ2f_UbE1wITrqUF5077KJkOOYkvRQjwkrRl1U8QobQ&s=10',

  'Prime Fitted Office Floor (280 sqm) on Bole Road':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn1AHdSeFWLkxo2fTs68FBUMcZJz2ky5UnFBC2h2OGNg&s'
};

const realisticListings = [
  // --- Category 1: Residential Houses & Villas (3 listings) ---
  {
    categorySlug: 'residential-houses',
    title: 'Executive 4-Bedroom Furnished Villa in Old Airport',
    description: 'Modern luxury G+2 residence in the secure diplomatic quarter of Old Airport. Includes master suite with jacuzzi & walk-in closet, high-end fitted kitchen, private garden, maid quarters, 35kVA silent backup generator, and 10,000L water reserve.',
    rental_price: 150000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Old Airport',
    specific_location: 'Near ICS (International Community School)',
    contact_phone: '+251911234567',
    features: ['Standby Generator', '24/7 Security Guard', 'Landscaped Garden', 'High-Speed WiFi', 'Water Reserve Tank (10kL)', 'Maid Quarters'],
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'residential-houses',
    title: 'Modern 2-Bedroom Furnished Apartment in Bole Atlas',
    description: 'Bright and spacious 4th-floor furnished apartment with elevator, panoramic balcony view, modern open-plan kitchen, 24/7 building security, dedicated basement parking, and uninterrupted generator power.',
    rental_price: 48000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole / Atlas',
    specific_location: 'Behind Edna Mall & Medhanialem',
    contact_phone: '+251911456789',
    features: ['Elevator Access', 'Dedicated Parking', 'Backup Generator', 'Water Tank', 'Security Camera & Guard', 'Furnished'],
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'residential-houses',
    title: 'Spacious 3-Bedroom Family Home in CMC Michael',
    description: 'Family compound located in a quiet gated neighborhood in CMC. Features 3 bedrooms, 2 bathrooms, cozy living salon, modern kitchen, compound parking for 3 cars, reserve water tanker, and guard room.',
    rental_price: 35000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Yeka / CMC Michael',
    specific_location: 'Near St. Michael Church',
    contact_phone: '+251912345678',
    features: ['Gated Compound', 'Parking for 3 Cars', 'Water Tanker (5kL)', 'Balcony', 'Quiet Residential Area'],
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },

  // --- Category 2: Cars & Luxury Vehicles (3 listings) ---
  {
    categorySlug: 'cars-vehicles',
    title: 'Toyota Land Cruiser V8 (2022) with Professional Driver',
    description: 'VIP executive 4WD Land Cruiser V8 for diplomatic missions, safari expeditions, wedding escorts, or corporate transport. Equipped with leather seating, climate control, GPS, comprehensive insurance, and an experienced bilingual driver.',
    rental_price: 14000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Bole International Airport & Citywide',
    contact_phone: '+251911876543',
    features: ['Chauffeur Included', 'Comprehensive Insurance', 'Unlimited City Mileage', 'A/C & Climate Control', '4WD Capability'],
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'Suzuki Dzire (2023) - Fuel Efficient Daily Rental',
    description: 'Mint condition compact sedan, perfect for economical city commuting and errands around Addis Ababa. Excellent fuel economy, cold A/C, Bluetooth audio, clean interior, and flexible daily/weekly rates.',
    rental_price: 2800,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Kazanchis',
    specific_location: 'Kazanchis Commercial District',
    contact_phone: '+251913456789',
    features: ['Self-Drive Available', 'Low Fuel Consumption', 'Bluetooth Audio', 'Cold A/C', 'Full Tank Delivery'],
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'Toyota HiAce Van (14-Seater) for Tours & Group Travel',
    description: 'Reliable 14-passenger minibus ideal for family trips to Bishoftu/Hawassa, airport group shuttles, church events, or company team transportation. Includes high roof, roof rack for luggage, and professional driver.',
    rental_price: 7500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Yeka / Megenagna',
    specific_location: 'Near Megenagna Roundabout',
    contact_phone: '+251911987654',
    features: ['14 Comfortable Seats', 'Luggage Roof Rack', 'Driver Included', 'Out of Town Allowed', 'Full Maintenance'],
    image_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80'
  },

  // --- Category 3: Commercial & Office Spaces (3 listings) ---
  {
    categorySlug: 'commercial-offices',
    title: 'Prime Fitted Office Floor (280 sqm) on Bole Road',
    description: 'Ready-to-move corporate office space on the 5th floor of a high-profile glass commercial tower. Features 4 partitioned executive cabins, open workstation area for 25 staff, board meeting room, dedicated fiber-optic internet, and high-speed elevators.',
    rental_price: 195000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Cameroon Street, Next to Edna Mall',
    contact_phone: '+251911223344',
    features: ['24/7 Generator', 'Dual Elevators', 'Underground Parking', 'Fiber Optic Line', 'Fire Suppression System', 'Security Desk'],
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'Retail Ground-Floor Showroom (120 sqm) in Kazanchis',
    description: 'High-visibility commercial ground-floor shop with double glass frontage facing the main avenue. Ideal for bank branch, pharmacy, boutique showroom, or upscale cafe. High foot traffic zone with ample customer parking.',
    rental_price: 95000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Kazanchis',
    specific_location: 'Near UNECA & Intercontinental',
    contact_phone: '+251911556677',
    features: ['Main Road Frontage', 'Glass Facade', 'Dedicated Restroom', 'Heavy Foot Traffic', 'Customer Parking'],
    image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'Secure Industrial Warehouse (600 sqm) in Kality',
    description: 'High-ceiling storage warehouse equipped with wide trailer access, reinforced concrete flooring, 3-phase commercial electric power, 24/7 guard compound, and office annex for warehouse management staff.',
    rental_price: 140000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Akaki-Kality',
    specific_location: 'Near Kality Ring Road Interchange',
    contact_phone: '+251911334455',
    features: ['3-Phase Industrial Power', 'Trailer Truck Loading Bay', '24/7 Guarded Gate', 'Office Annex', 'High Clearance Ceiling'],
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
  },

  // --- Category 4: Heavy Machinery & Trucks (3 listings) ---
  {
    categorySlug: 'heavy-machinery',
    title: 'CAT 320 Hydraulic Excavator with Certified Operator',
    description: 'Heavy-duty 20-ton tracked hydraulic excavator available for foundation excavation, road construction, land clearing, and demolition. Supplied with certified operator and on-site maintenance support. Fuel arrangement flexible.',
    rental_price: 28000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Akaki-Kality',
    specific_location: 'Gelan & Addis Ababa Surrounding Sites',
    contact_phone: '+251911778899',
    features: ['Certified Operator', 'Standard Heavy Bucket', 'Fast Cycle Time', 'Daily Maintenance Support', 'Ready on Lowbed Delivery'],
    image_url: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'heavy-machinery',
    title: 'Sinotruk Howo Dump Truck (16 CBM) for Earthmoving',
    description: 'Heavy 6x4 tipper truck in prime mechanical condition for transporting gravel, quarry stone, excavation soil, and red sand. Driver included. Available for short or long-term infrastructure contracts.',
    rental_price: 16500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole / Bulbula',
    specific_location: 'Bole Bulbula Ring Road Zone',
    contact_phone: '+251911445566',
    features: ['16 Cubic Meter Capacity', '6x4 Heavy Axles', 'Experienced Driver', 'Continuous Shift Capability', 'Inter-city Permitted'],
    image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'heavy-machinery',
    title: '150 kVA Cummins Silent Standby Generator',
    description: 'Containerized ultra-silent 150 kVA industrial diesel generator. Essential for construction sites, wedding outdoor celebrations, corporate events, and hotel backup emergencies. Integrated automatic transfer switch (ATS).',
    rental_price: 18000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Nifas Silk-Lafto / Sarbet',
    specific_location: 'Near AU Headquarters & Sarbet',
    contact_phone: '+251911667788',
    features: ['Soundproof Canopy', 'ATS Controller', 'Technician Included', 'Fuel Tank (350L)', 'Towing Trailer Mount'],
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  },

  // --- Category 5: Event Venues & Reception Halls (3 listings) ---
  {
    categorySlug: 'event-venues',
    title: 'Grand Royal Ballroom for Weddings & Banquets (800 Guests)',
    description: 'Opulent banquet hall featuring crystal chandeliers, red carpet entrance, LED mood lighting, VIP dressing suites, full acoustic sound system, and spacious parking for over 150 vehicles. Fits up to 800 guests banquet-style.',
    rental_price: 120000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Near Medhanialem Cathedral',
    contact_phone: '+251911122334',
    features: ['Acoustic Sound System', '800 Guest Capacity', 'VIP Dressing Suites', 'Standby Generator', '150+ Car Parking', 'Commercial Kitchen'],
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'event-venues',
    title: 'Lush Green Garden Venue for Outdoor Weddings in Bisrate Gabriel',
    description: 'Exquisite landscaped botanical garden with mature palm trees, water fountain photo backdrop, luxury marquee tents, paved walkways, and bridal dressing pavilion. Perfect for romantic Ethiopian weddings, birthdays, and anniversaries.',
    rental_price: 85000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Bisrate Gabriel',
    specific_location: 'Behind Bisrate Gabriel Church',
    contact_phone: '+251911889900',
    features: ['Photogenic Water Feature', 'Marquee Tent Setup', 'Bridal Changing Room', 'Green Grass Lawn', '500 Guest Capacity'],
    image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'event-venues',
    title: 'Modern Corporate Auditorium & Conference Center in Kazanchis',
    description: 'State-of-the-art tiered auditorium seating 350 attendees. Features high-lumen 4K projection screens, translation booths, wireless podium microphones, breakout coffee lounge, and high-speed live-streaming fiber internet.',
    rental_price: 65000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Kazanchis',
    specific_location: 'Menelik II Avenue',
    contact_phone: '+251911990011',
    features: ['4K Laser Projector', 'Simultaneous Translation Booths', 'Tiered Theater Seating', 'High-Speed WiFi', 'Lounge / Catering Area'],
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
  },

  // --- Category 6: Tools & Everyday Equipment (3 listings) ---
  {
    categorySlug: 'tools-equipment',
    title: 'Sony FX3 Cinema Camera + GM Prime Lens Kit for Production',
    description: 'Complete professional cinematography package for music videos, commercials, and Ethiopian wedding shoots. Includes Sony FX3 full-frame body, 24-70mm f/2.8 GM lens, DJI RS3 Pro gimbal stabilizer, 4 batteries, and 160GB CFexpress cards.',
    rental_price: 8500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Near Dembel City Center',
    contact_phone: '+251911221144',
    features: ['4K 120fps Cinema Line', 'DJI RS3 Pro Gimbal', '24-70mm f/2.8 GM Lens', '4 Batteries & Dual Charger', 'Protective Pelican Case'],
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'tools-equipment',
    title: 'JBL Line Array Concert Sound System + Digital Mixer',
    description: 'High-impact sound reinforcement system for live concerts, religious conferences, and grand ceremonies. Includes 4 line-array top speakers, 4 subwoofers, Behringer X32 digital mixer, wireless Shure microphones, and audio sound engineer.',
    rental_price: 35000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole / Gerji',
    specific_location: 'Imperial Hotel Junction',
    contact_phone: '+251911332211',
    features: ['Sound Engineer Included', 'Behringer X32 Mixer', '4 Shure Wireless Mics', 'Heavy Bass Subwoofers', 'Full Cabling & Stands'],
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'tools-equipment',
    title: 'Bosch Heavy-Duty Demolition Hammer & Concrete Core Drill',
    description: 'High-powered industrial rotary hammer breaker for concrete chipping, wall chasing, and plumbing/electrical installation work. Includes flat and pointed chisels, safety goggles, and heavy-duty extension cord.',
    rental_price: 4000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Yeka / Megenagna',
    specific_location: 'Gurd Shola Industrial Area',
    contact_phone: '+251911776655',
    features: ['Heavy-Duty Breaker', 'Set of Chisels Included', 'Safety Gear Provided', 'Heavy Extension Reel', 'Delivery Available'],
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80'
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting complete database cleanup and Ethiopian realistic data seeding...');

    await client.query('BEGIN');

    // 1. Delete all existing chat messages and conversations
    console.log('🧹 1. Deleting all existing chat messages and conversations...');
    await client.query('DELETE FROM messages');
    await client.query('DELETE FROM conversations');

    // 2. Delete all existing rental posts and associated records
    console.log('🧹 2. Deleting all existing rental posts, bookmarks, payments & images...');
    await client.query('DELETE FROM saved_listings');
    await client.query('DELETE FROM payments');
    await client.query('DELETE FROM listing_images');
    await client.query('DELETE FROM listings');

    // 3. Clean up rogue or duplicate test categories
    console.log('🧹 3. Removing invalid or duplicate test categories...');
    await client.query("DELETE FROM categories WHERE slug LIKE 'luxury-yachts%'");

    // 4. Ensure standard categories exist and are active with appropriate metadata
    console.log('📁 4. Ensuring clean 6 categories with high-res images...');
    const categoryMap = {}; // slug -> id

    for (const cat of categoriesToSeed) {
      const existing = await client.query('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
      let catId;
      if (existing.rows.length > 0) {
        catId = existing.rows[0].id;
        await client.query(
          `UPDATE categories 
           SET name = $1, description = $2, icon_name = $3, image_url = $4, is_active = true 
           WHERE id = $5`,
          [cat.name, cat.description, cat.icon_name, cat.image_url, catId]
        );
      } else {
        const inserted = await client.query(
          `INSERT INTO categories (name, slug, description, icon_name, image_url, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING id`,
          [cat.name, cat.slug, cat.description, cat.icon_name, cat.image_url]
        );
        catId = inserted.rows[0].id;
      }
      categoryMap[cat.slug] = catId;
    }

    // 5. Find a representative user (Petros or first active user)
    const usersRes = await client.query("SELECT id, name, email FROM users ORDER BY created_at ASC");
    if (!usersRes.rows.length) {
      throw new Error('No user accounts found in the database. Please register or seed users first.');
    }
    const defaultOwnerId = usersRes.rows[0].id;
    console.log(`👤 Using user account for listings: ${usersRes.rows[0].name} (${usersRes.rows[0].email})`);

    // 6. Insert exactly 3 realistic Ethiopian listings per category
    console.log('✨ 5. Seeding 3 realistic listings for each category (18 total)...');
    let count = 0;

    for (const item of realisticListings) {
      const categoryId = categoryMap[item.categorySlug];
      if (!categoryId) {
        console.warn(`Category not found for slug: ${item.categorySlug}`);
        continue;
      }

      // Distribute owners between users if multiple exist
      const ownerIndex = count % usersRes.rows.length;
      const ownerId = usersRes.rows[ownerIndex].id;

      const listingRes = await client.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, $12)
        RETURNING id`,
        [
          ownerId,
          categoryId,
          item.title,
          item.description,
          item.rental_price,
          item.price_period,
          item.city,
          item.subcity,
          item.specific_location,
          item.contact_phone,
          JSON.stringify(item.features),
          Math.floor(Math.random() * 85) + 12
        ]
      );

      const listingId = listingRes.rows[0].id;

      // Primary image
      const primaryImageUrl = imageMapping[item.title] || item.image_url;
      await client.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary)
         VALUES ($1, $2, true)`,
        [listingId, primaryImageUrl]
      );

      count++;
    }

    await client.query('COMMIT');
    console.log(`✅ SUCCESS: Deleted all previous chat & posts. Successfully seeded ${count} realistic Ethiopian rental listings (3 per category)!`);
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to reset and seed database:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

run();
