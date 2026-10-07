CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    description TEXT,
    article VARCHAR(128) UNIQUE,
    barcode VARCHAR(128),
    base_price NUMERIC(12,2) NOT NULL,
    wholesale_price NUMERIC(12,2),
    currency CHAR(3) DEFAULT 'RUB',
    stock_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    color VARCHAR(64),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    dims JSONB,
    specs JSONB,
    images JSONB,
    vendor_model VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS price_list_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    stock_pack_qty INTEGER,
    boxes_qty INTEGER,
    price NUMERIC(12,2) NOT NULL,
    source VARCHAR(255)
);

CREATE TYPE order_status AS ENUM ('new', 'processing', 'shipped', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status order_status DEFAULT 'new',
    items JSONB NOT NULL,
    customer_info JSONB NOT NULL,
    total NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_file VARCHAR(255) NOT NULL,
    mapped_products JSONB,
    errors JSONB
);

CREATE INDEX IF NOT EXISTS idx_products_article ON products(article);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

