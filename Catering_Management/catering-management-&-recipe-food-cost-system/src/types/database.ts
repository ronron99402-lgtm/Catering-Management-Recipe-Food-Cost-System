export type UserRole = 'admin' | 'chef' | 'staff' | 'manager';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export type CategoryType = 'ingredient' | 'recipe' | 'menu';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  base_unit: 'gram' | 'ml' | 'pcs';
  conversion_factor: number; // e.g. 1000 for kg->gram, 1000 for liter->ml
  description?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  created_at?: string;
}

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  category_id?: string;
  category?: Category;
  unit_id: string;
  unit?: Unit;
  purchase_price: number;
  price_per_base_unit: number; // calculated per gram or per ml
  stock: number;
  min_stock: number;
  supplier?: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
}

export interface IngredientPriceHistory {
  id: string;
  ingredient_id: string;
  ingredient_name?: string;
  old_price: number;
  new_price: number;
  change_date: string;
  changed_by?: string;
  notes?: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id?: string;
  ingredient?: Ingredient;
  sub_recipe_id?: string;
  sub_recipe?: Recipe;
  quantity: number;
  unit_id: string;
  unit?: Unit;
  unit_cost: number;
  subtotal_cost: number;
  notes?: string;
}

export interface RecipeVersion {
  id: string;
  recipe_id: string;
  version_number: number;
  total_cost: number;
  cost_per_portion: number;
  ingredients_snapshot: any[];
  change_summary?: string;
  created_by?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  code: string;
  name: string;
  category_id?: string;
  category?: Category;
  is_sub_recipe: boolean;
  image_url?: string;
  description?: string;
  yield_quantity: number; // Hasil produksi, misal 10 porsi
  yield_unit: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  instructions?: string;
  target_food_cost_pct: number; // Misal 35%
  selling_price?: number;
  active_version: number;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  
  // Computed fields
  total_cost?: number;
  cost_per_portion?: number;
  food_cost_pct?: number;
  margin_pct?: number;
  gross_profit?: number;
  ingredients?: RecipeIngredient[];
}

export interface Menu {
  id: string;
  code: string;
  name: string;
  category_id?: string;
  category?: Category;
  recipe_id?: string;
  recipe?: Recipe;
  unit: string;
  selling_price: number;
  cost_price: number; // HPP
  food_cost_pct: number;
  margin_pct: number;
  image_url?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export type OrderStatus = 
  | 'Draft' 
  | 'Menunggu pembayaran' 
  | 'Diproses' 
  | 'Produksi' 
  | 'Siap dikirim' 
  | 'Selesai' 
  | 'Dibatalkan';

export type PaymentStatus = 'Belum Bayar' | 'DP Sebagian' | 'Lunas';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  menu?: Menu;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer?: Customer;
  order_date: string;
  event_date: string;
  event_time?: string;
  event_type: string;
  event_location: string;
  subtotal: number;
  discount: number;
  additional_cost: number;
  total_amount: number;
  down_payment: number;
  remaining_balance: number;
  payment_status: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  items?: OrderItem[];
  created_at?: string;
}

export type ProductionStatus = 'Belum diproses' | 'Diproses' | 'Selesai';

export interface Production {
  id: string;
  production_date: string;
  order_id: string;
  order?: Order;
  menu_id: string;
  menu?: Menu;
  portions_needed: number;
  status: ProductionStatus;
  notes?: string;
  created_at?: string;
}

export type ShipmentStatus = 'Belum dikirim' | 'Dalam perjalanan' | 'Terkirim' | 'Gagal dikirim';

export interface Shipment {
  id: string;
  order_id: string;
  order?: Order;
  delivery_date: string;
  delivery_time: string;
  courier_name?: string;
  package_count: number;
  destination_address: string;
  recipient_phone: string;
  status: ShipmentStatus;
  notes?: string;
  created_at?: string;
}

export type PaymentMethod = 'Cash' | 'Transfer' | 'QRIS';
export type PaymentType = 'DP' | 'Pelunasan' | 'Cicilan';

export interface Payment {
  id: string;
  payment_number: string;
  order_id: string;
  order?: Order;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  reference_number?: string;
  notes?: string;
  created_at?: string;
}

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  recipient_email?: string;
  type: 'order_confirmation' | 'payment_reminder' | 'production_reminder' | 'shipment_reminder' | 'system';
  status: 'pending' | 'sent' | 'failed';
  created_at?: string;
}
