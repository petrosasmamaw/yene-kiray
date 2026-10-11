import pool from '../config/db.js';

const venueListings = [
  {
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

async function updateVenueListings() {
  console.log('🔄 Updating Event Venues / Bridal Halls category...');

  try {
    // 1. Find Event Venues Category
    const catRes = await pool.query(
      "SELECT id, name, slug FROM categories WHERE slug IN ('event-venues', 'bridal-halls') OR slug ILIKE '%venue%' OR slug ILIKE '%hall%' LIMIT 1"
    );

    if (catRes.rows.length === 0) {
      console.error('❌ Could not find Event Venues / Bridal Hall category in DB!');
      process.exit(1);
    }

    const category = catRes.rows[0];
    console.log(`🏰 Target Category: "${category.name}" (ID: ${category.id}, Slug: ${category.slug})`);

    // 2. Find Owner User
    const userRes = await pool.query('SELECT id, name FROM users ORDER BY id ASC LIMIT 1');
    const ownerId = userRes.rows[0].id;

    // 3. Delete existing listings in this category
    const oldListings = await pool.query('SELECT id FROM listings WHERE category_id = $1', [category.id]);
    const oldIds = oldListings.rows.map(r => r.id);

    if (oldIds.length > 0) {
      console.log(`🗑️ Deleting ${oldIds.length} existing listings in category "${category.name}"...`);

      // Delete references
      await pool.query('DELETE FROM saved_listings WHERE listing_id = ANY($1)', [oldIds]);
      await pool.query('DELETE FROM listing_images WHERE listing_id = ANY($1)', [oldIds]);
      await pool.query('DELETE FROM payments WHERE listing_id = ANY($1)', [oldIds]);
      
      // Delete conversations and messages linked to these listings
      const convs = await pool.query('SELECT id FROM conversations WHERE listing_id = ANY($1)', [oldIds]);
      const convIds = convs.rows.map(c => c.id);
      if (convIds.length > 0) {
        await pool.query('DELETE FROM messages WHERE conversation_id = ANY($1)', [convIds]);
        await pool.query('DELETE FROM conversations WHERE id = ANY($1)', [convIds]);
      }

      await pool.query('DELETE FROM listings WHERE id = ANY($1)', [oldIds]);
      console.log(`   ✓ Removed ${oldIds.length} old venue listings.`);
    }

    // 4. Insert new realistic bridal/venue listings
    for (let i = 0; i < venueListings.length; i++) {
      const item = venueListings[i];
      const insertRes = await pool.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 60
        ) RETURNING id, title`,
        [
          ownerId,
          category.id,
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

      const listingId = insertRes.rows[0].id;

      // Primary image
      await pool.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary)
         VALUES ($1, $2, true)`,
        [listingId, item.image_url]
      );

      // Add other images into gallery for variety
      const otherImages = venueListings.filter(v => v.image_url !== item.image_url);
      for (const other of otherImages) {
        await pool.query(
          `INSERT INTO listing_images (listing_id, image_url, is_primary)
           VALUES ($1, $2, false)`,
          [listingId, other.image_url]
        );
      }

      console.log(`   [${i + 1}/${venueListings.length}] Added bridal/venue listing: "${item.title}"`);
    }

    console.log('🎉 SUCCESS: All bridal hall / event venue listings replaced with new realistic listings!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating venue listings:', err);
    process.exit(1);
  }
}

updateVenueListings();
