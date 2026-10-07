/**
 * Демо-каталог для режима NEXT_PUBLIC_DEMO=1 (например, превью на Vercel без базы).
 * Формы ответов совпадают с REST-контрактом backend/src/products, поэтому
 * переключатель только подменяет сетевой слой — компоненты не знают о демо.
 * Товары вымышленные: это не прайс клиента.
 */

export interface DemoFilterValue {
  id: string
  filter_id: string
  value: string
  display_name: string | null
  sort_order: number
  is_active: boolean
  min_value: string | null
  max_value: string | null
}

export interface DemoFilter {
  id: string
  name: string
  type: 'select' | 'checkbox' | 'range' | 'text'
  category_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  values: DemoFilterValue[]
}

export interface DemoCategory {
  id: string
  name: string
  slug: string
  parent_id: string | null
  parent: null
  children: []
}

export interface DemoProduct {
  id: string
  name: string
  article: string
  barcode: string | null
  base_price: number
  wholesale_price: number | null
  color: string | null
  is_available: boolean
  is_featured: boolean
  stock_count: number
  vendor_model: string | null
  description: string | null
  specs: Record<string, string> | null
  dims: { width?: number; height?: number; length?: number } | null
  images: Array<{ url: string; width: number; height: number; size: string }> | null
  category: { id: string; name: string } | null
  price_list_entries: Array<{ id: string; stock_pack_qty: number | null; boxes_qty: number | null; price: number }> | null
  filter_values: Array<{ id: string; value: string; display_name: string | null; filter: { id: string; name: string } }>
  created_at: string
  updated_at: string
}

const CATEGORY_NEW_YEAR = '00000000-0000-0000-0000-000000000001'
const CATEGORY_SOLAR = '00000000-0000-0000-0000-000000000002'
const CATEGORY_PRICE_LIST = '00000000-0000-0000-0000-000000000003'

export const categories: DemoCategory[] = [
  {
    id: CATEGORY_NEW_YEAR,
    name: 'Новый год 2026',
    slug: 'novyy-god-2026',
    parent_id: null,
    parent: null,
    children: [],
  },
  {
    id: CATEGORY_SOLAR,
    name: 'Солнечные светильники (LedVL солнечные)',
    slug: 'solnechnye-svetilniki-ledvl',
    parent_id: null,
    parent: null,
    children: [],
  },
  {
    id: CATEGORY_PRICE_LIST,
    name: 'Прайс LedVL',
    slug: 'prays-ledvl',
    parent_id: null,
    parent: null,
    children: [],
  },
]

const FILTER_COLOR = 'f0000000-0000-0000-0000-000000000001'
const FILTER_POWER = 'f0000000-0000-0000-0000-000000000002'
const FILTER_PRICE = 'f0000000-0000-0000-0000-000000000003'

const COLOR_WARM = 'v0000000-0000-0000-0000-000000000001'
const COLOR_NEUTRAL = 'v0000000-0000-0000-0000-000000000002'
const COLOR_RGB = 'v0000000-0000-0000-0000-000000000003'
const POWER_LOW = 'v0000000-0000-0000-0000-000000000011'
const POWER_MID = 'v0000000-0000-0000-0000-000000000012'
const POWER_HIGH = 'v0000000-0000-0000-0000-000000000013'

export const filters: DemoFilter[] = [
  {
    id: FILTER_COLOR,
    name: 'Цвет',
    type: 'select',
    category_id: null,
    sort_order: 0,
    is_active: true,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-01-10T09:00:00.000Z',
    values: [
      value(COLOR_WARM, FILTER_COLOR, 'warm', 'тёплый белый', 0),
      value(COLOR_NEUTRAL, FILTER_COLOR, 'neutral', 'нейтральный белый', 1),
      value(COLOR_RGB, FILTER_COLOR, 'rgb', 'RGB', 2),
    ],
  },
  {
    id: FILTER_POWER,
    name: 'мощность',
    type: 'checkbox',
    category_id: null,
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-01-10T09:00:00.000Z',
    values: [
      value(POWER_LOW, FILTER_POWER, 'low', 'до 20 Вт', 0),
      value(POWER_MID, FILTER_POWER, 'mid', '20–100 Вт', 1),
      value(POWER_HIGH, FILTER_POWER, 'high', 'от 100 Вт', 2),
    ],
  },
  {
    id: FILTER_PRICE,
    name: 'цена',
    type: 'range',
    category_id: null,
    sort_order: 2,
    is_active: true,
    created_at: '2026-01-10T09:00:00.000Z',
    updated_at: '2026-01-10T09:00:00.000Z',
    values: [
      {
        id: 'v0000000-0000-0000-0000-000000000021',
        filter_id: FILTER_PRICE,
        value: 'range_' + FILTER_PRICE,
        display_name: null,
        sort_order: 0,
        is_active: true,
        min_value: '0.00',
        max_value: '8000.00',
      },
    ],
  },
]

