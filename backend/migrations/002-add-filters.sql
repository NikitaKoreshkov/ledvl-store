-- Таблица фильтров
CREATE TABLE IF NOT EXISTS filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('select', 'checkbox', 'range', 'text')),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Таблица значений фильтров
CREATE TABLE IF NOT EXISTS filter_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filter_id UUID NOT NULL REFERENCES filters(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    min_value NUMERIC(12,2),
    max_value NUMERIC(12,2)
);

-- Связь многие-ко-многим между товарами и значениями фильтров
CREATE TABLE IF NOT EXISTS product_filter_values (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    filter_value_id UUID NOT NULL REFERENCES filter_values(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, filter_value_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_filters_category_id ON filters(category_id);
CREATE INDEX IF NOT EXISTS idx_filter_values_filter_id ON filter_values(filter_id);
CREATE INDEX IF NOT EXISTS idx_product_filter_values_product_id ON product_filter_values(product_id);
CREATE INDEX IF NOT EXISTS idx_product_filter_values_filter_value_id ON product_filter_values(filter_value_id);

