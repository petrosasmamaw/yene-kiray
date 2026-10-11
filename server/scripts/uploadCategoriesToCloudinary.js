import cloudinary from '../config/cloudinary.js';
import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';

const categoryUploads = [
  {
    slug: 'residential-houses',
    filePath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_houses_1791707315964.jpg',
    publicId: 'yene_kiray_cat_residential_houses'
  },
  {
    slug: 'cars-vehicles',
    filePath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_cars_1791707339709.jpg',
    publicId: 'yene_kiray_cat_cars_vehicles'
  },
  {
    slug: 'commercial-offices',
    filePath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_offices_1791707358654.jpg',
    publicId: 'yene_kiray_cat_commercial_offices'
  },
  {
    slug: 'heavy-machinery',
    filePath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_machinery_1791707388158.jpg',
    publicId: 'yene_kiray_cat_heavy_machinery'
  },
  {
    slug: 'event-venues',
    filePath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_venues_1791707412454.jpg',
    publicId: 'yene_kiray_cat_event_venues'
  },
  {
    slug: 'tools-equipment',
    filePath: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_tools_1791707448400.jpg',
    publicId: 'yene_kiray_cat_tools_equipment'
  }
];

async function runUpload() {
  console.log('🚀 Starting Cloudinary uploads for categories...');
  
  for (const item of categoryUploads) {
    if (!fs.existsSync(item.filePath)) {
      console.error(`❌ File not found: ${item.filePath}`);
      continue;
    }

    try {
      console.log(`📤 Uploading ${item.slug} to Cloudinary...`);
      const uploadRes = await cloudinary.uploader.upload(item.filePath, {
        folder: 'yene_kiray/categories',
        public_id: item.publicId,
        overwrite: true,
        resource_type: 'image'
      });

      const secureUrl = uploadRes.secure_url;
      console.log(`✅ Uploaded ${item.slug}: ${secureUrl}`);

      // Update database
      const dbRes = await pool.query(
        'UPDATE categories SET image_url = $1 WHERE slug = $2 RETURNING id, name, slug, image_url',
        [secureUrl, item.slug]
      );

      if (dbRes.rows.length > 0) {
        console.log(`💾 DB Updated for ${item.slug}:`, dbRes.rows[0]);
      } else {
        console.warn(`⚠️ No DB category found with slug: ${item.slug}`);
      }
    } catch (err) {
      console.error(`❌ Failed to upload/update ${item.slug}:`, err.message || err);
    }
  }

  console.log('🎉 Category Cloudinary uploads and database updates completed!');
  process.exit(0);
}

runUpload();
