import React from 'react';
import {
  ChefHat,
  Percent,
  Sparkles,
  TrendingUp,
  FolderTree,
  CookingPot,
  UtensilsCrossed,
  AlertTriangle,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import { Recipe, Ingredient, Menu, Category } from '../../types/database';
import { formatRupiah, formatPercent } from '../../utils/calculations';
import { NavItemKey } from '../layout/Sidebar';

interface RecipeDashboardProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  menus: Menu[];
  categories: Category[];
  onNavigate: (view: NavItemKey) => void;
  onSelectRecipe?: (recipe: Recipe) => void;
}

export const RecipeDashboard: React.FC<RecipeDashboardProps> = ({
  recipes,
  ingredients,
  menus,
  categories,
  onNavigate,
  onSelectRecipe,
}) => {
  const totalIngredients = ingredients.length;
  const totalRecipes = recipes.length;
  const totalMenus = menus.length;
  const totalCategories = categories.length;

  // Rata-rata Food Cost & Margin
  const validMenus = menus.filter((m) => m.food_cost_pct > 0);
  const avgFoodCost =
    validMenus.length > 0
      ? validMenus.reduce((sum, m) => sum + m.food_cost_pct, 0) / validMenus.length
      : 35.0;

  const avgMargin =
    validMenus.length > 0
      ? validMenus.reduce((sum, m) => sum + m.margin_pct, 0) / validMenus.length
      : 65.0;

  // Menu dengan Food Cost Tertinggi (sorted desc)
  const highestFoodCostMenus = [...menus]
    .sort((a, b) => b.food_cost_pct - a.food_cost_pct)
    .slice(0, 4);

  // Resep terbaru
  const recentRecipes = [...recipes].slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs rounded-full font-semibold mb-2">
            Modul Analisis Resep & Standar HPP
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Recipe & Food Cost Control Center
          </h2>
          <p className="text-sm text-amber-100 mt-1 max-w-xl">
            Hitung HPP bahan baku per gram, kalkulasi food cost ideal, dan tetapkan harga jual yang memberikan margin keuntungan sehat (Target: 30% - 38%).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('recipe-bank')}
            className="px-4 py-2 bg-white text-amber-900 font-bold rounded-xl text-sm transition shadow hover:bg-amber-50 active:scale-95"
          >
            Bank Resep
          </button>
          <button
            onClick={() => onNavigate('sub-recipes')}
            className="px-4 py-2 bg-amber-900/60 text-white font-semibold rounded-xl text-sm transition hover:bg-amber-900 active:scale-95 border border-white/20"
          >
            Sub-Recipe
          </button>
        </div>
      </div>

      {/* 6 Statistik Utama */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Bahan Baku</span>
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
              <CookingPot className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{totalIngredients}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Master items</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Bank Resep</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <ChefHat className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600">{totalRecipes}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">SOP terstandar</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Menu Jual</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-600">{totalMenus}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Katalog menu</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Kategori</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <FolderTree className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-600">{totalCategories}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Klasifikasi</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Rata2 Food Cost</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600">{formatPercent(avgFoodCost)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sehat (&lt; 40%)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Rata2 Margin</span>
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-green-600">{formatPercent(avgMargin)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Gross profit margin</p>
        </div>
      </div>

      {/* Grid: Menu Food Cost Tertinggi & Resep Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Food Cost Tertinggi */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Menu dengan Food Cost Tertinggi
                </h3>
                <p className="text-[11px] text-slate-500">Perhatikan menu dengan persentase di atas 40%</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('selling-menus')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Katalog Menu <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {highestFoodCostMenus.map((menu) => {
              const isWarning = menu.food_cost_pct > 42;
              return (
                <div key={menu.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-sm">{menu.name}</span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        isWarning
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Food Cost: {formatPercent(menu.food_cost_pct)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWarning ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(menu.food_cost_pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>HPP: <strong>{formatRupiah(menu.cost_price)}</strong></span>
                    <span>Harga Jual: <strong>{formatRupiah(menu.selling_price)}</strong></span>
                    <span className="text-emerald-600 font-semibold">Margin: {formatPercent(menu.margin_pct)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resep Terbaru & Terstandar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Resep Standar Dapur</h3>
                <p className="text-[11px] text-slate-500">Resep aktif dan kalkulasi HPP porsi</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('recipe-bank')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Semua Resep <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe && onSelectRecipe(recipe)}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <CookingPot className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{recipe.name}</span>
                      {recipe.is_sub_recipe && (
                        <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                          SUB-RECIPE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Hasil: {recipe.yield_quantity} {recipe.yield_unit} • Versi {recipe.active_version}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-amber-700">
                    {formatRupiah(recipe.cost_per_portion)} <span className="text-[10px] text-slate-400 font-normal">/ {recipe.yield_unit}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Target FC: {formatPercent(recipe.target_food_cost_pct)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
