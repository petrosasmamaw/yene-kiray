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
    'data:image/jpeg;base64,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',

  'Toyota HiAce Van (14-Seater) for Tours & Group Travel':
    'data:image/jpeg;base64,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',

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
