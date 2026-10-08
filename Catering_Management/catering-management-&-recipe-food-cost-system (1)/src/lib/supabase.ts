import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve config from localStorage (for interactive setup in Settings) or env variables
export const getStoredSupabaseConfig = () => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('catering_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('catering_supabase_anon_key') : null;

  const url = (localUrl || import.meta.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !url.includes('placeholder-domain')
  );

  return { url, anonKey, isConfigured };
};

let currentConfig = getStoredSupabaseConfig();

export let isSupabaseConfigured = currentConfig.isConfigured;

export let supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? currentConfig.url : 'https://placeholder-domain.supabase.co',
  isSupabaseConfigured ? currentConfig.anonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Re-initialize Supabase client dynamically when user saves credentials in Settings
 */
export const updateSupabaseClient = (url: string, anonKey: string): boolean => {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  const isValid = Boolean(
    cleanUrl &&
    cleanKey &&
    cleanUrl.startsWith('https://') &&
    !cleanUrl.includes('your-project-id')
  );

  if (isValid) {
    localStorage.setItem('catering_supabase_url', cleanUrl);
    localStorage.setItem('catering_supabase_anon_key', cleanKey);
    supabase = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    isSupabaseConfigured = true;
    return true;
  } else {
    localStorage.removeItem('catering_supabase_url');
    localStorage.removeItem('catering_supabase_anon_key');
    supabase = createClient('https://placeholder-domain.supabase.co', 'placeholder-anon-key');
    isSupabaseConfigured = false;
    return false;
  }
};

/**
 * Test live connection to Supabase database
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const cfg = getStoredSupabaseConfig();
  if (!cfg.isConfigured) {
    return {
      success: false,
      message: 'Supabase URL dan Anon Key belum dikonfigurasi.',
    };
  }

  try {
    // Try pinging or selecting from customers table
    const { error, count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // If table does not exist or permission error
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Terkoneksi ke Supabase, namun tabel belum dibuat. Silakan jalankan schema.sql di SQL Editor Supabase.',
        };
      }
      return {
        success: false,
        message: `Error dari Supabase: ${error.message} (Kode: ${error.code})`,
      };
    }

    return {
      success: true,
      message: `Berhasil terhubung ke Supabase! (Ditemukan ${count ?? 0} data pelanggan)`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi server Supabase: ${err.message || 'Periksa koneksi internet.'}`,
    };
  }
};
