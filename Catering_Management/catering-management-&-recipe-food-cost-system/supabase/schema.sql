-- ==============================================================================
-- CATERING MANAGEMENT & RECIPE FOOD COST SYSTEM
-- DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- Proyek Vokasi SMK - Manajemen Katering & HPP Resep
-- ==============================================================================

-- 1. Enable Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- Menggunakan TEXT PRIMARY KEY agar kompatibel dengan UUID maupun ID Berkode Sistem
-- ==============================================================================

-- PROFILES / USERS
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'chef', 'staff', 'manager')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES (Untuk Bahan Baku, Resep, Menu)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ingredient', 'recipe', 'menu')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNITS / SATUAN (Kg, Gram, Liter, Ml, Pcs, Box, dll)
CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    symbol TEXT NOT NULL UNIQUE,
    base_unit TEXT, -- 'gram', 'ml', 'pcs'
    conversion_factor NUMERIC(12, 4) DEFAULT 1.0, -- Contoh: 1 kg = 1000 gram
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS / PELANGGAN
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INGREDIENTS / MASTER BAHAN BAKU
CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    unit_id TEXT REFERENCES units(id) ON DELETE RESTRICT,
    purchase_price NUMERIC(15, 2) NOT NULL CHECK (purchase_price >= 0),
    price_per_base_unit NUMERIC(15, 4) NOT NULL DEFAULT 0 CHECK (price_per_base_unit >= 0),
    stock NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    supplier TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INGREDIENT PRICE HISTORY / RIWAYAT PERUBAHAN HARGA
CREATE TABLE IF NOT EXISTS ingredient_price_history (
    id TEXT PRIMARY KEY,
    ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    ingredient_name TEXT,
    old_price NUMERIC(15, 2) NOT NULL,
    new_price NUMERIC(15, 2) NOT NULL,
    change_date TIMESTAMPTZ DEFAULT NOW(),
    changed_by TEXT,
    notes TEXT
);

-- RECIPES / BANK RESEP
CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    is_sub_recipe BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    description TEXT,
    yield_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (yield_quantity > 0),
    yield_unit TEXT NOT NULL DEFAULT 'porsi',
    prep_time_minutes INT DEFAULT 0,
    cook_time_minutes INT DEFAULT 0,
    instructions TEXT,
    target_food_cost_pct NUMERIC(5, 2) DEFAULT 35.00,
    cost_per_portion NUMERIC(15, 2) DEFAULT 0,
    total_cost NUMERIC(15, 2) DEFAULT 0,
    selling_price NUMERIC(15, 2) DEFAULT 0,
    active_version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECIPE INGREDIENTS / BAHAN RESEP
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id TEXT REFERENCES ingredients(id) ON DELETE RESTRICT,
    sub_recipe_id TEXT REFERENCES recipes(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit_id TEXT REFERENCES units(id) ON DELETE RESTRICT,
    unit_cost NUMERIC(15, 4) NOT NULL DEFAULT 0,
    subtotal_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECIPE VERSIONS / VERSI RESEP
CREATE TABLE IF NOT EXISTS recipe_versions (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    total_cost NUMERIC(15, 2) NOT NULL,
    cost_per_portion NUMERIC(15, 2) NOT NULL,
    ingredients_snapshot JSONB,
    change_summary TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MENUS / MENU JUAL
CREATE TABLE IF NOT EXISTS menus (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    recipe_id TEXT REFERENCES recipes(id) ON DELETE SET NULL,
    unit TEXT NOT NULL DEFAULT 'Porsi',
    selling_price NUMERIC(15, 2) NOT NULL CHECK (selling_price >= 0),
    cost_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    food_cost_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
    margin_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS / PESANAN CATERING
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_date DATE NOT NULL,
    event_time TIME DEFAULT '11:00:00',
    event_type TEXT NOT NULL,
    event_location TEXT NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    additional_cost NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (additional_cost >= 0),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    down_payment NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (down_payment >= 0),
    remaining_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'Belum Bayar' CHECK (payment_status IN ('Belum Bayar', 'DP Sebagian', 'Lunas')),
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Menunggu pembayaran', 'Diproses', 'Produksi', 'Siap dikirim', 'Selesai', 'Dibatalkan')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS / DETAIL MENU PESANAN
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(15, 2) NOT NULL CHECK (subtotal >= 0),
    notes TEXT
);

-- PRODUCTION / MANAJEMEN PRODUKSI CATERING
CREATE TABLE IF NOT EXISTS production (
    id TEXT PRIMARY KEY,
    production_date DATE NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
    portions_needed INT NOT NULL CHECK (portions_needed > 0),
    status TEXT NOT NULL DEFAULT 'Belum diproses' CHECK (status IN ('Belum diproses', 'Diproses', 'Selesai')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SHIPMENTS / PENGIRIMAN
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    delivery_date DATE NOT NULL,
    delivery_time TIME NOT NULL,
    courier_name TEXT,
    package_count INT DEFAULT 1 CHECK (package_count > 0),
    destination_address TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Belum dikirim' CHECK (status IN ('Belum dikirim', 'Dalam perjalanan', 'Terkirim', 'Gagal dikirim')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS / PEMBAYARAN
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    payment_number TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Transfer', 'QRIS')),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('DP', 'Pelunasan', 'Cicilan')),
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS & LOGS
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient_email TEXT,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Memberikan hak akses penuh bagi peran anon & authenticated
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'profiles', 'categories', 'units', 'customers', 'ingredients', 
            'ingredient_price_history', 'recipes', 'recipe_ingredients', 
            'recipe_versions', 'menus', 'orders', 'order_items', 
            'production', 'shipments', 'payments', 'notifications'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access on %I" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
