import React from 'react';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  PackageCheck,
  Truck,
  CreditCard,
  FileSpreadsheet,
  Settings,
  Bell,
  LogOut,
  FolderTree,
  Scale,
  Sparkles,
  History,
  GitBranch,
  X,
  CookingPot,
  Flame,
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard-catering'
  | 'customers'
  | 'catering-menus'
  | 'orders'
  | 'production'
  | 'catering-ingredients'
  | 'shipments'
  | 'payments'
  | 'dashboard-recipe'
  | 'recipe-bank'
  | 'recipe-ingredients'
  | 'categories'
  | 'units'
  | 'sub-recipes'
  | 'selling-menus'
  | 'price-history'
  | 'recipe-versions'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  currentView: NavItemKey;
  onNavigate: (view: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  orderCount?: number;
  lowStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  orderCount = 0,
  lowStockCount = 0,
}) => {
  const handleItemClick = (key: NavItemKey) => {
    onNavigate(key);
    onCloseMobile();
  };

  const navButtonClass = (key: NavItemKey) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      currentView === key
        ? 'bg-amber-600 text-white shadow-sm font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-72">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
              CATERING PRO
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Recipe & Food Cost System</p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Main Dashboard */}
        <div>
          <button
            onClick={() => handleItemClick('dashboard-catering')}
            className={navButtonClass('dashboard-catering')}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Dashboard Utama</span>
          </button>
        </div>

        {/* Catering Management */}
        <div className="space-y-1">
          <div className="px-3 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Catering Management
            </span>
          </div>
          <button onClick={() => handleItemClick('customers')} className={navButtonClass('customers')}>
            <Users className="h-4 w-4 shrink-0" />
            <span>Pelanggan</span>
          </button>
          <button onClick={() => handleItemClick('catering-menus')} className={navButtonClass('catering-menus')}>
            <UtensilsCrossed className="h-4 w-4 shrink-0" />
            <span>Menu Catering</span>
          </button>
          <button onClick={() => handleItemClick('orders')} className={navButtonClass('orders')}>
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Pesanan</span>
            {orderCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentView === 'orders' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {orderCount}
              </span>
            )}
          </button>
          <button onClick={() => handleItemClick('production')} className={navButtonClass('production')}>
            <PackageCheck className="h-4 w-4 shrink-0" />
            <span>Produksi</span>
          </button>
          <button onClick={() => handleItemClick('catering-ingredients')} className={navButtonClass('catering-ingredients')}>
            <CookingPot className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Bahan Baku</span>
            {lowStockCount > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentView === 'catering-ingredients' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-700'}`}>
                {lowStockCount} low
              </span>
            )}
          </button>
          <button onClick={() => handleItemClick('shipments')} className={navButtonClass('shipments')}>
            <Truck className="h-4 w-4 shrink-0" />
            <span>Pengiriman</span>
          </button>
          <button onClick={() => handleItemClick('payments')} className={navButtonClass('payments')}>
            <CreditCard className="h-4 w-4 shrink-0" />
            <span>Pembayaran</span>
          </button>
        </div>

        {/* Recipe & Food Cost */}
        <div className="space-y-1">
          <div className="px-3 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Recipe & Food Cost
            </span>
          </div>
          <button onClick={() => handleItemClick('dashboard-recipe')} className={navButtonClass('dashboard-recipe')}>
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Dashboard Recipe</span>
          </button>
          <button onClick={() => handleItemClick('recipe-bank')} className={navButtonClass('recipe-bank')}>
            <ChefHat className="h-4 w-4 shrink-0" />
            <span>Bank Resep</span>
          </button>
          <button onClick={() => handleItemClick('sub-recipes')} className={navButtonClass('sub-recipes')}>
            <Flame className="h-4 w-4 shrink-0" />
            <span>Sub-Recipe</span>
          </button>
          <button onClick={() => handleItemClick('selling-menus')} className={navButtonClass('selling-menus')}>
            <UtensilsCrossed className="h-4 w-4 shrink-0" />
            <span>Menu Jual</span>
          </button>
          <button onClick={() => handleItemClick('categories')} className={navButtonClass('categories')}>
            <FolderTree className="h-4 w-4 shrink-0" />
            <span>Kategori</span>
          </button>
          <button onClick={() => handleItemClick('units')} className={navButtonClass('units')}>
            <Scale className="h-4 w-4 shrink-0" />
            <span>Satuan & Konversi</span>
          </button>
          <button onClick={() => handleItemClick('price-history')} className={navButtonClass('price-history')}>
            <History className="h-4 w-4 shrink-0" />
            <span>Riwayat Harga Bahan</span>
          </button>
          <button onClick={() => handleItemClick('recipe-versions')} className={navButtonClass('recipe-versions')}>
            <GitBranch className="h-4 w-4 shrink-0" />
            <span>Versi Resep</span>
          </button>
        </div>

        {/* Laporan & Sistem */}
        <div className="space-y-1">
          <div className="px-3 pb-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Laporan & Sistem
            </span>
          </div>
          <button onClick={() => handleItemClick('reports')} className={navButtonClass('reports')}>
            <FileSpreadsheet className="h-4 w-4 shrink-0" />
            <span>Pusat Laporan</span>
          </button>
          <button onClick={() => handleItemClick('notifications')} className={navButtonClass('notifications')}>
            <Bell className="h-4 w-4 shrink-0" />
            <span>Notifikasi Gmail</span>
          </button>
          <button onClick={() => handleItemClick('settings')} className={navButtonClass('settings')}>
            <Settings className="h-4 w-4 shrink-0" />
            <span>Pengaturan & DB</span>
          </button>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">Admin Vokasi</p>
              <p className="text-[10px] text-slate-500 truncate">admin@vokasi.sch.id</p>
            </div>
          </div>
          <button
            onClick={() => handleItemClick('dashboard-catering')}
            title="Keluar / Reset"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onCloseMobile} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
