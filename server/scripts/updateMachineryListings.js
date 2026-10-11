import pool from '../config/db.js';

const machineryListings = [
  {
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
  }
];

async function updateMachineryListings() {
  console.log('🔄 Updating Heavy Machinery & Trucks category...');

  try {
    // 1. Find Heavy Machinery Category
    const catRes = await pool.query(
      "SELECT id, name, slug FROM categories WHERE slug IN ('heavy-machinery', 'machinery', 'trucks') OR slug ILIKE '%machin%' LIMIT 1"
    );

    if (catRes.rows.length === 0) {
      console.error('❌ Could not find Heavy Machinery category in DB!');
      process.exit(1);
    }

    const category = catRes.rows[0];
    console.log(`🚜 Target Category: "${category.name}" (ID: ${category.id}, Slug: ${category.slug})`);

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
      console.log(`   ✓ Removed ${oldIds.length} old machinery listings.`);
    }

    // 4. Insert new realistic heavy machinery listings
    for (let i = 0; i < machineryListings.length; i++) {
      const item = machineryListings[i];
      const insertRes = await pool.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 48
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
      const otherImages = machineryListings.filter(m => m.image_url !== item.image_url);
      for (const other of otherImages) {
        await pool.query(
          `INSERT INTO listing_images (listing_id, image_url, is_primary)
           VALUES ($1, $2, false)`,
          [listingId, other.image_url]
        );
      }

      console.log(`   [${i + 1}/${machineryListings.length}] Added machinery listing: "${item.title}"`);
    }

    console.log('🎉 SUCCESS: All heavy machinery listings replaced with new realistic listings!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating machinery listings:', err);
    process.exit(1);
  }
}

updateMachineryListings();
