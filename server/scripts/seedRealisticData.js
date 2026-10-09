import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const realisticCategories = [
  {
    name: 'Residential Houses & Villas',
    slug: 'residential-houses',
    description: 'Furnished luxury villas, modern apartments, family homes, and studios for rent across Ethiopia',
    icon_name: 'Home'
  },
  {
    name: 'Cars & Luxury Vehicles',
    slug: 'cars-vehicles',
    description: 'Chauffeur and self-drive 4x4 SUVs, luxury wedding sedans, and commercial vans',
    icon_name: 'Car'
  },
  {
    name: 'Commercial & Office Spaces',
    slug: 'commercial-offices',
    description: 'Fitted office floors, retail commercial shops, co-working suites, and warehouses',
    icon_name: 'Building2'
  },
  {
    name: 'Heavy Machinery & Trucks',
    slug: 'heavy-machinery',
    description: 'Excavators, mobile cranes, bulldozers, dump trucks, and commercial site power generators',
    icon_name: 'Truck'
  },
  {
    name: 'Event Venues & Reception Halls',
    slug: 'event-venues',
    description: 'Grand wedding reception halls, conference auditoriums, outdoor garden grounds, and party venues',
    icon_name: 'Sparkles'
  }
];

const listingsData = [
  // 1. Residential Houses & Villas (5 listings)
  {
    categorySlug: 'residential-houses',
    title: 'Luxury 4-Bedroom Furnished Villa in Old Airport',
    description: 'Spacious high-end villa located in the prestigious diplomatic district of Old Airport. Features master ensuite with jacuzzi, modern open kitchen, private landscaped garden, maid quarters, 24/7 security guard, and standby generator.',
    rental_price: 120000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Old Airport',
    specific_location: 'Near ICS (International Community School)',
    contact_phone: '+251 911 234 567',
    features: ['Standby Generator', '24/7 Guard Post', 'Landscaped Garden', 'High-Speed Fiber Internet', 'Water Storage Tank (10kL)', 'Maid Quarters'],
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'residential-houses',
    title: 'Modern 2-Bedroom Apartment in Bole Atlas',
    description: 'Fully furnished serviced apartment on the 4th floor with elevator access, city view balcony, modern kitchen appliances, dedicated basement parking, and 24-hour backup electricity and continuous water.',
    rental_price: 45000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Atlas Hotel area, behind Edna Mall',
    contact_phone: '+251 912 345 678',
    features: ['Automatic Elevator', 'Underground Parking', 'Backup Generator', 'Balcony City View', 'Security Camera System'],
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'residential-houses',
    title: 'Executive G+2 Residence in CMC Summit',
    description: 'Newly constructed G+2 private residence featuring 5 bedrooms, 4 bathrooms, expansive living room, modern dining, rooftop terrace with panoramic sunset views, and parking for 4 vehicles.',
    rental_price: 85000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Yeka / CMC',
    specific_location: 'CMC Summit near St. Michael Church',
    contact_phone: '+251 911 889 900',
    features: ['Parking for 4 Cars', 'Rooftop Terrace', 'Electric Fence', 'Solar Water Heater', 'CCTV Surveillance'],
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'residential-houses',
    title: 'Furnished Cozy Studio Apartment near UNECA',
    description: 'Ideal for NGO and expat professionals, this cozy studio apartment offers high-speed WiFi, modern kitchenette, smart TV, weekly housekeeping, and walking distance to UNECA and Kazanchis business center.',
    rental_price: 25000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kazanchis',
    specific_location: 'Walking distance to UNECA headquarters',
    contact_phone: '+251 913 456 789',
    features: ['Smart TV with Cable', 'Weekly Housekeeping', 'High-Speed WiFi', 'Secure Card Entry', 'Quiet Compound'],
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'residential-houses',
    title: 'Lakeside Holiday Villa in Hawassa',
    description: 'Serene 3-bedroom vacation and getaway villa located directly along the shores of Lake Hawassa. Features outdoor barbecue patio, lush fruit trees, expansive lawn, and private boat docking access.',
    rental_price: 60000,
    price_period: 'month',
    city: 'Hawassa',
    subcity: 'Tabor Area',
    specific_location: 'Lake Hawassa Shoreline',
    contact_phone: '+251 944 112 233',
    features: ['Direct Lake Frontage', 'BBQ Pavilion', 'Lush Garden', 'Solar Backup', 'Peaceful Atmosphere'],
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
  },

  // 2. Cars & Luxury Vehicles (5 listings)
  {
    categorySlug: 'cars-vehicles',
    title: 'Toyota Land Cruiser V8 (2023) - Chauffeur & VIP',
    description: 'Luxury bulletproof-ready Land Cruiser V8 with leather interior, climate control, and experienced multilingual driver. Available for diplomatic delegations, wedding escorts, and regional executive tours.',
    rental_price: 12000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Bole Airport & Hotel Pickup Available',
    contact_phone: '+251 911 556 677',
    features: ['Chauffeur Included', 'Leather Seating', 'Dual AC', 'Comprehensive Insurance', 'Airport Meet & Greet'],
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'Hyundai Tucson 2022 Automatic - Daily & Monthly Rental',
    description: 'Fuel-efficient and smooth crossover SUV with Apple CarPlay, reverse camera, panoramic sunroof, and automatic transmission. Excellent for city driving and out-of-town trips.',
    rental_price: 3500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Kirkos',
    specific_location: 'Meskel Square / Mexico',
    contact_phone: '+251 912 998 877',
    features: ['Automatic Transmission', 'Apple CarPlay & Android Auto', 'Rear Parking Sensors', 'Low Fuel Consumption'],
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'Toyota Hilux Double Cabin 4x4 - Field & Project Hire',
    description: 'Heavy-duty 4WD Toyota Hilux pickup built for rough terrain, construction oversight, NGO field missions, and mining exploration across Ethiopia. Regularly serviced with high ground clearance.',
    rental_price: 5500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Nifas Silk',
    specific_location: 'Gotera Interchange area',
    contact_phone: '+251 911 776 655',
    features: ['4x4 All-Wheel Drive', 'Heavy Duty Suspension', 'High Clearance', 'Full Field Kit & Spare Tire'],
    image_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'Mercedes-Benz E-Class Luxury Wedding Sedan',
    description: 'Premium white Mercedes-Benz E-Class sedan with polished chrome details, luxury black leather cabin, and optional wedding ribbon decoration. Perfect for bridal escort and VIP hospitality.',
    rental_price: 15000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Bole Medhanialem',
    contact_phone: '+251 913 223 344',
    features: ['Executive Uniformed Driver', 'Complimentary Wedding Ribbon Decor', 'Premium Sound System', 'Immaculate Condition'],
    image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'cars-vehicles',
    title: 'Toyota HiAce 14-Seat Commuter Van for Group Trips',
    description: 'Well-maintained high-roof 14-passenger van with tinted windows, high capacity luggage roof rack, and air conditioning. Ideal for corporate staff transport, family vacations, and tour groups.',
    rental_price: 4500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Yeka',
    specific_location: 'Megenagna / Shola',
    contact_phone: '+251 922 445 566',
    features: ['14 Passenger Seats', 'Roof Luggage Rack', 'Cool Air Conditioning', 'Experienced Highway Driver'],
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80'
  },

  // 3. Commercial & Office Spaces (5 listings)
  {
    categorySlug: 'commercial-offices',
    title: '250 sqm Fully Fitted Premium Office Floor in Bole',
    description: 'Move-in ready office space on the 5th floor of a prestigious commercial building on Bole Road. Includes 6 partitioned executive offices, boardroom, server room, kitchenette, and 3-phase commercial power.',
    rental_price: 160000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Bole Road, near Friendship City Center',
    contact_phone: '+251 911 334 455',
    features: ['6 Executive Partitions', 'Conference Boardroom', 'Standby 250kVA Generator', 'High-Speed Elevators', '24/7 Security'],
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'Ground Floor Retail Space in Kazanchis Center',
    description: 'Prime ground-floor retail shop of 85 sqm with wide glass frontage facing heavy pedestrian and vehicular traffic. Suitable for bank branch, pharmacy, coffee brand, or electronics showroom.',
    rental_price: 90000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Kirkos',
    specific_location: 'Kazanchis main street, near Radisson Blu',
    contact_phone: '+251 912 667 788',
    features: ['Glass Display Frontage', 'High Foot Traffic', 'Private Restroom', 'Direct Street Entrance'],
    image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'commercial-offices',
    title: '800 sqm Heavy Industrial Warehouse in Akaki Kaliti',
    description: 'High-ceiling logistics warehouse with 10-meter clearance, concrete flooring for heavy forklifts, 3-phase industrial power, trailer turning radius, and 24-hour guarded industrial park zone.',
    rental_price: 240000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Akaki Kaliti',
    specific_location: 'Kaliti Industrial Area, Ring Road Access',
    contact_phone: '+251 911 990 011',
    features: ['3-Phase Industrial Electric', 'Trailer Loading Bay', '10m Clearance Height', 'Guard Post & Perimeter Wall'],
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'Dedicated Team Suite & Co-Working Hub in Piassa',
    description: 'Modern turnkey co-working office suite accommodating 15-20 staff with ergonomic chairs, shared conference rooms, fiber internet, free coffee bar, and biometric access.',
    rental_price: 55000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Arada',
    specific_location: 'Piassa, near Churchill Avenue',
    contact_phone: '+251 913 778 899',
    features: ['Ergonomic Desks & Chairs', 'Unlimited Coffee & Tea', 'High-Speed Fiber', 'Bookable Meeting Rooms'],
    image_url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'commercial-offices',
    title: 'Commercial Showroom Floor on Debre Zeit Road',
    description: 'Expansive 400 sqm open-plan showroom with high visibility on the main highway. Perfect for vehicle dealership, furniture display, hardware depot, or wholesale business.',
    rental_price: 180000,
    price_period: 'month',
    city: 'Addis Ababa',
    subcity: 'Nifas Silk',
    specific_location: 'Debre Zeit Road near Kera',
    contact_phone: '+251 911 445 566',
    features: ['Wide Highway Visibility', 'Customer Parking in Front', 'Open Floor Plan', 'Dedicated Office & Restroom'],
    image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
  },

  // 4. Heavy Machinery & Trucks (5 listings)
  {
    categorySlug: 'heavy-machinery',
    title: 'CAT 320D Hydraulic Excavator with Certified Operator',
    description: 'Heavy earthmoving Caterpillar 320D crawler excavator with certified operator. Ideal for site excavation, foundation trenches, rock clearing, and road construction. Available on daily or monthly hire.',
    rental_price: 18000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'All Sites (Delivery Available)',
    specific_location: 'Dispatched to any construction site in Ethiopia',
    contact_phone: '+251 911 882 299',
    features: ['Certified Operator Included', 'Fuel-Efficient Common Rail Engine', 'Standard Rock Bucket', '24/7 Mobile Maintenance Support'],
    image_url: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'heavy-machinery',
    title: '25-Ton Mobile Hydraulic Crane with Telescopic Boom',
    description: 'Tadano 25-ton all-terrain truck crane with 32-meter boom reach. Suitable for precast beam lifting, steel erection, rooftop container loading, and industrial installation.',
    rental_price: 22000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'All Sites',
    specific_location: 'Mobilized nationwide across Ethiopia',
    contact_phone: '+251 912 554 433',
    features: ['32m Telescopic Reach', 'Rigging Crew Available', 'Heavy Load Chart Certified', 'Safety Inspected'],
    image_url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'heavy-machinery',
    title: 'Sinotruk HOWO 16m³ Heavy Dump Truck (Tipper)',
    description: 'Reliable 10-wheeler 16-cubic-meter HOWO tipper truck for sand, gravel, quarry aggregates, and soil cart away. Well-maintained fleet available for road and building projects.',
    rental_price: 8500,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Addis Ababa & Regional Routes',
    specific_location: 'Depots in Kality and Legetafo',
    contact_phone: '+251 911 663 322',
    features: ['16 Cubic Meter Capacity', 'Experienced Heavy Duty Driver', 'Reinforced Steel Bed', 'GPS Fleet Tracking'],
    image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'heavy-machinery',
    title: 'Shantui SD22 Heavy Bulldozer for Land Clearing',
    description: 'Powerful 220 HP crawler bulldozer with straight tilt blade and rear ripper. Ideal for farmland development, hillside grading, quarry overburden removal, and road opening.',
    rental_price: 20000,
    price_period: 'day',
    city: 'Adama',
    subcity: 'Oromia & Afar Corridors',
    specific_location: 'Located near Adama Express Junction',
    contact_phone: '+251 913 991 100',
    features: ['220 Horsepower Diesel', 'Heavy Rear Ripper', 'Wide Track Shoes', 'Daily Operator Included'],
    image_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'heavy-machinery',
    title: '150 kVA Soundproof Cummins Diesel Generator',
    description: 'Mobile soundproof 150 kVA emergency diesel power generator with automatic transfer switch (ATS). Quiet operation suitable for hospitals, hotel events, construction sites, and factories.',
    rental_price: 7000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Same-day delivery across Addis Ababa',
    contact_phone: '+251 922 884 411',
    features: ['Super Silent Canopy', 'Integrated Fuel Tank', 'Automatic Transfer Switch (ATS)', 'Regular Maintenance Tech On-Call'],
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  },

  // 5. Event Venues & Reception Halls (5 listings)
  {
    categorySlug: 'event-venues',
    title: 'Grand Crystal Wedding & Reception Hall in Bole',
    description: 'Breathtaking luxury reception hall accommodating up to 800 banquet guests. Includes state-of-the-art stage lighting, crystal chandeliers, VIP bridal suites, ample parking, and full commercial kitchen for catering.',
    rental_price: 150000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Bole Brass area, near Rwanda Embassy',
    contact_phone: '+251 911 123 987',
    features: ['Capacity: 800 Seated Guests', 'Crystal Chandeliers & Stage Lighting', 'Dedicated Bridal Dressing Suite', 'Parking for 150 Vehicles', 'Standby Power Generator'],
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'event-venues',
    title: 'Executive 150-Person Corporate Conference Auditorium',
    description: 'Fully equipped corporate conference hall with high-definition laser projectors, digital audio mixing, wireless delegate microphones, translation booths, and coffee break lounge.',
    rental_price: 45000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Kirkos',
    specific_location: 'Kazanchis financial district',
    contact_phone: '+251 912 334 455',
    features: ['High-Definition Projectors', 'Wireless Delegate Mics', 'High-Speed Event WiFi', 'Adjoining Coffee Break Foyer'],
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'event-venues',
    title: 'Lakeside Outdoor Garden Venue in Bishoftu',
    description: 'Picturesque manicured garden venue with sweeping views of Lake Bishoftu. Popular for outdoor weddings, engagement celebrations, photography shoots, and corporate retreats with capacity for 500 guests.',
    rental_price: 95000,
    price_period: 'day',
    city: 'Bishoftu',
    subcity: 'Lake Shore District',
    specific_location: 'Lake Bishoftu waterfront',
    contact_phone: '+251 911 770 099',
    features: ['Lakeside Panorama View', 'Manicured Grass Lawns', 'Decorative String Lighting', 'Security & Valet Area'],
    image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'event-venues',
    title: 'Intimate Banquet & Birthday Celebration Hall in Sarbet',
    description: 'Modern boutique event space designed for graduation dinners, birthday parties, intimate engagements, and family gatherings for up to 120 guests with built-in surround sound and ambient mood lights.',
    rental_price: 30000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Kirkos / Sarbet',
    specific_location: 'Sarbet, near King George Street',
    contact_phone: '+251 913 556 677',
    features: ['Capacity: 120 Guests', 'Surround Sound Audio System', 'Ambient LED Mood Lighting', 'Cocktail High Tables & Chairs'],
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    categorySlug: 'event-venues',
    title: 'Multi-Purpose Exhibition & Fair Grounds on Ring Road',
    description: 'Over 2,500 sqm of open and semi-covered event space ideal for trade fairs, automotive showcases, cultural festivals, product launches, and massive corporate gatherings with easy highway logistics access.',
    rental_price: 200000,
    price_period: 'day',
    city: 'Addis Ababa',
    subcity: 'Bole',
    specific_location: 'Bole Ring Road Junction',
    contact_phone: '+251 911 884 422',
    features: ['2,500 sqm Open & Covered Space', 'Heavy Truck Access & Loading', 'High Voltage Electric Supply', 'Secure Gated Perimeter'],
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
  }
];

