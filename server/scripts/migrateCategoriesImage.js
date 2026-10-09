import pool from '../config/db.js';

async function migrate() {
  try {
    console.log('🔄 Adding image_url column to categories table if not exists...');
    await pool.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

    console.log('🖼️ Updating existing categories with high quality curated images...');
    const updates = [
      {
        slug: 'residential-houses',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      },
      {
        slug: 'cars-vehicles',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      },
      {
        slug: 'commercial-offices',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
      },
      {
        slug: 'heavy-machinery',
        image: 'https://images.unsplash.com/photo-1579847188804-ecba0e2ea330?auto=format&fit=crop&w=800&q=80'
      },
      {
        slug: 'event-venues',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
      },
      {
        slug: 'tools-equipment',
        image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const item of updates) {
      await pool.query(
        'UPDATE categories SET image_url = $1 WHERE slug = $2 AND (image_url IS NULL OR image_url = \'\')',
        [item.image, item.slug]
      );
    }

    const check = await pool.query('SELECT id, name, slug, icon_name, image_url, is_active FROM categories ORDER BY id ASC');
    console.log('✅ Categories successfully updated:');
    console.table(check.rows);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
