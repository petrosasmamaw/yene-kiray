import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const newHouseListings = [
  {
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
  }
];

async function updateHouseListings() {
  console.log('🔄 Starting house category listings replacement...');
  try {
    // 1. Find the house/residential category
    const catRes = await pool.query(
      "SELECT id, name, slug FROM categories WHERE slug IN ('residential-houses', 'houses') OR slug ILIKE '%house%' LIMIT 1"
    );

    if (catRes.rows.length === 0) {
      console.error('❌ Could not find residential/house category in DB!');
      process.exit(1);
    }

    const houseCategory = catRes.rows[0];
    console.log(`🏠 Found Category: "${houseCategory.name}" (Slug: ${houseCategory.slug}, ID: ${houseCategory.id})`);

    // 2. Find any admin user or default user to own these posts
    const userRes = await pool.query('SELECT id, name, email FROM users ORDER BY id ASC LIMIT 1');
    if (userRes.rows.length === 0) {
      console.error('❌ No users found in database to assign listings to.');
      process.exit(1);
    }
    const ownerId = userRes.rows[0].id;
    console.log(`👤 Assigned Owner: ${userRes.rows[0].name} (ID: ${ownerId})`);

    // 3. Find and delete all existing listings in house category
    const oldListings = await pool.query(
      'SELECT id, title FROM listings WHERE category_id = $1',
      [houseCategory.id]
    );

    console.log(`🗑️ Deleting ${oldListings.rows.length} existing listings in House category...`);
    for (const row of oldListings.rows) {
      // Clean up saved_listings and listing_images
      await pool.query('DELETE FROM saved_listings WHERE listing_id = $1', [row.id]);
      await pool.query('DELETE FROM listing_images WHERE listing_id = $1', [row.id]);
      await pool.query('DELETE FROM listings WHERE id = $1', [row.id]);
      console.log(`   ✓ Deleted old post: "${row.title}" (ID: ${row.id})`);
    }

    // 4. Insert the 5 new realistic house listings using the provided CloudFront images
    console.log(`✨ Inserting 5 new realistic house listings with user-provided images...`);
    for (let i = 0; i < newHouseListings.length; i++) {
      const item = newHouseListings[i];
      const insertRes = await pool.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 18
        ) RETURNING id, title`,
        [
          ownerId,
          houseCategory.id,
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

      console.log(`   [${i + 1}/5] Added: "${item.title}" -> ${item.image_url.slice(0, 75)}...`);
    }

    console.log('✅ All 5 house listings successfully replaced!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating house listings:', error);
    process.exit(1);
  }
}

updateHouseListings();
