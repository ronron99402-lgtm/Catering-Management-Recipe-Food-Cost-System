import { supabase, isSupabaseConfigured } from './supabase';
import {
  Customer,
  Ingredient,
  Recipe,
  Menu,
  Order,
  Production,
  Shipment,
  Payment,
  Category,
  Unit,
  IngredientPriceHistory,
  RecipeVersion,
} from '../types/database';
import { loadSavedData, saveData } from './storage';

export interface DatabaseState {
  customers: Customer[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  menus: Menu[];
  orders: Order[];
  productions: Production[];
  shipments: Shipment[];
  payments: Payment[];
  categories: Category[];
  units: Unit[];
  priceHistories: IngredientPriceHistory[];
  recipeVersions: RecipeVersion[];
}

export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase URL & Anon Key belum diatur di file .env. Menggunakan data persistensi browser aktif.',
    };
  }

  try {
    const { data, error } = await supabase.from('categories').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Koneksi Supabase error: ${error.message}. Pastikan schema.sql sudah dijalankan di SQL Editor.`,
      };
    }
    return {
      connected: true,
      message: 'Terhubung ke database Supabase Cloud (PostgreSQL)!',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Gagal menghubungi Supabase: ${err.message}`,
    };
  }
}

/**
 * Mengambil data dari Supabase jika terhubung, atau fallback ke saved state lokal
 */
export async function loadInitialData(fallback: DatabaseState): Promise<DatabaseState> {
  if (!isSupabaseConfigured) {
    return {
      customers: loadSavedData('customers', fallback.customers),
      ingredients: loadSavedData('ingredients', fallback.ingredients),
      recipes: loadSavedData('recipes', fallback.recipes),
      menus: loadSavedData('menus', fallback.menus),
      orders: loadSavedData('orders', fallback.orders),
      productions: loadSavedData('productions', fallback.productions),
      shipments: loadSavedData('shipments', fallback.shipments),
      payments: loadSavedData('payments', fallback.payments),
      categories: loadSavedData('categories', fallback.categories),
      units: loadSavedData('units', fallback.units),
      priceHistories: loadSavedData('price_history', fallback.priceHistories),
      recipeVersions: loadSavedData('recipe_versions', fallback.recipeVersions),
    };
  }

  try {
    const [
      custRes,
      ingRes,
      rcpRes,
      mnuRes,
      ordRes,
      prodRes,
      shipRes,
      payRes,
      catRes,
      unitRes,
      histRes,
    ] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('ingredients').select('*'),
      supabase.from('recipes').select('*'),
      supabase.from('menus').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('production').select('*'),
      supabase.from('shipments').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('units').select('*'),
      supabase.from('ingredient_price_history').select('*'),
    ]);

    return {
      customers: custRes.data && custRes.data.length > 0 ? custRes.data : loadSavedData('customers', fallback.customers),
      ingredients: ingRes.data && ingRes.data.length > 0 ? ingRes.data : loadSavedData('ingredients', fallback.ingredients),
      recipes: rcpRes.data && rcpRes.data.length > 0 ? rcpRes.data : loadSavedData('recipes', fallback.recipes),
      menus: mnuRes.data && mnuRes.data.length > 0 ? mnuRes.data : loadSavedData('menus', fallback.menus),
      orders: ordRes.data && ordRes.data.length > 0 ? ordRes.data : loadSavedData('orders', fallback.orders),
      productions: prodRes.data && prodRes.data.length > 0 ? prodRes.data : loadSavedData('productions', fallback.productions),
      shipments: shipRes.data && shipRes.data.length > 0 ? shipRes.data : loadSavedData('shipments', fallback.shipments),
      payments: payRes.data && payRes.data.length > 0 ? payRes.data : loadSavedData('payments', fallback.payments),
      categories: catRes.data && catRes.data.length > 0 ? catRes.data : loadSavedData('categories', fallback.categories),
      units: unitRes.data && unitRes.data.length > 0 ? unitRes.data : loadSavedData('units', fallback.units),
      priceHistories: histRes.data && histRes.data.length > 0 ? histRes.data : loadSavedData('price_history', fallback.priceHistories),
      recipeVersions: loadSavedData('recipe_versions', fallback.recipeVersions),
    };
  } catch (err) {
    console.warn('Gagal memuat data langsung dari Supabase, beralih ke cache browser:', err);
    return {
      customers: loadSavedData('customers', fallback.customers),
      ingredients: loadSavedData('ingredients', fallback.ingredients),
      recipes: loadSavedData('recipes', fallback.recipes),
      menus: loadSavedData('menus', fallback.menus),
      orders: loadSavedData('orders', fallback.orders),
      productions: loadSavedData('productions', fallback.productions),
      shipments: loadSavedData('shipments', fallback.shipments),
      payments: loadSavedData('payments', fallback.payments),
      categories: loadSavedData('categories', fallback.categories),
      units: loadSavedData('units', fallback.units),
      priceHistories: loadSavedData('price_history', fallback.priceHistories),
      recipeVersions: loadSavedData('recipe_versions', fallback.recipeVersions),
    };
  }
}

/**
 * Operasi database Supabase aman (INSERT / UPSERT)
 */
export async function dbInsertRecord(table: string, record: any): Promise<{ success: boolean; error?: string }> {
  saveData(table, record);
  if (!isSupabaseConfigured) return { success: true };

  try {
    const { error } = await supabase.from(table).upsert(record);
    if (error) {
      console.error(`Supabase Insert error on ${table}:`, error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Operasi database Supabase aman (DELETE)
 */
export async function dbDeleteRecord(table: string, id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Supabase Delete error on ${table}:`, error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
