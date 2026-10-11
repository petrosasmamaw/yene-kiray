import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

const images = [
  {
    slug: 'residential-houses',
    source: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_houses_1791707315964.jpg',
    filename: 'cat_houses.jpg'
  },
  {
    slug: 'cars-vehicles',
    source: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_cars_1791707339709.jpg',
    filename: 'cat_cars.jpg'
  },
  {
    slug: 'commercial-offices',
    source: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_offices_1791707358654.jpg',
    filename: 'cat_offices.jpg'
  },
  {
    slug: 'heavy-machinery',
    source: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_machinery_1791707388158.jpg',
    filename: 'cat_machinery.jpg'
  },
  {
    slug: 'event-venues',
    source: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_venues_1791707412454.jpg',
    filename: 'cat_venues.jpg'
  },
  {
    slug: 'tools-equipment',
    source: 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_tools_1791707448400.jpg',
    filename: 'cat_tools.jpg'
  }
];

async function copyAndDeploy() {
  const frontendPublicDir = path.resolve('frontend/public/categories');
  const serverUploadsDir = path.resolve('server/uploads/categories');

  fs.mkdirSync(frontendPublicDir, { recursive: true });
  fs.mkdirSync(serverUploadsDir, { recursive: true });

  console.log('📁 Copying generated 3D category assets...');

  for (const item of images) {
    if (!fs.existsSync(item.source)) {
      console.error(`❌ Source not found: ${item.source}`);
      continue;
    }

    const frontDest = path.join(frontendPublicDir, item.filename);
    const serverDest = path.join(serverUploadsDir, item.filename);

    fs.copyFileSync(item.source, frontDest);
    fs.copyFileSync(item.source, serverDest);

    const relativeUrl = `/categories/${item.filename}`;
    console.log(`✅ Copied ${item.filename} -> ${frontDest}`);

    // Update database
    await pool.query(
      'UPDATE categories SET image_url = $1 WHERE slug = $2',
      [relativeUrl, item.slug]
    );
    console.log(`💾 Updated DB for ${item.slug} -> ${relativeUrl}`);
  }

  const check = await pool.query('SELECT id, name, slug, image_url FROM categories ORDER BY id ASC');
  console.log('🎉 Current categories in DB:');
  console.log(JSON.stringify(check.rows, null, 2));

  process.exit(0);
}

copyAndDeploy().catch(err => {
  console.error(err);
  process.exit(1);
});
