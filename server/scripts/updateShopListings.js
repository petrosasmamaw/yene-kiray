import pool from '../config/db.js';

const shopListings = [
  {
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
  }
];

async function updateShopListings() {
  console.log('🔄 Updating Shop / Commercial listings...');

  try {
    // 1. Find Commercial & Office Spaces Category
    const catRes = await pool.query(
      "SELECT id, name, slug FROM categories WHERE slug IN ('commercial-offices', 'commercial', 'shops') OR slug ILIKE '%commercial%' LIMIT 1"
    );

    if (catRes.rows.length === 0) {
      console.error('❌ Could not find Commercial / Shop category in DB!');
      process.exit(1);
    }

    const category = catRes.rows[0];
    console.log(`🏬 Target Category: "${category.name}" (ID: ${category.id}, Slug: ${category.slug})`);

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
      console.log(`   ✓ Removed ${oldIds.length} old listings.`);
    }

    // 4. Insert new realistic shop listings
    for (let i = 0; i < shopListings.length; i++) {
      const item = shopListings[i];
      const insertRes = await pool.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 55
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
      const otherImages = shopListings.filter(s => s.image_url !== item.image_url);
      for (const other of otherImages) {
        await pool.query(
          `INSERT INTO listing_images (listing_id, image_url, is_primary)
           VALUES ($1, $2, false)`,
          [listingId, other.image_url]
        );
      }

      console.log(`   [${i + 1}/${shopListings.length}] Added shop listing: "${item.title}"`);
    }

    console.log('🎉 SUCCESS: All shop/commercial listings replaced with new realistic listings!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating shop listings:', err);
    process.exit(1);
  }
}

updateShopListings();
