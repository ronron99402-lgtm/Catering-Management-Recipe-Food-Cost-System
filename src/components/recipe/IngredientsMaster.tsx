import React, { useState } from 'react';
import {
  CookingPot,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  History,
  X,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { Ingredient, Category, Unit } from '../../types/database';
import { formatRupiah } from '../../utils/calculations';

interface IngredientsMasterProps {
  ingredients: Ingredient[];
  categories: Category[];
  units: Unit[];
  onAddIngredient: (ing: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredient: (
    id: string,
    ing: Partial<Ingredient>,
    oldPrice?: number,
    newPrice?: number,
    notes?: string
  ) => void;
  onDeleteIngredient: (id: string) => void;
  onViewPriceHistory?: (ingredientId: string) => void;
}

export const IngredientsMaster: React.FC<IngredientsMasterProps> = ({
  ingredients,
  categories,
  units,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
  onViewPriceHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIng, setEditingIng] = useState<Ingredient | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  // Perhitungan otomatis harga per satuan terkecil (gram atau ml)
  const selectedUnit = units.find((u) => u.id === unitId);
  const conversionFactor = selectedUnit ? selectedUnit.conversion_factor : 1;
  const calculatedPricePerBase = purchasePrice > 0 ? purchasePrice / conversionFactor : 0;

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ing.supplier && ing.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || ing.category_id === selectedCategory;
    const matchesLowStock = !filterLowStock || ing.stock <= ing.min_stock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const openAddModal = () => {
    setEditingIng(null);
    setCode(`ING-00${ingredients.length + 1}`);
    setName('');
    setCategoryId(categories.find((c) => c.type === 'ingredient')?.id || '');
    setUnitId(units[0]?.id || '');
    setPurchasePrice(0);
    setStock(10);
    setMinStock(5);
    setSupplier('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingIng(ing);
    setCode(ing.code);
    setName(ing.name);
    setCategoryId(ing.category_id || '');
    setUnitId(ing.unit_id);
    setPurchasePrice(ing.purchase_price);
    setStock(ing.stock);
    setMinStock(ing.min_stock);
    setSupplier(ing.supplier || '');
    setNotes(ing.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || purchasePrice < 0 || stock < 0) {
      alert('Mohon periksa kembali input formulir!');
      return;
    }

    const payload = {
      code: code || `ING-00${ingredients.length + 1}`,
      name,
      category_id: categoryId || undefined,
      unit_id: unitId,
      purchase_price: Number(purchasePrice),
      price_per_base_unit: calculatedPricePerBase,
      stock: Number(stock),
      min_stock: Number(minStock),
      supplier,
      is_active: true,
      notes,
    };

    if (editingIng) {
      const oldPrice = editingIng.purchase_price;
      const newPrice = Number(purchasePrice);
      onUpdateIngredient(
        editingIng.id,
        payload,
        oldPrice !== newPrice ? oldPrice : undefined,
        oldPrice !== newPrice ? newPrice : undefined,
        notes
      );
    } else {
      onAddIngredient(payload);
    }
    setIsModalOpen(false);
  };

  const getUnitSymbol = (uId: string) => units.find((u) => u.id === uId)?.symbol || 'Satuan';
  const getCategoryName = (cId?: string) => categories.find((c) => c.id === cId)?.name || 'Umum';

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari bahan baku, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Kategori</option>
            {categories
              .filter((c) => c.type === 'ingredient')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              filterLowStock
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>Stok Menipis Saja</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Bahan</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Bahan Baku</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Beli</th>
                <th className="py-3 px-4">Biaya Pokok per Dasar</th>
                <th className="py-3 px-4">Stok Fisik</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada bahan baku ditemukan
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((ing) => {
                  const isLow = ing.stock <= ing.min_stock;
                  const unitSymbol = getUnitSymbol(ing.unit_id);
                  const isWeight = unitSymbol.toLowerCase().includes('kg') || unitSymbol.toLowerCase().includes('g');
                  const baseLabel = isWeight ? '/ gram' : '/ ml';

                  return (
                    <tr key={ing.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ing.name}</div>
                        <span className="text-[11px] font-mono text-slate-400">{ing.code}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-medium border border-amber-200/50">
                          {getCategoryName(ing.category_id)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                        {formatRupiah(ing.purchase_price)}{' '}
                        <span className="text-slate-400 font-normal">/ {unitSymbol}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-mono font-bold text-amber-800">
                          Rp {Number(ing.price_per_base_unit).toFixed(2)} {baseLabel}
                        </div>
                        <span className="text-[10px] text-slate-400">Dasar hitung HPP</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                            {ing.stock} {unitSymbol}
                          </span>
                          {isLow && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                              <AlertTriangle className="h-3 w-3" /> Rendah
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Min: {ing.min_stock} {unitSymbol}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[140px] truncate">
                        {ing.supplier || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onViewPriceHistory && (
                            <button
                              onClick={() => onViewPriceHistory(ing.id)}
                              title="Riwayat Harga"
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            >
                              <History className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(ing)}
                            title="Edit"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus bahan baku ${ing.name}?`)) {
                                onDeleteIngredient(ing.id);
                              }
                            }}
                            title="Hapus"
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Form Tambah/Edit Bahan Baku */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingIng ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Bahan</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                  >
                    {categories
                      .filter((c) => c.type === 'ingredient')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Bahan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Daging Ayam Fillet / Tepung Terigu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Satuan Beli *</label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Beli (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 14000"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Automatic Calculation Indicator */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                <div className="flex items-center justify-between font-semibold">
                  <span>Kalkulasi Otomatis:</span>
                  <span className="font-mono">
                    Rp {calculatedPricePerBase.toFixed(2)} / {selectedUnit?.base_unit || 'gram'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700/80 mt-1">
                  1 {selectedUnit?.symbol || 'Satuan'} = {conversionFactor} {selectedUnit?.base_unit || 'gram'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stok Saat Ini *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Minimum Stok *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier / Toko</label>
                <input
                  type="text"
                  placeholder="Nama supplier bahan"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                />
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
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
