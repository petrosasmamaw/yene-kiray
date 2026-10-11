import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const newCarListings = [
  {
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
  }
];

async function updateCarListings() {
  console.log('🔄 Starting car category listings replacement...');
  try {
    // 1. Find the cars & vehicles category
    const catRes = await pool.query(
      "SELECT id, name, slug FROM categories WHERE slug IN ('cars-vehicles', 'cars') OR slug ILIKE '%car%' OR name ILIKE '%car%' LIMIT 1"
    );

    if (catRes.rows.length === 0) {
      console.error('❌ Could not find car/vehicle category in DB!');
      process.exit(1);
    }

    const carCategory = catRes.rows[0];
    console.log(`🚗 Found Category: "${carCategory.name}" (Slug: ${carCategory.slug}, ID: ${carCategory.id})`);

    // 2. Find any admin user or default user to own these posts
    const userRes = await pool.query('SELECT id, name, email FROM users ORDER BY id ASC LIMIT 1');
    if (userRes.rows.length === 0) {
      console.error('❌ No users found in database to assign listings to.');
      process.exit(1);
    }
    const ownerId = userRes.rows[0].id;
    console.log(`👤 Assigned Owner: ${userRes.rows[0].name} (ID: ${ownerId})`);

    // 3. Find and delete all existing listings in car category
    const oldListings = await pool.query(
      'SELECT id, title FROM listings WHERE category_id = $1',
      [carCategory.id]
    );

    console.log(`🗑️ Deleting ${oldListings.rows.length} existing listings in Car category...`);
    for (const row of oldListings.rows) {
      // Clean up saved_listings and listing_images
      await pool.query('DELETE FROM saved_listings WHERE listing_id = $1', [row.id]);
      await pool.query('DELETE FROM listing_images WHERE listing_id = $1', [row.id]);
      await pool.query('DELETE FROM listings WHERE id = $1', [row.id]);
      console.log(`   ✓ Deleted old car post: "${row.title}" (ID: ${row.id})`);
    }

    // 4. Insert the 5 new realistic car listings using the provided images
    console.log(`✨ Inserting 5 new realistic car listings with user-provided images...`);
    for (let i = 0; i < newCarListings.length; i++) {
      const item = newCarListings[i];
      const insertRes = await pool.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 24
        ) RETURNING id, title`,
        [
          ownerId,
          carCategory.id,
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

      const newListingId = insertRes.rows[0].id;

      // Add image to listing_images
      await pool.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary)
         VALUES ($1, $2, true)`,
        [newListingId, item.image_url]
      );

      console.log(`   [${i + 1}/5] Added: "${item.title}" -> ${item.image_url.slice(0, 65)}...`);
    }

    console.log('✅ All 5 car listings successfully replaced!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating car listings:', error);
    process.exit(1);
  }
}

updateCarListings();