async function seedRealisticData() {
  console.log('🚀 Starting realistic 5-category and 25-listing seed for የኔ ኪራይ...');

  try {
    // 1. Get or confirm the admin user
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
    const userRes = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [adminEmail]);

    if (userRes.rows.length === 0) {
      console.error(`❌ Admin user "${adminEmail}" not found. Please run "npm run seed:admin" first.`);
      process.exit(1);
    }

    const adminUserId = userRes.rows[0].id;
    console.log(`👤 Using Admin User: ${userRes.rows[0].name} (${userRes.rows[0].email}) - ID: ${adminUserId}`);

    // 2. Ensure the 5 Categories exist (and deactivate any old extra ones)
    console.log('📦 Upserting 5 realistic categories...');
    const categoryMap = {}; // slug -> id

    // Deactivate all old categories first to ensure ONLY these 5 appear
    await pool.query('UPDATE categories SET is_active = false');

    for (const cat of realisticCategories) {
      const catRes = await pool.query(
        `INSERT INTO categories (name, slug, description, icon_name, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             description = EXCLUDED.description,
             icon_name = EXCLUDED.icon_name,
             is_active = true
         RETURNING id, name, slug`,
        [cat.name, cat.slug, cat.description, cat.icon_name]
      );
      categoryMap[cat.slug] = catRes.rows[0].id;
      console.log(`  ✓ Category active: "${cat.name}" (ID: ${catRes.rows[0].id})`);
    }

    // 3. Clean up existing listings to ensure clean, authentic 5-per-category showcase
    console.log('🧹 Purging outdated demo listings...');
    await pool.query('DELETE FROM listings WHERE user_id = $1', [adminUserId]);

    // 4. Insert 25 realistic listings (5 in each of the 5 categories)
    console.log(`📝 Inserting ${listingsData.length} realistic listings...`);

    let count = 0;
    for (const item of listingsData) {
      const categoryId = categoryMap[item.categorySlug];
      if (!categoryId) {
        console.warn(`⚠️ Warning: Category not found for slug ${item.categorySlug}`);
        continue;
      }

      // Insert listing
      const listingRes = await pool.query(
        `INSERT INTO listings (
          user_id, category_id, title, description, rental_price, price_period,
          city, subcity, specific_location, contact_phone, features, status, is_paid, views_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', true, 12
        ) RETURNING id, title`,
        [
          adminUserId,
          categoryId,
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

      const listingId = listingRes.rows[0].id;

      // Insert primary image into listing_images
      await pool.query(
        `INSERT INTO listing_images (listing_id, image_url, is_primary)
         VALUES ($1, $2, true)`,
        [listingId, item.image_url]
      );

      count++;
      console.log(`  [${count}/25] Inserted: "${item.title}" in [${item.categorySlug}]`);
    }

    console.log('===============================================================');
    console.log(`🎉 SUCCESS: 5 Categories and ${count} Realistic Listings Seeded!`);
    console.log('===============================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed realistic data:', error.message);
    process.exit(1);
  }
}

seedRealisticData();
