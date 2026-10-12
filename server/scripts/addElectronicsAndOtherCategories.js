import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔄 Checking and adding Electronics and Other categories...');

    const newCats = [
      {
        name: 'Electronics & Gadgets',
        name_am: 'ኤሌክትሮኒክስ እና መሣሪያዎች',
        slug: 'electronics',
        description: 'Laptops, cameras, smart TVs, audio systems, smartphones and modern tech gear',
        description_am: 'ስልኮች፣ ላፕቶፖች፣ ካሜራዎች፣ ቴሌቪዥኖች እና ዘመናዊ የኤሌክትሮኒክስ መሣሪያዎች',
        icon_name: 'Tv',
        image_url: '/categories/cat_electronics.jpg'
      },
      {
        name: 'Other Rental Items',
        name_am: 'ሌሎች የኪራይ ዘርፎች',
        slug: 'other',
        description: 'Assorted lifestyle goods, luggage, events gear, instruments, and miscellaneous rentals',
        description_am: 'የተለያዩ የኪራይ ዕቃዎች፣ የጉዞ ሻንጣዎች፣ ሙዚቃ መሣሪያዎች እና ተጨማሪ አገልግሎቶች',
        icon_name: 'Package',
        image_url: '/categories/cat_other.jpg'
      }
    ];

    for (const cat of newCats) {
      const existing = await client.query('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE categories 
           SET name = $1, name_am = $2, description = $3, description_am = $4, icon_name = $5, image_url = $6, is_active = true 
           WHERE slug = $7`,
          [cat.name, cat.name_am, cat.description, cat.description_am, cat.icon_name, cat.image_url, cat.slug]
        );
        console.log(`✅ Updated category: ${cat.name} (${cat.slug})`);
      } else {
        await client.query(
          `INSERT INTO categories (name, name_am, slug, description, description_am, icon_name, image_url, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
          [cat.name, cat.name_am, cat.slug, cat.description, cat.description_am, cat.icon_name, cat.image_url]
        );
        console.log(`✨ Created category: ${cat.name} (${cat.slug})`);
      }
    }

    const all = await client.query('SELECT id, name, name_am, slug, image_url, is_active FROM categories ORDER BY id ASC');
    console.log('📋 All categories in DB:');
    console.table(all.rows);

  } catch (err) {
    console.error('❌ Error updating categories:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
