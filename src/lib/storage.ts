import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Storage adapter yang memprioritaskan Supabase bila telah dikonfigurasi,
 * dengan sinkronisasi fallback lokal agar data tetap awet saat refresh di lingkungan evaluasi/preview.
 */
export const loadSavedData = <T>(key: string, defaultData: T): T => {
  try {
    const raw = localStorage.getItem(`catering_app_${key}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Failed to read ${key} from storage:`, err);
  }
  return defaultData;
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`catering_app_${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save ${key} to storage:`, err);
  }
};

/**
 * Ambil data dari tabel Supabase
 */
export const fetchFromSupabase = async <T>(tableName: string): Promise<T[] | null> => {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.warn(`Supabase fetch failed on ${tableName}:`, error.message);
      return null;
    }
    return data as T[];
  } catch (err) {
    console.error(`Unexpected error fetching ${tableName}:`, err);
    return null;
  }
};

/**
 * Sinkronisasi/Simpan data baru ke Supabase (INSERT / UPSERT)
 */
export const syncWithSupabase = async (tableName: string, record: any): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from(tableName).upsert(record);
    if (error) {
      console.warn(`Supabase upsert error on ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Supabase sync error on ${tableName}:`, err);
    return false;
  }
};

/**
 * Hapus data dari Supabase (DELETE)
 */
export const deleteFromSupabase = async (tableName: string, id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete error on ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Supabase delete error on ${tableName}:`, err);
    return false;
  }
};

/**
 * Bulk Seed Data Awal ke Supabase (1-Klik dari UI Pengaturan)
 * Berguna saat guru / siswa baru saja membuat project Supabase dan ingin mengisi data demo.
 */
export const seedAllToSupabase = async (data: {
  categories: any[];
  units: any[];
  customers: any[];
  ingredients: any[];
  recipes: any[];
  menus: any[];
  orders: any[];
  productions: any[];
  shipments: any[];
  payments: any[];
}): Promise<{ success: boolean; message: string; details?: Record<string, number> }> => {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase belum dikonfigurasi. Masukkan URL dan Anon Key terlebih dahulu.',
    };
  }

  const results: Record<string, number> = {};

  try {
    // 1. Categories
    if (data.categories?.length) {
      const { error } = await supabase.from('categories').upsert(data.categories);
      if (!error) results.categories = data.categories.length;
    }

    // 2. Units
    if (data.units?.length) {
      const { error } = await supabase.from('units').upsert(data.units);
      if (!error) results.units = data.units.length;
    }

    // 3. Customers
    if (data.customers?.length) {
      const { error } = await supabase.from('customers').upsert(data.customers);
      if (!error) results.customers = data.customers.length;
    }

    // 4. Ingredients
    if (data.ingredients?.length) {
      const { error } = await supabase.from('ingredients').upsert(data.ingredients);
      if (!error) results.ingredients = data.ingredients.length;
    }

    // 5. Recipes (Hapus nested ingredients array jika ada tabel terpisah)
    if (data.recipes?.length) {
      const flatRecipes = data.recipes.map((r) => {
        const { ingredients: _ing, versions: _ver, ...rest } = r;
        return rest;
      });
      const { error } = await supabase.from('recipes').upsert(flatRecipes);
      if (!error) results.recipes = flatRecipes.length;
    }

    // 6. Menus
    if (data.menus?.length) {
      const { error } = await supabase.from('menus').upsert(data.menus);
      if (!error) results.menus = data.menus.length;
    }

    // 7. Orders
    if (data.orders?.length) {
      const flatOrders = data.orders.map((o) => {
        const { items: _items, ...rest } = o;
        return rest;
      });
      const { error } = await supabase.from('orders').upsert(flatOrders);
      if (!error) results.orders = flatOrders.length;
    }

    // 8. Production
    if (data.productions?.length) {
      const { error } = await supabase.from('production').upsert(data.productions);
      if (!error) results.productions = data.productions.length;
    }

    // 9. Shipments
    if (data.shipments?.length) {
      const { error } = await supabase.from('shipments').upsert(data.shipments);
      if (!error) results.shipments = data.shipments.length;
    }

    // 10. Payments
    if (data.payments?.length) {
      const { error } = await supabase.from('payments').upsert(data.payments);
      if (!error) results.payments = data.payments.length;
    }

    return {
      success: true,
      message: 'Seluruh data demo berhasil disinkronkan ke Supabase Cloud!',
      details: results,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal melakukan sinkronisasi massal: ${err.message || 'Periksa skema tabel di Supabase.'}`,
    };
  }
};
