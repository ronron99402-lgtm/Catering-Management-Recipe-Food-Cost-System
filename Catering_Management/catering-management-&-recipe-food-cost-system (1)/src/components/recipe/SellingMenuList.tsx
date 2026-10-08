import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Percent,
  X,
  ChefHat,
  Eye,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
} from 'lucide-react';
import { Menu, Recipe, Category } from '../../types/database';
import { formatRupiah, formatPercent } from '../../utils/calculations';

interface SellingMenuListProps {
  menus: Menu[];
  recipes: Recipe[];
  categories: Category[];
  onAddMenu: (menu: Menu) => void;
  onUpdateMenu: (id: string, menu: Partial<Menu>) => void;
  onDeleteMenu: (id: string) => void;
}

export const SellingMenuList: React.FC<SellingMenuListProps> = ({
  menus,
  recipes,
  categories,
  onAddMenu,
  onUpdateMenu,
  onDeleteMenu,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewDetailMenu, setViewDetailMenu] = useState<Menu | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [recipeId, setRecipeId] = useState(recipes[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('Porsi');
  const [sellingPrice, setSellingPrice] = useState<number>(25000);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Hitung HPP dan Food Cost otomatis dari resep yang dipilih
  const selectedRecipe = recipes.find((r) => r.id === recipeId);
  const calculatedCostPrice = selectedRecipe ? selectedRecipe.cost_per_portion || 8770 : 10000;
  const calculatedFoodCostPct =
    sellingPrice > 0 ? Number(((calculatedCostPrice / sellingPrice) * 100).toFixed(2)) : 0;
  const calculatedMarginPct =
    sellingPrice > 0
      ? Number((((sellingPrice - calculatedCostPrice) / sellingPrice) * 100).toFixed(2))
      : 0;

  const filteredMenus = menus.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || m.category_id === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? m.is_active : !m.is_active);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const openAddModal = () => {
    setEditingMenu(null);
    setCode(`MNU-00${menus.length + 1}`);
    setName('');
    const firstRec = recipes[0];
    setRecipeId(firstRec?.id || '');
    setCategoryId(categories.find((c) => c.type === 'menu')?.id || '');
    setUnit('Porsi');
    setSellingPrice(25000);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Menu) => {
    setEditingMenu(m);
    setCode(m.code);
    setName(m.name);
    setRecipeId(m.recipe_id || '');
    setCategoryId(m.category_id || '');
    setUnit(m.unit);
    setSellingPrice(m.selling_price);
    setDescription(m.description || '');
    setImageUrl(m.image_url || '');
    setIsActive(m.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sellingPrice <= 0) {
      alert('Nama menu dan harga jual wajib diisi!');
      return;
    }

    const payload: Partial<Menu> = {
      code: code || `MNU-00${menus.length + 1}`,
      name,
      recipe_id: recipeId,
      category_id: categoryId,
      unit,
      selling_price: Number(sellingPrice),
      cost_price: calculatedCostPrice,
      food_cost_pct: calculatedFoodCostPct,
      margin_pct: calculatedMarginPct,
      description,
      image_url: imageUrl,
      is_active: isActive,
    };

    if (editingMenu) {
      onUpdateMenu(editingMenu.id, payload);
    } else {
      onAddMenu({
        id: `mnu-${Date.now()}`,
        code: payload.code || `MNU-00${menus.length + 1}`,
        name: payload.name || '',
        recipe_id: payload.recipe_id,
        category_id: payload.category_id,
        unit: payload.unit || 'Porsi',
        selling_price: payload.selling_price || 0,
        cost_price: payload.cost_price || 0,
        food_cost_pct: payload.food_cost_pct || 0,
        margin_pct: payload.margin_pct || 0,
        description: payload.description,
        image_url: payload.image_url,
        is_active: isActive,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menu jual katering..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Kategori</option>
            {categories
              .filter((c) => c.type === 'menu')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="active">Menu Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tambah Menu Jual</span>
        </button>
      </div>

      {/* Grid Menu Jual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMenus.map((menu) => {
          const rec = recipes.find((r) => r.id === menu.recipe_id);
          const isWarning = menu.food_cost_pct > 42;

          return (
            <div
              key={menu.id}
              className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between ${
                menu.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {menu.image_url ? (
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <UtensilsCrossed className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  {menu.unit}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      menu.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {menu.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">{menu.code}</span>
                  <h3 className="font-bold text-slate-900 text-base">{menu.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {menu.description || 'Menu hidangan katering siap dipesan.'}
                  </p>
                  {rec && (
                    <div className="mt-2 text-xs text-amber-800 font-medium flex items-center gap-1">
                      <ChefHat className="h-3.5 w-3.5" />
                      <span>Resep: {rec.name}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Harga Jual:</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {formatRupiah(menu.selling_price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>HPP Pokok:</span>
                    <span className="font-mono font-bold text-slate-700">
                      {formatRupiah(menu.cost_price)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Food Cost %</span>
                      <span
                        className={`font-extrabold ${
                          isWarning ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {formatPercent(menu.food_cost_pct)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Gross Margin %</span>
                      <span className="font-extrabold text-blue-700">
                        {formatPercent(menu.margin_pct)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setViewDetailMenu(menu)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Detail Menu</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateMenu(menu.id, { is_active: !menu.is_active })}
                      title={menu.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                    >
                      {menu.is_active ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(menu)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus menu ${menu.name}?`)) {
                          onDeleteMenu(menu.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MENU MODAL */}
      {viewDetailMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setViewDetailMenu(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{viewDetailMenu.name}</h3>
                <span className="font-mono text-slate-400">{viewDetailMenu.code}</span>
              </div>
              <button onClick={() => setViewDetailMenu(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <div className="h-48 rounded-2xl overflow-hidden bg-slate-100">
              {viewDetailMenu.image_url ? (
                <img src={viewDetailMenu.image_url} alt={viewDetailMenu.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <UtensilsCrossed className="h-10 w-10" />
                </div>
              )}
            </div>

            <p className="text-slate-600">{viewDetailMenu.description}</p>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between">
                <span>Harga Jual:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formatRupiah(viewDetailMenu.selling_price)}</span>
              </div>
              <div className="flex justify-between">
                <span>HPP Pokok:</span>
                <span className="font-mono font-bold text-slate-700">{formatRupiah(viewDetailMenu.cost_price)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Laba Kotor per Porsi:</span>
                <span className="font-mono">{formatRupiah(viewDetailMenu.selling_price - viewDetailMenu.cost_price)}</span>
              </div>
              <div className="flex justify-between border-t border-amber-200 pt-1 font-bold">
                <span>Food Cost (%): {formatPercent(viewDetailMenu.food_cost_pct)}</span>
                <span>Margin (%): {formatPercent(viewDetailMenu.margin_pct)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewDetailMenu(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT MENU JUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl z-10 space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingMenu ? 'Edit Menu Jual' : 'Tambah Menu Jual Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Menu</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Satuan Kemasan</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Menu Jual *</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasi Box Ayam Komplit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hubungkan ke Resep *</label>
                <select
                  value={recipeId}
                  onChange={(e) => setRecipeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 font-medium"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (HPP: {formatRupiah(r.cost_per_portion)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Jual Menu (Rp) *</label>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono font-bold"
                />
              </div>

              {/* OTOMATIS HITUNG FOOD COST & MARGIN */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>HPP Resep:</span>
                  <span className="font-mono font-bold">{formatRupiah(calculatedCostPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800">
                  <span>Food Cost:</span>
                  <span>{formatPercent(calculatedFoodCostPct)}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-800">
                  <span>Margin Keuntungan:</span>
                  <span>{formatPercent(calculatedMarginPct)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Menu (URL Gambar)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Status Menu Aktif Dijual</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
