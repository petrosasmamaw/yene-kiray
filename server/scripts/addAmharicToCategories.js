import pool from '../config/db.js';

async function migrateCategories() {
  const client = await pool.connect();
  try {
    console.log('🔄 Adding Amharic columns to categories table...');

    await client.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS name_am VARCHAR(150),
      ADD COLUMN IF NOT EXISTS description_am TEXT;
    `);

    console.log('✨ Updating Amharic translations for existing categories...');

    const translations = [
      {
        slug: 'residential-houses',
        name_am: 'የመኖሪያ ቤቶች እና ቪላዎች',
        desc_am: 'የቅንጦት ቪላዎች፣ ዘመናዊ አፓርታማዎች፣ ኮንዶሚኒየሞች እና የመኖሪያ ውህዶች'
      },
      {
        slug: 'cars-vehicles',
        name_am: 'መኪኖች እና ተሽከርካሪዎች',
        desc_am: 'የዕለት ኪራይ፣ የቅንጦት V8፣ የቱሪስት ሚኒባሶች እና የከተማ መኪኖች ከአሽከርካሪ ጋር'
      },
      {
        slug: 'commercial-offices',
        name_am: 'የንግድ እና የቢሮ ቦታዎች',
        desc_am: 'የድርጅት ቢሮዎች፣ ሱቆች፣ መጋዘኖች እና የንግድ ህንፃዎች'
      },
      {
        slug: 'heavy-machinery',
        name_am: 'ከባድ ማሽነሪዎች እና ገልባጮች',
        desc_am: 'ኤክስካቫተሮች፣ ሎደሮች፣ ክሬኖች፣ የኢንዱስትሪ ጀነሬተሮች እና ገልባጭ መኪኖች'
      },
      {
        slug: 'event-venues',
        name_am: 'የሰርግ እና የዝግጅት አዳራሾች',
        desc_am: 'የሰርግ አዳራሾች፣ ማራኪ የአትክልት ስፍራዎች እና የድርጅት ኮንፈረንስ ማዕከላት'
      },
      {
        slug: 'tools-equipment',
        name_am: 'የሙያ ዕቃዎች እና መሣሪያዎች',
        desc_am: 'የቪዲዮ ካሜራዎች፣ የኮንሰርት ድምፅ ማጉያዎች እና የኮንስትራክሽን መሣሪያዎች'
      }
    ];

    for (const t of translations) {
      const res = await client.query(
        `UPDATE categories 
         SET name_am = $1, description_am = $2 
         WHERE slug = $3 RETURNING id, name, name_am`,
        [t.name_am, t.desc_am, t.slug]
      );
      if (res.rowCount > 0) {
        console.log(`✅ Updated ${t.slug} -> ${t.name_am}`);
      }
    }

    // Verify
    const all = await client.query(`SELECT id, name, name_am, slug FROM categories ORDER BY id ASC`);
    console.log('📋 Current categories:', all.rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrateCategories();
