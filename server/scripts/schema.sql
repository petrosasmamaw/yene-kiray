-- Schema for የኔ ኪራይ (Yene Kiray) on Neon Serverless PostgreSQL

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    bio TEXT,
    free_trial_posts_remaining INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Layers',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Listings Table
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rental_price NUMERIC(14, 2) NOT NULL,
    price_period VARCHAR(20) NOT NULL DEFAULT 'month', -- 'hour', 'day', 'month', 'year'
    city VARCHAR(100) NOT NULL,
    subcity VARCHAR(100),
    specific_location VARCHAR(255),
    contact_phone VARCHAR(50) NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected', 'rented'
    is_paid BOOLEAN NOT NULL DEFAULT false,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Listing Images Table
CREATE TABLE IF NOT EXISTS listing_images (
    id SERIAL PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    public_id VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Payments Table (Pay-to-Post transactions)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
    payment_method VARCHAR(50) NOT NULL, -- 'Telebirr', 'CBE Birr', 'Awash Bank', 'BOA'
    transaction_reference VARCHAR(120),
    receipt_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. System Settings Table (Dynamic Admin Controls)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Conversations Table (Direct Socket.io messaging)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_renter_owner_listing UNIQUE (listing_id, renter_id, owner_id)
);

-- 8. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Saved / Bookmarked Listings Table
CREATE TABLE IF NOT EXISTS saved_listings (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_saved_listing UNIQUE (user_id, listing_id)
);

-- Default System Settings Seed
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
    ('pay_to_post_enabled', 'false', 'Enable or disable required payment before rental post goes live'),
    ('posting_fee_amount', '200', 'Standard fee in ETB charged to post a rental listing'),
    ('payment_instructions', 'Transfer fee to Telebirr: 0911000000 or CBE: 1000234567890 (Yene Kiray Payments). Submit reference number or screenshot.', 'Instructions shown to users when posting is paid')
ON CONFLICT (setting_key) DO NOTHING;

-- Default Categories Seed
INSERT INTO categories (name, slug, description, icon_name)
VALUES
    ('Residential Houses', 'residential-houses', 'Villas, apartments, studios, and furnished homes for rent', 'Home'),
    ('Cars & Vehicles', 'cars-vehicles', 'Sedans, luxury SUVs, pickups, and commercial vans', 'Car'),
    ('Commercial & Offices', 'commercial-offices', 'Retail shops, warehouses, office spaces, and conference halls', 'Building2'),
    ('Heavy Machinery & Trucks', 'heavy-machinery', 'Excavators, cranes, dump trucks, and construction equipment', 'Truck'),
    ('Event & Wedding Venues', 'event-venues', 'Wedding halls, event grounds, lighting, and party equipment', 'Sparkles'),
    ('Tools & Everyday Equipment', 'tools-equipment', 'Generators, cameras, power tools, and audio systems', 'Wrench')
ON CONFLICT (slug) DO NOTHING;
