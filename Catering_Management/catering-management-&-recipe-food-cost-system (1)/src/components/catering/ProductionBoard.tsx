import React, { useState } from 'react';
import {
  PackageCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  UtensilsCrossed,
  Printer,
  CookingPot,
  Scale,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Production, Order, Menu, Recipe, Ingredient, Unit, ProductionStatus } from '../../types/database';

interface ProductionBoardProps {
  productions: Production[];
  orders: Order[];
  menus: Menu[];
  recipes?: Recipe[];
  ingredients?: Ingredient[];
  units?: Unit[];
  onUpdateProductionStatus: (prodId: string, status: ProductionStatus) => void;
}

export const ProductionBoard: React.FC<ProductionBoardProps> = ({
  productions,
  orders,
  menus,
  recipes = [],
  ingredients = [],
  units = [],
  onUpdateProductionStatus,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'schedule' | 'ingredients'>('schedule');

  // Ambil daftar tanggal produksi unik
  const uniqueDates = Array.from(new Set(productions.map((p) => p.production_date))).sort();

  const filteredProductions = productions.filter(
    (p) => selectedDate === 'all' || p.production_date === selectedDate
  );

  const getMenuName = (mId: string) => menus.find((m) => m.id === mId)?.name || 'Menu Katering';
  const getOrderNumber = (oId: string) => orders.find((o) => o.id === oId)?.order_number || oId;

  // REKAP PRODUKSI BERDASARKAN TANGGAL:
  // Menjumlahkan kebutuhan porsi per menu untuk tanggal yang dipilih
  const aggregatedProduction: Record<string, { menuName: string; totalPortions: number; unit: string; recipeId?: string }> = {};

  filteredProductions.forEach((prod) => {
    const menu = menus.find((m) => m.id === prod.menu_id);
    const menuName = menu ? menu.name : 'Menu Katering';
    const unit = menu ? menu.unit : 'porsi';

    if (!aggregatedProduction[prod.menu_id]) {
      aggregatedProduction[prod.menu_id] = {
        menuName,
        totalPortions: 0,
        unit,
        recipeId: menu?.recipe_id,
      };
    }
    aggregatedProduction[prod.menu_id].totalPortions += prod.portions_needed;
  });

  // KALKULASI KEBUTUHAN BAHAN BAKU DAPUR (KITCHEN PREP WORKSHEET)
  // Menghitung bahan baku yang dibutuhkan dari porsi pesanan * recipe ingredients
  const aggregatedIngredients: Record<
    string,
    {
      name: string;
      neededQuantity: number;
      unitSymbol: string;
      currentStock: number;
      supplier?: string;
    }
  > = {};

  Object.values(aggregatedProduction).forEach((agg) => {
    if (!agg.recipeId) return;
    const recipe = recipes.find((r) => r.id === agg.recipeId);
    if (!recipe || !recipe.ingredients) return;

    const recipeYield = recipe.yield_quantity || 1;
    const factor = agg.totalPortions / recipeYield;

    recipe.ingredients.forEach((ri) => {
      if (ri.ingredient_id) {
        const ing = ingredients.find((i) => i.id === ri.ingredient_id);
        const u = units.find((un) => un.id === ri.unit_id);
        const key = ri.ingredient_id;

        const qty = ri.quantity * factor;

        if (!aggregatedIngredients[key]) {
          aggregatedIngredients[key] = {
            name: ing?.name || 'Bahan Baku',
            neededQuantity: 0,
            unitSymbol: u?.symbol || 'g',
            currentStock: ing?.stock || 0,
            supplier: ing?.supplier,
          };
        }
        aggregatedIngredients[key].neededQuantity += qty;
      }
    });
  });

  const getStatusBadge = (status: ProductionStatus) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Diproses':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filter & Tab Selection */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Jadwal Operasional Dapur & Produksi</h3>
            <p className="text-xs text-slate-500">Monitoring antrean porsi dan persiapan bahan baku</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Tab switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tiket Jadwal Produksi
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'ingredients' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <CookingPot className="h-3.5 w-3.5 text-amber-600" />
              <span>Kebutuhan Bahan Baku</span>
            </button>
          </div>

          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <option value="all">Semua Tanggal Produksi</option>
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                Tanggal: {date}
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Cetak Jadwal / Worksheet"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* HIGHLIGHT: REKAP AGREGAT PORSI PRODUKSI */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-indigo-800/60 pb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-amber-400" />
            <h4 className="font-bold text-sm sm:text-base">
              Rekap Total Masakan Dapur {selectedDate !== 'all' ? `(Tanggal ${selectedDate})` : '(Seluruh Jadwal)'}
            </h4>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-semibold">
            {Object.keys(aggregatedProduction).length} Menu Harus Dimasak
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(aggregatedProduction).map(([menuId, item]) => (
            <div key={menuId} className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <span className="text-xs text-indigo-200 font-medium block truncate">{item.menuName}</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-400 font-mono">{item.totalPortions}</span>
                <span className="text-xs text-slate-300 font-semibold">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'schedule' ? (
        /* TAB 1: DAFTAR TIKET PRODUKSI PER PESANAN */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Tgl Produksi</th>
                  <th className="py-3 px-4">No. Pesanan</th>
                  <th className="py-3 px-4">Menu Katering</th>
                  <th className="py-3 px-4">Jumlah Porsi</th>
                  <th className="py-3 px-4">Status Produksi</th>
                  <th className="py-3 px-4">Catatan Dapur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProductions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Tidak ada pesanan yang dijadwalkan diproduksi pada tanggal ini
                    </td>
                  </tr>
                ) : (
                  filteredProductions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.production_date}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                        {getOrderNumber(p.order_id)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {getMenuName(p.menu_id)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.portions_needed} porsi
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <select
                          value={p.status}
                          onChange={(e) =>
                            onUpdateProductionStatus(p.id, e.target.value as ProductionStatus)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                            p.status
                          )} cursor-pointer`}
                        >
                          <option value="Belum diproses">Belum diproses</option>
                          <option value="Diproses">Diproses (Memasak)</option>
                          <option value="Selesai">Selesai (Siap Kemas)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: LEMBAR KEBUTUHAN BAHAN BAKU DAPUR (KITCHEN PREP & SHOPPING LIST) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-600" />
                <span>Kalkulasi Kebutuhan Bahan Baku Dapur (Prep Sheet)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Otomatis dihitung dari porsi pesanan dikalikan komposisi resep standar.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Lembar Belanja Dapur</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Nama Bahan Baku</th>
                  <th className="py-3 px-4">Kebutuhan Produksi</th>
                  <th className="py-3 px-4">Stok Saat Ini</th>
                  <th className="py-3 px-4">Status Gudang</th>
                  <th className="py-3 px-4">Supplier Rujukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(aggregatedIngredients).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Pilih tanggal dengan pesanan aktif atau pastikan menu telah terhubung ke resep standar.
                    </td>
                  </tr>
                ) : (
                  Object.entries(aggregatedIngredients).map(([ingId, item]) => {
                    const isEnough = item.currentStock >= item.neededQuantity;
                    return (
                      <tr key={ingId} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                          {item.neededQuantity.toLocaleString('id-ID', { maximumFractionDigits: 2 })}{' '}
                          {item.unitSymbol}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {item.currentStock.toLocaleString('id-ID')} {item.unitSymbol}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              isEnough
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isEnough ? '✓ Stok Cukup' : '⚠ Perlu Belanja Tambahan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {item.supplier || 'Pasar Tradisional'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
