import React from 'react';
import { Menu as MenuIcon, Database, CheckCircle2, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { NavItemKey } from './Sidebar';

interface HeaderProps {
  currentView: NavItemKey;
  onOpenMobileSidebar: () => void;
  onQuickAction: () => void;
  isDbConnected: boolean;
}

const titleMap: Record<NavItemKey, { title: string; subtitle: string }> = {
  'dashboard-catering': { title: 'Dashboard Catering', subtitle: 'Ikhtisar pesanan, pendapatan, dan operasional hari ini' },
  'customers': { title: 'Data Pelanggan', subtitle: 'Kelola kontak, alamat, dan riwayat pesanan pelanggan' },
  'catering-menus': { title: 'Menu Catering', subtitle: 'Katalog hidangan paket nasi box, prasmanan, dan snack' },
  'orders': { title: 'Pesanan Catering', subtitle: 'Pencatatan pesanan, status pembayaran, dan kalkulasi tagihan' },
  'production': { title: 'Jadwal & Rekap Produksi', subtitle: 'Akumulasi kebutuhan porsi menu katering berdasarkan tanggal' },
  'catering-ingredients': { title: 'Bahan Baku & Stok', subtitle: 'Stok fisik, peringatan stok menipis, dan supplier' },
  'shipments': { title: 'Pengiriman & Surat Jalan', subtitle: 'Penugasan kurir, status pengantaran boks katering' },
  'payments': { title: 'Transaksi Pembayaran', subtitle: 'Pencatatan DP, pelunasan transfer, QRIS, dan sisa tagihan' },
  'dashboard-recipe': { title: 'Dashboard Recipe & Food Cost', subtitle: 'Analisis persentase food cost, HPP per porsi, dan margin keuntungan' },
  'recipe-bank': { title: 'Bank Resep Masakan', subtitle: 'Standard Operating Recipe (SOP) dengan kalkulasi HPP otomatis' },
  'recipe-ingredients': { title: 'Master Bahan Baku Resep', subtitle: 'Daftar bahan baku dan harga pokok per gram / ml' },
  'categories': { title: 'Master Kategori', subtitle: 'Kelompok kategori bahan baku, resep hidangan, dan menu jual' },
  'units': { title: 'Satuan & Konversi', subtitle: 'Tabel konversi berat dan volume untuk perhitungan HPP akurat' },
  'sub-recipes': { title: 'Manajemen Sub-Recipe', subtitle: 'Resep bumbu dasar, sambal, dan adonan yang dipakai di resep utama' },
  'selling-menus': { title: 'Katalog Menu Jual', subtitle: 'Sinkronisasi resep ke menu komersial beserta food cost target' },
  'price-history': { title: 'Riwayat Perubahan Harga', subtitle: 'Histori fluktuasi harga bahan dan dampaknya pada HPP' },
  'recipe-versions': { title: 'Versi Resep', subtitle: 'Audit resep v1, v2, v3 untuk menjaga efisiensi dan kualitas rasa' },
  'reports': { title: 'Pusat Laporan & Analitik', subtitle: 'Laporan pesanan, penjualan, margin, produksi dan ekspor CSV/Print' },
  'notifications': { title: 'Notifikasi & Gmail Webhook', subtitle: 'Pengiriman email konfirmasi dan invoice via Google Apps Script' },
  'settings': { title: 'Pengaturan Sistem', subtitle: 'Koneksi Supabase, webhook URL, dan informasi instansi/sekolah' },
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileSidebar,
  onQuickAction,
  isDbConnected,
}) => {
  const currentInfo = titleMap[currentView] || { title: 'Catering Pro', subtitle: 'Sistem Vokasi' };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {currentInfo.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Database Status Tag */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          isDbConnected 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <Database className="h-3.5 w-3.5" />
          <span>{isDbConnected ? 'Supabase Connected' : 'Supabase Ready (Seed Data Active)'}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onQuickAction}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition shadow-amber-600/20"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Aksi Cepat</span>
        </button>
      </div>
    </header>
  );
};
