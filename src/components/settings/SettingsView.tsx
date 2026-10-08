import React, { useState } from 'react';
import {
  Settings,
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  getStoredSupabaseConfig,
  updateSupabaseClient,
  testSupabaseConnection,
} from '../../lib/supabase';
import { seedAllToSupabase } from '../../lib/storage';
import {
  initialCategories,
  initialUnits,
  initialCustomers,
  initialIngredients,
  initialRecipes,
  initialMenus,
  initialOrders,
  initialProduction,
  initialShipments,
  initialPayments,
} from '../../data/initialData';

interface SettingsViewProps {
  onRefreshData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshData }) => {
  const currentCfg = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentCfg.url || '');
  const [anonKey, setAnonKey] = useState(currentCfg.anonKey || '');
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const updated = updateSupabaseClient(supabaseUrl, anonKey);
    if (!updated) {
      setTestResult({
        success: false,
        message: 'Mohon masukkan Supabase URL (berawalan https://) dan Anon Key yang valid.',
      });
      setIsTesting(false);
      return;
    }

    const test = await testSupabaseConnection();
    setTestResult(test);
    setIsTesting(false);

    if (test.success && onRefreshData) {
      onRefreshData();
    }
  };

  const handleDisconnect = () => {
    updateSupabaseClient('', '');
    setSupabaseUrl('');
    setAnonKey('');
    setTestResult({
      success: true,
      message: 'Koneksi cloud diputus. Sistem beralih ke penyimpanan lokal browser.',
    });
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const handleTestOnly = async () => {
    setIsTesting(true);
    setTestResult(null);
    const test = await testSupabaseConnection();
    setTestResult(test);
    setIsTesting(false);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    const res = await seedAllToSupabase({
      categories: initialCategories,
      units: initialUnits,
      customers: initialCustomers,
      ingredients: initialIngredients,
      recipes: initialRecipes,
      menus: initialMenus,
      orders: initialOrders,
      productions: initialProduction,
      shipments: initialShipments,
      payments: initialPayments,
    });

    setSeedResult(res);
    setIsSeeding(false);

    if (res.success && onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Kartu Informasi Akun Uji Coba Guru / Penguji */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold inline-block mb-1.5">
              Akun Pengujian Evaluasi Proyek Vokasi
            </span>
            <h3 className="text-xl font-bold">Kredensial Demo Pengguna & Hak Akses</h3>
            <p className="text-xs text-amber-100 mt-0.5">
              Tersedia 4 akun pengujian resmi yang dapat langsung digunakan untuk demonstrasi:
            </p>
          </div>

          <button
            onClick={() => handleCopyCredentials(`1. Admin: admin / Admin123!\n2. Head Chef: chef / Chef123!\n3. Staff Kasir: staff / Staff123!\n4. Manajer: manager / Manager123!`)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer w-fit"
          >
            <Copy className="h-4 w-4" />
            <span>{copied ? 'Tersalin!' : 'Salin Semua Akun'}</span>
          </button>
        </div>

        {/* 4 Kartu Akun Pengguna */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-black/20 p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-amber-300 block">👑 Administrator</span>
            <p className="text-[11px] text-amber-100 font-medium">Admin Vokasi Tata Boga</p>
            <div className="font-mono text-[11px] bg-black/20 px-2 py-1.5 rounded-lg mt-2">
              <p>User: <strong>admin</strong></p>
              <p>Pass: <strong>Admin123!</strong></p>
            </div>
          </div>

          <div className="bg-black/20 p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-amber-300 block">🍳 Head Chef</span>
            <p className="text-[11px] text-amber-100 font-medium">Chef Rudi Hartono</p>
            <div className="font-mono text-[11px] bg-black/20 px-2 py-1.5 rounded-lg mt-2">
              <p>User: <strong>chef</strong></p>
              <p>Pass: <strong>Chef123!</strong></p>
            </div>
          </div>

          <div className="bg-black/20 p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-amber-300 block">📦 Staff Kasir / Kurir</span>
            <p className="text-[11px] text-amber-100 font-medium">Siti Nurhaliza</p>
            <div className="font-mono text-[11px] bg-black/20 px-2 py-1.5 rounded-lg mt-2">
              <p>User: <strong>staff</strong></p>
              <p>Pass: <strong>Staff123!</strong></p>
            </div>
          </div>

          <div className="bg-black/20 p-3.5 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-amber-300 block">📊 Manajer Catering</span>
            <p className="text-[11px] text-amber-100 font-medium">Dra. Endang Wahyuni</p>
            <div className="font-mono text-[11px] bg-black/20 px-2 py-1.5 rounded-lg mt-2">
              <p>User: <strong>manager</strong></p>
              <p>Pass: <strong>Manager123!</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Connection Setup */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-amber-600" />
            <div>
              <h4 className="font-bold text-slate-900 text-base">Konfigurasi Database Supabase</h4>
              <p className="text-xs text-slate-500">Koneksi PostgreSQL Cloud & Supabase Auth</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${
              isSupabaseConfigured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isSupabaseConfigured ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Terhubung ke Supabase Cloud</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>Mode Penyimpanan Lokal (Siap Hubungkan Cloud)</span>
              </>
            )}
          </span>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {seedResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              seedResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {seedResult.success ? (
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{seedResult.message}</span>
          </div>
        )}

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              SUPABASE PROJECT URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              SUPABASE ANON PUBLIC KEY (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Gunakan Anon (Public) Key. Jangan masukkan Service Role Secret di frontend.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveConnection}
              disabled={isTesting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Simpan & Hubungkan Database</span>
            </button>

            {isSupabaseConfigured && (
              <>
                <button
                  onClick={handleTestOnly}
                  disabled={isTesting}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Server className="h-3.5 w-3.5 text-slate-600" />
                  <span>Tes Koneksi</span>
                </button>

                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin' : 'text-indigo-600'}`} />
                  <span>{isSeeding ? 'Menyinkronkan...' : '1-Klik Seed Data Demo ke Supabase'}</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition ml-auto cursor-pointer"
                >
                  Putuskan Koneksi Cloud
                </button>
              </>
            )}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 mt-4">
            <h5 className="font-bold text-slate-900">Petunjuk Setup Database Siswa di Supabase:</h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed text-[11px]">
              <li>Buat proyek baru gratis di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold">Supabase.com</a>.</li>
              <li>Buka menu <strong>SQL Editor</strong> di dashboard Supabase.</li>
              <li>Salin seluruh isi file <code>/supabase/schema.sql</code> dari proyek ini lalu klik <strong>Run</strong>.</li>
              <li>Klik tombol <strong>"1-Klik Seed Data Demo ke Supabase"</strong> di atas atau salin <code>/supabase/seed.sql</code>.</li>
              <li>Data Anda sekarang langsung tersimpan dan tersinkronisasi secara real-time di Supabase PostgreSQL Cloud!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Deployment Ready Guide: Netlify / Vercel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Globe className="h-5 w-5 text-indigo-600" />
          <div>
            <h4 className="font-bold text-slate-900 text-base">Panduan Deployment ke Netlify / Vercel</h4>
            <p className="text-xs text-slate-500">Siap publikasi untuk penilaian ujian vokasi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-sm">Deploy ke Vercel:</span>
            <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
              <li>Build Command: <code>npm run build</code></li>
              <li>Output Directory: <code>dist</code></li>
              <li>Tambahkan Environment Variables di Vercel:
                <br />• <code>VITE_SUPABASE_URL</code>
                <br />• <code>VITE_SUPABASE_ANON_KEY</code>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-sm">Deploy ke Netlify:</span>
            <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
              <li>Build Command: <code>npm run build</code></li>
              <li>Publish Directory: <code>dist</code></li>
              <li>Setting Environment Variables pada menu Site configuration.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
