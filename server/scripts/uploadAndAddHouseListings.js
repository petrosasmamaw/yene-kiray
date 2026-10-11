import cloudinary from '../config/cloudinary.js';
import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';

const imageFiles = [
  {
    localPath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\.user_uploaded\\media_1791717566600.jpg',
    publicUrl: '/houses/mansion_exterior.jpg',
    tag: 'mansion_exterior',
    title: 'አዲስ የተገነባ ዘመናዊ ጂ+3 ቪላ በቦሌ ብራስ (Ultra-Modern G+3 Luxury Mansion in Bole Brass)',
    description: 'Newly completed architectural masterpiece G+3 executive mansion in the prestigious embassy neighborhood of Bole Brass. Features 6 ensuite bedrooms, multiple panoramic glass balconies, rooftop sky lounge with 360-degree city views, automated security gate, standby generator, and parking for 5 vehicles.',
    rental_price: 180000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole / Brass',
    specific_location: 'Bole Brass, near Japan Embassy',
    contact_phone: '+251 911 234 890',
    features: ['Automated Electric Gate', 'Standby Diesel Generator', '6 Ensuite Bedrooms', 'Rooftop Sky Lounge', 'CCTV & Electric Fence', 'Parking for 5 Vehicles', 'High-Speed Fiber WiFi']
  },
  {
    localPath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\.user_uploaded\\media_1791717566565.jpg',
    publicUrl: '/houses/luxury_living_room.jpg',
    tag: 'luxury_living_room',
    title: 'ቅንጦት ባለ 3 መኝታ ቪአይፒ ፔንትሃውስ በካዛንቺስ (VIP Luxury 3-Bedroom Penthouse in Kazanchis)',
    description: 'Ultra-luxurious fully furnished 3-bedroom penthouse with designer LED tray ceilings, plush Turkish furniture, modern open-concept Italian kitchen, 75-inch smart 4K entertainment center, elevator access, 24/7 power and uninterrupted water.',
    rental_price: 95000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Kazanchis',
    specific_location: 'Kazanchis, walking distance to UNECA and Radisson Blu',
    contact_phone: '+251 912 345 987',
    features: ['Designer Italian Furniture', 'Automatic High-Speed Elevator', '75-inch 4K Home Theater', 'Uninterrupted Water Reserve', '24/7 Security & Keycard Entry', 'Standby Generator']
  },
  {
    localPath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\.user_uploaded\\media_1791717566458.jpg',
    publicUrl: '/houses/home_sauna_spa.jpg',
    tag: 'home_sauna_spa',
    title: 'የግል ሳውና እና እስቲም ያለው ቪላ በኦልድ ኤርፖርት (Executive Villa with Private Sauna & Spa)',
    description: 'Exclusive 5-bedroom residence in Old Airport featuring a private in-home Scandinavian pine sauna, digital glass steam shower, master Jacuzzi suite, serene landscaped yard, maid quarters, and diplomatic security standards.',
    rental_price: 150000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Old Airport',
    specific_location: 'Old Airport, diplomatic zone near ICS',
    contact_phone: '+251 913 888 777',
    features: ['Private Home Pine Sauna', 'Digital Glass Steam Room', 'Master Jacuzzi Ensuite', 'Standby Silent Generator', 'Diplomatic Guard Post', '24/7 High-Security Compound']
  }
];

async function uploadAndAddHouses() {
  console.log('☁️ Processing 3 house images & adding realistic listings to House category...');

  try {
    // 1. Attempt Cloudinary upload for each image
    const processedImages = [];
    for (const item of imageFiles) {
      let finalImageUrl = item.publicUrl;
      console.log(`📤 Uploading image (${item.tag}): ${path.basename(item.localPath)} to Cloudinary...`);
      try {
        const uploadRes = await cloudinary.uploader.upload(item.localPath, {
          folder: 'yene-kiray/houses',
          use_filename: true,
          unique_filename: true,
          resource_type: 'image'
        });
        finalImageUrl = uploadRes.secure_url;
        console.log(`   ✓ Cloudinary upload SUCCESS: ${finalImageUrl}`);
      } catch (cloudErr) {
        console.warn(`   ⚠️ Cloudinary upload returned (${cloudErr.message || cloudErr.http_code || 'error'}).`);
        console.log(`   👉 Using public image URL: ${item.publicUrl}`);
      }

      processedImages.push({
        ...item,
        imageUrl: finalImageUrl
      });
    }

    // 2. Find House Category
    const catRes = await pool.query(
      "SELECT id, name, slug FROM categories WHERE slug IN ('residential-houses', 'houses') OR slug ILIKE '%house%' LIMIT 1"
    );

    if (catRes.rows.length === 0) {
      console.error('❌ Could not find residential/house category in DB!');
      process.exit(1);
    }
    const houseCategory = catRes.rows[0];
    console.log(`🏠 Target Category: "${houseCategory.name}" (ID: ${houseCategory.id})`);

    // 3. Find Owner User
    const userRes = await pool.query('SELECT id, name FROM users ORDER BY id ASC LIMIT 1');
    const ownerId = userRes.rows[0].id;

    // 4. Insert each listing into DB
    for (let i = 0; i < processedImages.length; i++) {
      const item = processedImages[i];

      // Avoid duplicate title insert
      const existing = await pool.query('SELECT id FROM listings WHERE title = $1', [item.title]);
      let listingId;
      if (existing.rows.length > 0) {
        listingId = existing.rows[0].id;
        console.log(`   Updating existing listing: "${item.title}"`);
        await pool.query(
          `UPDATE listings SET 
            description = $1, rental_price = $2, price_period = $3,
            city = $4, subcity = $5, specific_location = $6, contact_phone = $7,
            features = $8, status = 'approved', is_paid = true
           WHERE id = $9`,
          [
            item.description,
            item.rental_price,
            item.price_period,
            item.city,
            item.subcity,
            item.specific_location,
            item.contact_phone,
            JSON.stringify(item.features),
            listingId
          ]
        );
        // Clear previous images for this listing
        await pool.query('DELETE FROM listing_images WHERE listing_id = $1', [listingId]);
      } else {
        const insertRes = await pool.query(
          `INSERT INTO listings (
            user_id, category_id, title, description, rental_price, price_period,
            city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 42
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
        listingId = insertRes.rows[0].id;
      }

      // Primary image
      await pool.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary)
         VALUES ($1, $2, true)`,
        [listingId, item.imageUrl]
      );

      // Add all 3 uploaded images into each listing's gallery
      const otherImages = processedImages.filter(img => img.imageUrl !== item.imageUrl);
      for (const other of otherImages) {
        await pool.query(
          `INSERT INTO listing_images (listing_id, image_url, is_primary)
           VALUES ($1, $2, false)`,
          [listingId, other.imageUrl]
        );
      }

      console.log(`   [${i + 1}/3] Added listing: "${item.title}" (Primary: ${item.imageUrl})`);
    }

    console.log('🎉 SUCCESS: All 3 house listings added successfully to House category!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during script execution:', err);
    process.exit(1);
  }
}

uploadAndAddHouses();
