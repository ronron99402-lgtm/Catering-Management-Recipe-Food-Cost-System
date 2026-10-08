import React, { useState } from 'react';
import {
  Flame,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CookingPot,
  Sparkles,
} from 'lucide-react';
import { Recipe, Ingredient, Unit } from '../../types/database';
import { formatRupiah, formatPercent } from '../../utils/calculations';

interface SubRecipeManagerProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  units: Unit[];
  onSelectRecipeForDetail: (recipe: Recipe) => void;
}

export const SubRecipeManager: React.FC<SubRecipeManagerProps> = ({
  recipes,
  ingredients,
  units,
  onSelectRecipeForDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sub recipes are those where is_sub_recipe === true
  const subRecipes = recipes.filter((r) => r.is_sub_recipe);

  const filteredSubRecipes = subRecipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner Penjelasan Sub-Recipe */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full text-xs font-bold inline-block mb-2">
            Modul Sub-Recipe Terstandar
          </span>
          <h3 className="text-xl font-bold">Resep Bumbu Dasar & Komponen Pendukung</h3>
          <p className="text-xs text-purple-200 max-w-xl mt-1 leading-relaxed">
            Sub-Recipe adalah resep turunan (seperti Sambal Bawang, Bumbu Marinasi, Adonan Tepung) yang memiliki kalkulasi HPP mandiri dan dapat disematkan ke dalam beberapa resep utama tanpa duplikasi data.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari sub-recipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Grid Sub Recipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubRecipes.map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {sub.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Hasil: {sub.yield_quantity} {sub.yield_unit}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{sub.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {sub.description || 'Komponen bumbu pelengkap resep utama.'}
                </p>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Biaya Produksi:</span>
                  <span className="font-mono font-bold">{formatRupiah(sub.total_cost)}</span>
                </div>
                <div className="flex justify-between text-purple-950 font-bold">
                  <span>HPP per {sub.yield_unit}:</span>
                  <span className="font-mono text-sm text-purple-800">
                    {formatRupiah(sub.cost_per_portion)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">Komposisi: </span>
                {sub.ingredients?.length || 0} bahan penyusun
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onSelectRecipeForDetail(sub)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
              >
                <Eye className="h-4 w-4" />
                <span>Rincian HPP Sub-Recipe</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