function value(id: string, filterId: string, raw: string, label: string, order: number): DemoFilterValue {
  return {
    id,
    filter_id: filterId,
    value: raw,
    display_name: label,
    sort_order: order,
    is_active: true,
    min_value: null,
    max_value: null,
  }
}

function tag(filterId: string, filterName: string, valueId: string, raw: string, label: string) {
  return {
    id: valueId,
    value: raw,
    display_name: label,
    filter: { id: filterId, name: filterName },
  }
}

function image(file: string) {
  return [{ url: `/images/products/${file}.svg`, width: 800, height: 450, size: 'demo' }]
}

const WARRANTY = '24 месяца с даты продажи. Гарантия покрывает выход из строя светодиодов и драйвера при соблюдении условий монтажа и эксплуатации, заявленных в карточке товара.'

export const products: DemoProduct[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    name: 'Гирлянда «Иней» RGB, 10 м',
    article: 'NV-GR-10RGB',
    barcode: '4610053581206',
    base_price: 2400,
    wholesale_price: 1800,
    color: 'RGB',
    is_available: true,
    is_featured: true,
    stock_count: 46,
    vendor_model: 'LedVL NV-GR-10',
    description:
      'Световая гирлянда для фасадов и елочных композиций. Кабель в морозостойкой изоляции работает от −30 °C, контроллер переключает восемь режимов свечения, включая плавное затухание и бегущий огонь.',
    specs: {
      technical: '100 LED, 8 режимов, морозостойкий кабель −30 °C',
      power: '12 Вт',
      led_count: '100 LED',
      ip_rating: 'IP44',
      length: '10 м',
      color_temperature: 'RGB',
      warranty: WARRANTY,
    },
    dims: { width: 60, height: 60, length: 10000 },
    images: image('garland'),
    category: { id: CATEGORY_NEW_YEAR, name: 'Новый год 2026' },
    price_list_entries: null,
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_RGB, 'rgb', 'RGB'), tag(FILTER_POWER, 'мощность', POWER_LOW, 'low', 'до 20 Вт')],
    created_at: '2026-01-12T10:00:00.000Z',
    updated_at: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    name: 'Светодиодная сетка 3×4 м',
    article: 'NV-MS-34W',
    barcode: '4610053581213',
    base_price: 3200,
    wholesale_price: 2500,
    color: 'тёплый белый',
    is_available: true,
    is_featured: false,
    stock_count: 18,
    vendor_model: 'LedVL NV-MS-34',
    description:
      'Готовая световая сетка для оформления стен, окон и арочных проёмов. Ячейка 20 см, диоды залиты компаундом, поэтому конструкция не боится влаги и выдерживает зимний дождь со снегом.',
    specs: {
      technical: '352 LED, ячейка 200 мм, IP65',
      power: '24 Вт',
      led_count: '352 LED',
      ip_rating: 'IP65',
      color_temperature: '2700 К',
      warranty: WARRANTY,
    },
    dims: { width: 3000, height: 4000 },
    images: image('mesh-net'),
    category: { id: CATEGORY_NEW_YEAR, name: 'Новый год 2026' },
    price_list_entries: null,
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_WARM, 'warm', 'тёплый белый'), tag(FILTER_POWER, 'мощность', POWER_MID, 'mid', '20–100 Вт')],
    created_at: '2026-01-12T10:00:00.000Z',
    updated_at: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000003',
    name: 'Занавес «Люстра» 3×3 м RGB',
    article: 'NV-CU-33RGB',
    barcode: '4610053581220',
    base_price: 4100,
    wholesale_price: 3200,
    color: 'RGB',
    is_available: true,
    is_featured: false,
    stock_count: 12,
    vendor_model: 'LedVL NV-CU-33',
    description:
      'Подвесной световой занавес для сцен, витрин и входных групп. Нити разной длины создают эффект каскада, контроллер синхронизирует до четырёх штор между собой.',
    specs: {
      technical: '288 LED, нити 60–300 см, синхронизация 4 штор',
      power: '36 Вт',
      led_count: '288 LED',
      ip_rating: 'IP44',
      color_temperature: 'RGB',
      warranty: WARRANTY,
    },
    dims: { width: 3000, height: 3000 },
    images: image('curtain'),
    category: { id: CATEGORY_NEW_YEAR, name: 'Новый год 2026' },
    price_list_entries: null,
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_RGB, 'rgb', 'RGB'), tag(FILTER_POWER, 'мощность', POWER_MID, 'mid', '20–100 Вт')],
    created_at: '2026-01-12T10:00:00.000Z',
    updated_at: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000004',
    name: 'Дюралайт круглый 2,5 м RGB',
    article: 'NV-DU-025RGB',
    barcode: '4610053581237',
    base_price: 1500,
    wholesale_price: 1100,
    color: 'RGB',
    is_available: true,
    is_featured: false,
    stock_count: 120,
    vendor_model: 'LedVL NV-DU-25',
    description:
      'Гибкая светящаяся трубка для контурной подсветки вывесок и лестниц. Режется по кратным диоду шагам, гнётся в любой плоскости, крепится клипсами из комплекта.',
    specs: {
      technical: 'Ø 16 мм, шаг резки 1 м, двустороннее свечение',
      power: '8 Вт',
      led_count: '12 LED/м',
      ip_rating: 'IP65',
      color_temperature: 'RGB',
      warranty: WARRANTY,
    },
    dims: { width: 16, height: 16, length: 2500 },
    images: image('duralight'),
    category: { id: CATEGORY_NEW_YEAR, name: 'Новый год 2026' },
    price_list_entries: null,
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_RGB, 'rgb', 'RGB'), tag(FILTER_POWER, 'мощность', POWER_LOW, 'low', 'до 20 Вт')],
    created_at: '2026-01-12T10:00:00.000Z',
    updated_at: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000005',
    name: 'Уличный фонарь на солнечной батарее 100 Вт',
    article: 'SV-ST-100',
    barcode: '4610053581244',
    base_price: 5000,
    wholesale_price: 4100,
    color: 'нейтральный белый',
    is_available: true,
    is_featured: true,
    stock_count: 34,
    vendor_model: 'LedVL Solar 100',
    description:
      'Автономный уличный светильник для дворов, парковок и пешеходных дорожек. Панель заряжает аккумулятор за световой день, датчик света включает полный режим вечером и переходит в дежурный к рассвету.',
    specs: {
      power: '100 Вт',
      led_count: '214 LED',
      panel_size: '270×180 мм, монокристалл',
      battery: 'LiFePO4 12 000 мА·ч',
      mode: 'датчик света + пульт, 3 сценария',
      area: '120 м²',
      ip_rating: 'IP66',
      luminous_flux: '14 000 лм',
      warranty: WARRANTY,
    },
    dims: { width: 320, height: 210, length: 45 },
    images: image('solar-street'),
    category: { id: CATEGORY_SOLAR, name: 'Солнечные светильники (LedVL солнечные)' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000005', stock_pack_qty: 1, boxes_qty: 6, price: 4600 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_NEUTRAL, 'neutral', 'нейтральный белый'), tag(FILTER_POWER, 'мощность', POWER_HIGH, 'high', 'от 100 Вт')],
    created_at: '2026-01-14T10:00:00.000Z',
    updated_at: '2026-01-14T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000006',
    name: 'Прожектор Solar 200 Вт с датчиком движения',
    article: 'SV-FL-200M',
    barcode: '4610053581251',
    base_price: 7800,
    wholesale_price: 6400,
    color: 'нейтральный белый',
    is_available: true,
    is_featured: true,
    stock_count: 9,
    vendor_model: 'LedVL Solar Flood 200',
    description:
      'Охранный прожектор с разнесённой панелью. Датчик движения на 120° выводит яркость на максимум на 30 секунд, между срабатываниями держит дежурные 20 % подсветки.',
    specs: {
      power: '200 Вт',
      led_count: '416 LED',
      panel_size: '350×350 мм, кабель 5 м',
      battery: 'LiFePO4 18 000 мА·ч',
      mode: 'датчик движения + сумеречный реле',
      area: '200 м²',
      ip_rating: 'IP67',
      luminous_flux: '26 000 лм',
      warranty: WARRANTY,
    },
    dims: { width: 300, height: 240, length: 60 },
    images: image('solar-flood'),
    category: { id: CATEGORY_SOLAR, name: 'Солнечные светильники (LedVL солнечные)' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000006', stock_pack_qty: 1, boxes_qty: 4, price: 7200 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_NEUTRAL, 'neutral', 'нейтральный белый'), tag(FILTER_POWER, 'мощность', POWER_HIGH, 'high', 'от 100 Вт')],
    created_at: '2026-01-14T10:00:00.000Z',
    updated_at: '2026-01-14T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000007',
    name: 'Садово-парковый бра 40 Вт',
    article: 'SV-WL-040',
    barcode: '4610053581268',
    base_price: 3800,
    wholesale_price: 3100,
    color: 'тёплый белый',
    is_available: true,
    is_featured: false,
    stock_count: 27,
    vendor_model: 'LedVL Solar Wall 40',
    description:
      'Настенный светильник для террас, входных групп и аллей. Корпус из литого алюминия с порошковой покраской, световой поток направлен вниз, чтобы не слепить в глаза.',
    specs: {
      power: '40 Вт',
      led_count: '84 LED',
      panel_size: '180×140 мм',
      battery: 'Li-ion 6000 мА·ч',
      mode: 'сумеречный реле',
      area: '45 м²',
      ip_rating: 'IP65',
      color_temperature: '3000 К',
      warranty: WARRANTY,
    },
    dims: { width: 210, height: 260, length: 95 },
    images: image('solar-wall'),
    category: { id: CATEGORY_SOLAR, name: 'Солнечные светильники (LedVL солнечные)' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000007', stock_pack_qty: 1, boxes_qty: 10, price: 3500 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_WARM, 'warm', 'тёплый белый'), tag(FILTER_POWER, 'мощность', POWER_MID, 'mid', '20–100 Вт')],
    created_at: '2026-01-14T10:00:00.000Z',
    updated_at: '2026-01-14T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000008',
    name: 'Настольный светильник Solar 18 Вт',
    article: 'SV-TB-018',
    barcode: '4610053581275',
    base_price: 2900,
    wholesale_price: 2300,
    color: 'тёплый белый',
    is_available: true,
    is_featured: false,
    stock_count: 61,
    vendor_model: 'LedVL Solar Table 18',
    description:
      'Переносной светильник на солнечной батарее для веранд и кафе. Заряжается от панели в основании, снимается с базы одним движением, на полном заряде держит три вечера.',
    specs: {
      power: '18 Вт',
      led_count: '36 LED',
      panel_size: '140 мм в диаметре',
      battery: 'Li-ion 4400 мА·ч',
      mode: 'сенсор, три уровня яркости',
      area: '15 м²',
      ip_rating: 'IP54',
      color_temperature: '2700–5000 К',
      warranty: WARRANTY,
    },
    dims: { width: 150, height: 320 },
    images: image('solar-table'),
    category: { id: CATEGORY_SOLAR, name: 'Солнечные светильники (LedVL солнечные)' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000008', stock_pack_qty: 2, boxes_qty: 12, price: 2600 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_WARM, 'warm', 'тёплый белый'), tag(FILTER_POWER, 'мощность', POWER_LOW, 'low', 'до 20 Вт')],
    created_at: '2026-01-14T10:00:00.000Z',
    updated_at: '2026-01-14T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000009',
    name: 'Солнечная гирлянда 12 м, 6 режимов',
    article: 'SV-GR-012',
    barcode: '4610053581282',
    base_price: 1900,
    wholesale_price: 1500,
    color: 'тёплый белый',
    is_available: false,
    is_featured: false,
    stock_count: 0,
    vendor_model: 'LedVL Solar String 12',
    description:
      'Гирлянда на солнечной батарее для беседок и деревьев. Панель выносится на открытое место, кабель остаётся в тени — так режимы переключаются без доступа к розетке.',
    specs: {
      power: '6 Вт',
      led_count: '96 LED',
      panel_size: '90×90 мм',
      battery: 'Ni-MH 1200 мА·ч',
      mode: '6 режимов, таймер 6/18 ч',
      area: '10 м²',
      ip_rating: 'IP65',
      color_temperature: '2700 К',
      warranty: WARRANTY,
    },
    dims: { width: 20, height: 20, length: 12000 },
    images: image('solar-garland'),
    category: { id: CATEGORY_SOLAR, name: 'Солнечные светильники (LedVL солнечные)' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000009', stock_pack_qty: 4, boxes_qty: 24, price: 1700 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_WARM, 'warm', 'тёплый белый'), tag(FILTER_POWER, 'мощность', POWER_LOW, 'low', 'до 20 Вт')],
    created_at: '2026-01-14T10:00:00.000Z',
    updated_at: '2026-01-14T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000010',
    name: 'Лампа LED E27 11 Вт, 4100 К',
    article: 'PR-LM-011E27',
    barcode: '4610053581299',
    base_price: 0,
    wholesale_price: null,
    color: 'нейтральный белый',
    is_available: true,
    is_featured: false,
    stock_count: 480,
    vendor_model: 'LedVL A60 11W',
    description: null,
    specs: {
      power: '11 Вт',
      input_voltage: '176–264 В',
      luminous_flux: '950 лм',
      color_temperature: '4100 К',
      beam_angle: '200°',
      warranty: WARRANTY,
    },
    dims: { width: 60, height: 108 },
    images: image('led-bulb'),
    category: { id: CATEGORY_PRICE_LIST, name: 'Прайс LedVL' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000010', stock_pack_qty: 10, boxes_qty: 50, price: 210 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_NEUTRAL, 'neutral', 'нейтральный белый'), tag(FILTER_POWER, 'мощность', POWER_LOW, 'low', 'до 20 Вт')],
    created_at: '2026-01-16T10:00:00.000Z',
    updated_at: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000011',
    name: 'Панель LED встраиваемая 36 Вт 595×595',
    article: 'PR-PN-036SQ',
    barcode: '4610053581305',
    base_price: 0,
    wholesale_price: null,
    color: 'нейтральный белый',
    is_available: true,
    is_featured: false,
    stock_count: 156,
    vendor_model: 'LedVL Panel SQ36',
    description: null,
    specs: {
      power: '36 Вт',
      input_voltage: '176–264 В',
      luminous_flux: '3200 лм',
      color_temperature: '4000 К',
      beam_angle: '120°',
      params: 'под армстронг 595×595, микродрайвер',
      warranty: WARRANTY,
    },
    dims: { width: 595, height: 595, length: 38 },
    images: image('led-panel'),
    category: { id: CATEGORY_PRICE_LIST, name: 'Прайс LedVL' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000011', stock_pack_qty: 4, boxes_qty: 20, price: 980 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_NEUTRAL, 'neutral', 'нейтральный белый'), tag(FILTER_POWER, 'мощность', POWER_MID, 'mid', '20–100 Вт')],
    created_at: '2026-01-16T10:00:00.000Z',
    updated_at: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'p0000000-0000-0000-0000-000000000012',
    name: 'Лента LED 12 В, 300 LED / 5 м',
    article: 'PR-ST-300W',
    barcode: '4610053581312',
    base_price: 0,
    wholesale_price: null,
    color: 'тёплый белый',
    is_available: true,
    is_featured: false,
    stock_count: 210,
    vendor_model: 'LedVL Strip 300',
    description: null,
    specs: {
      power: '60 Вт',
      input_voltage: '12 В',
      led_count: '300 LED',
      color_temperature: '3000 К',
      params: 'SMD 2835, двухслойная текстолитовая основа',
      warranty: WARRANTY,
    },
    dims: { width: 8, height: 2, length: 5000 },
    images: image('led-strip'),
    category: { id: CATEGORY_PRICE_LIST, name: 'Прайс LedVL' },
    price_list_entries: [
      { id: 'pl000000-0000-0000-0000-000000000012', stock_pack_qty: 5, boxes_qty: 20, price: 1350 },
    ],
    filter_values: [tag(FILTER_COLOR, 'Цвет', COLOR_WARM, 'warm', 'тёплый белый'), tag(FILTER_POWER, 'мощность', POWER_MID, 'mid', '20–100 Вт')],
    created_at: '2026-01-16T10:00:00.000Z',
    updated_at: '2026-01-16T10:00:00.000Z',
  },
]
