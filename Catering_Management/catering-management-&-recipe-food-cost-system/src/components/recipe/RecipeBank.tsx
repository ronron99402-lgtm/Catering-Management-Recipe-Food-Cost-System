import React, { useState } from 'react';
import {
  ChefHat,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Clock,
  Percent,
  TrendingUp,
  X,
  CookingPot,
  Sparkles,
  Printer,
  Download,
  AlertCircle,
  Flame,
  GitBranch,
  PlusCircle,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { Recipe, Category, Ingredient, Unit, RecipeIngredient } from '../../types/database';
import { formatRupiah, formatPercent } from '../../utils/calculations';
import { jsPDF } from 'jspdf';

interface RecipeBankProps {
  recipes: Recipe[];
  categories: Category[];
  ingredients: Ingredient[];
  units: Unit[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  onDeleteRecipe: (id: string) => void;
  onAddNewIngredientFromRecipe?: (newIng: Omit<Ingredient, 'id'>) => Ingredient;
  selectedRecipeForDetail?: Recipe | null;
  onCloseDetailModal?: () => void;
  onCreateNewVersion?: (recipeId: string, changeSummary: string) => void;
}

export const RecipeBank: React.FC<RecipeBankProps> = ({
  recipes,
  categories,
  ingredients,
  units,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onAddNewIngredientFromRecipe,
  selectedRecipeForDetail,
  onCloseDetailModal,
  onCreateNewVersion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewDetailRecipe, setViewDetailRecipe] = useState<Recipe | null>(
    selectedRecipeForDetail || null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Sub-modal: Quick Add New Ingredient directly from recipe form
  const [isQuickIngModalOpen, setIsQuickIngModalOpen] = useState(false);
  const [quickIngCode, setQuickIngCode] = useState('');
  const [quickIngName, setQuickIngName] = useState('');
  const [quickIngCatId, setQuickIngCatId] = useState('');
  const [quickIngUnitId, setQuickIngUnitId] = useState('');
  const [quickIngPrice, setQuickIngPrice] = useState<number>(20000);
  const [quickIngStock, setQuickIngStock] = useState<number>(10);
  const [quickIngMinStock, setQuickIngMinStock] = useState<number>(2);
  const [quickIngSupplier, setQuickIngSupplier] = useState('');
  const [quickIngNotes, setQuickIngNotes] = useState('');

  // Form Basic Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubRecipe, setIsSubRecipe] = useState(false);
  const [yieldQuantity, setYieldQuantity] = useState(10);
  const [yieldUnit, setYieldUnit] = useState('porsi');
  const [targetFoodCost, setTargetFoodCost] = useState(35);
  const [sellingPrice, setSellingPrice] = useState(25000);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(25);
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Multi-Ingredient Builder Form State
  interface IngredientItemForm {
    itemType: 'ingredient' | 'sub_recipe';
    itemId: string;
    quantity: number;
    unitId: string;
  }

  const [ingredientRows, setIngredientRows] = useState<IngredientItemForm[]>([
    {
      itemType: 'ingredient',
      itemId: ingredients[0]?.id || '',
      quantity: 1000,
      unitId: units[1]?.id || 'unit-2', // gram
    },
  ]);

  // Sub-recipes yang tersedia (cegah circular reference jika sedang edit)
  const availableSubRecipes = recipes.filter(
    (r) => r.is_sub_recipe && (!editingRecipe || r.id !== editingRecipe.id)
  );

  // Perhitungan dinamis HPP di dalam form Add/Edit
  const calculateFormCosts = () => {
    let totalCost = 0;
    const computedIngredients: RecipeIngredient[] = ingredientRows.map((row, idx) => {
      let unitCost = 0;

      if (row.itemType === 'ingredient') {
        const ing = ingredients.find((i) => i.id === row.itemId);
        unitCost = ing ? ing.price_per_base_unit : 0;
      } else {
        const sub = recipes.find((r) => r.id === row.itemId);
        unitCost = sub ? sub.cost_per_portion || 0 : 0;
      }

      const subtotal = row.quantity * unitCost;
      totalCost += subtotal;

      return {
        id: `ri-form-${idx}`,
        recipe_id: editingRecipe?.id || '',
        ingredient_id: row.itemType === 'ingredient' ? row.itemId : undefined,
        sub_recipe_id: row.itemType === 'sub_recipe' ? row.itemId : undefined,
        quantity: row.quantity,
        unit_id: row.unitId,
        unit_cost: unitCost,
        subtotal_cost: subtotal,
      };
    });

    const yieldQty = Math.max(1, yieldQuantity || 1);
    const costPerPortion = Math.round(totalCost / yieldQty);
    const rawEstimated = targetFoodCost > 0 ? costPerPortion / (targetFoodCost / 100) : costPerPortion;
    const round500 = Math.ceil(rawEstimated / 500) * 500;
    const round1000 = Math.round(rawEstimated / 1000) * 1000;
    const ceil1000 = Math.ceil(rawEstimated / 1000) * 1000;

    const foodCostPct = sellingPrice > 0 ? Number(((costPerPortion / sellingPrice) * 100).toFixed(2)) : 0;
    const grossProfit = sellingPrice - costPerPortion;
    const marginPct = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;

    return {
      totalCost,
      costPerPortion,
      rawEstimated,
      round500,
      round1000,
      ceil1000,
      foodCostPct,
      grossProfit,
      marginPct,
      computedIngredients,
    };
  };

  const formCosts = calculateFormCosts();

  const handleAddIngredientRow = () => {
    setIngredientRows([
      ...ingredientRows,
      {
        itemType: 'ingredient',
        itemId: ingredients[0]?.id || '',
        quantity: 100,
        unitId: units[1]?.id || 'unit-2',
      },
    ]);
  };

  const handleRemoveIngredientRow = (idx: number) => {
    if (ingredientRows.length > 1) {
      setIngredientRows(ingredientRows.filter((_, i) => i !== idx));
    }
  };

  const handleRowChange = (idx: number, field: keyof IngredientItemForm, value: any) => {
    const updated = [...ingredientRows];
    if (field === 'itemType') {
      updated[idx].itemType = value;
      if (value === 'sub_recipe') {
        updated[idx].itemId = availableSubRecipes[0]?.id || '';
        updated[idx].unitId = units[4]?.id || 'unit-5'; // pcs/porsi
      } else {
        updated[idx].itemId = ingredients[0]?.id || '';
        updated[idx].unitId = units[1]?.id || 'unit-2'; // gram
      }
    } else if (field === 'itemId') {
      updated[idx].itemId = value;
    } else if (field === 'quantity') {
      updated[idx].quantity = Math.max(0.01, Number(value));
    } else if (field === 'unitId') {
      updated[idx].unitId = value;
    }
    setIngredientRows(updated);
  };

  // Handler: Buka modal buat bahan baru langsung dari form resep
  const openQuickAddIngredientModal = () => {
    setQuickIngCode(`BB-0${ingredients.length + 1}`);
    setQuickIngName('');
    setQuickIngCatId(categories.find((c) => c.type === 'ingredient')?.id || '');
    setQuickIngUnitId(units[0]?.id || 'unit-1'); // default Kg
    setQuickIngPrice(20000);
    setQuickIngStock(10);
    setQuickIngMinStock(2);
    setQuickIngSupplier('');
    setQuickIngNotes('');
    setIsQuickIngModalOpen(true);
  };

  // Handler: Simpan bahan baru ke master dan pasang langsung ke baris resep
  const handleSaveQuickIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIngName || quickIngPrice < 0) {
      alert('Nama bahan dan harga beli wajib diisi.');
      return;
    }

    const selUnit = units.find((u) => u.id === quickIngUnitId);
    const conv = selUnit ? selUnit.conversion_factor : 1;
    const basePrice = quickIngPrice / conv;

    const newIngPayload: Omit<Ingredient, 'id'> = {
      code: quickIngCode || `BB-0${ingredients.length + 1}`,
      name: quickIngName,
      category_id: quickIngCatId,
      unit_id: quickIngUnitId,
      purchase_price: Number(quickIngPrice),
      price_per_base_unit: basePrice,
      stock: Number(quickIngStock),
      min_stock: Number(quickIngMinStock),
      supplier: quickIngSupplier,
      is_active: true,
      notes: quickIngNotes,
    };

    if (onAddNewIngredientFromRecipe) {
      const created = onAddNewIngredientFromRecipe(newIngPayload);
      setIsQuickIngModalOpen(false);

      // Otomatis tambahkan bahan baru ke baris bahan resep!
      const defaultUnit = units.find((u) => u.symbol === 'g' || u.symbol === 'ml') || units[0];
      setIngredientRows([
        ...ingredientRows,
        {
          itemType: 'ingredient',
          itemId: created.id,
          quantity: 100,
          unitId: defaultUnit.id,
        },
      ]);
    } else {
      setIsQuickIngModalOpen(false);
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || r.category_id === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? r.is_active : !r.is_active);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const getCategoryName = (cId?: string) =>
    categories.find((c) => c.id === cId)?.name || 'Makanan';

  const openAddModal = () => {
    setEditingRecipe(null);
    setCode(`RCP-00${recipes.length + 1}`);
    setName('');
    setCategoryId(categories.find((c) => c.type === 'recipe')?.id || '');
    setIsSubRecipe(false);
    setYieldQuantity(10);
    setYieldUnit('porsi');
    setTargetFoodCost(35);
    setSellingPrice(25000);
    setPrepTime(15);
    setCookTime(25);
    setInstructions('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setIngredientRows([
      {
        itemType: 'ingredient',
        itemId: ingredients[0]?.id || '',
        quantity: 1000,
        unitId: units[1]?.id || 'unit-2',
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Recipe) => {
    setEditingRecipe(r);
    setCode(r.code);
    setName(r.name);
    setCategoryId(r.category_id || '');
    setIsSubRecipe(r.is_sub_recipe || false);
    setYieldQuantity(r.yield_quantity);
    setYieldUnit(r.yield_unit);
    setTargetFoodCost(r.target_food_cost_pct);
    setSellingPrice(r.selling_price || 0);
    setPrepTime(r.prep_time_minutes);
    setCookTime(r.cook_time_minutes);
    setInstructions(r.instructions || '');
    setDescription(r.description || '');
    setImageUrl(r.image_url || '');

    if (r.ingredients && r.ingredients.length > 0) {
      setIngredientRows(
        r.ingredients.map((ri) => ({
          itemType: ri.sub_recipe_id ? 'sub_recipe' : 'ingredient',
          itemId: ri.sub_recipe_id || ri.ingredient_id || '',
          quantity: ri.quantity,
          unitId: ri.unit_id,
        }))
      );
    } else {
      setIngredientRows([
        {
          itemType: 'ingredient',
          itemId: ingredients[0]?.id || '',
          quantity: 1000,
          unitId: units[1]?.id || 'unit-2',
        },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || yieldQuantity <= 0) {
      alert('Nama resep dan hasil porsi wajib diisi.');
      return;
    }

    const payload: Partial<Recipe> = {
      code,
      name,
      category_id: categoryId,
      is_sub_recipe: isSubRecipe,
      yield_quantity: Number(yieldQuantity),
      yield_unit: yieldUnit,
      target_food_cost_pct: Number(targetFoodCost),
      selling_price: Number(sellingPrice),
      prep_time_minutes: Number(prepTime),
      cook_time_minutes: Number(cookTime),
      instructions,
      description,
      image_url: imageUrl,
      total_cost: formCosts.totalCost,
      cost_per_portion: formCosts.costPerPortion,
      food_cost_pct: formCosts.foodCostPct,
      margin_pct: formCosts.marginPct,
      gross_profit: formCosts.grossProfit,
      ingredients: formCosts.computedIngredients,
    };

    if (editingRecipe) {
      onUpdateRecipe(editingRecipe.id, payload);
    } else {
      const newRec: Recipe = {
        id: `rcp-${Date.now()}`,
        code: payload.code || `RCP-00${recipes.length + 1}`,
        name: payload.name || '',
        category_id: payload.category_id,
        is_sub_recipe: payload.is_sub_recipe || false,
        yield_quantity: payload.yield_quantity || 10,
        yield_unit: payload.yield_unit || 'porsi',
        target_food_cost_pct: payload.target_food_cost_pct || 35,
        selling_price: payload.selling_price || 0,
        prep_time_minutes: payload.prep_time_minutes || 0,
        cook_time_minutes: payload.cook_time_minutes || 0,
        instructions: payload.instructions,
        description: payload.description,
        image_url: payload.image_url,
        total_cost: formCosts.totalCost,
        cost_per_portion: formCosts.costPerPortion,
        food_cost_pct: formCosts.foodCostPct,
        margin_pct: formCosts.marginPct,
        gross_profit: formCosts.grossProfit,
        ingredients: formCosts.computedIngredients,
        active_version: 1,
        is_active: true,
      };
      onAddRecipe(newRec);
    }
    setIsModalOpen(false);
  };

  // EXPORT PDF ASLI MENGGUNAKAN JSPDF
  const handleExportPDF = (recipe: Recipe) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`LEMBAR STANDAR RESEP & HPP: ${recipe.name.toUpperCase()}`, 14, 20);

    doc.setFontSize(10);
    doc.text(`Kode Resep: ${recipe.code} | Versi: v${recipe.active_version}.0 | Kategori: ${getCategoryName(recipe.category_id)}`, 14, 28);
    doc.text(`Hasil Produksi (Yield): ${recipe.yield_quantity} ${recipe.yield_unit}`, 14, 34);
    doc.text(`Waktu Persiapan: ${recipe.prep_time_minutes} mnt | Waktu Masak: ${recipe.cook_time_minutes} mnt`, 14, 40);

    doc.setLineWidth(0.5);
    doc.line(14, 44, 196, 44);

    doc.setFontSize(12);
    doc.text('KOMPOSISI BAHAN & BIAYA POKOK:', 14, 52);

    let y = 60;
    doc.setFontSize(9);
    doc.text('Bahan', 14, y);
    doc.text('Jumlah', 80, y);
    doc.text('Satuan', 105, y);
    doc.text('Harga/Unit', 130, y);
    doc.text('Subtotal', 165, y);

    y += 4;
    doc.line(14, y, 196, y);
    y += 6;

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((item) => {
        const ing = ingredients.find((i) => i.id === item.ingredient_id);
        const sub = recipes.find((r) => r.id === item.sub_recipe_id);
        const u = units.find((un) => un.id === item.unit_id);
        const nameStr = ing ? ing.name : sub ? `[Sub] ${sub.name}` : 'Bahan';
        const unitSymbol = u ? u.symbol : 'satuan';

        doc.text(nameStr.substring(0, 30), 14, y);
        doc.text(String(item.quantity), 80, y);
        doc.text(unitSymbol, 105, y);
        doc.text(`Rp ${item.unit_cost.toLocaleString('id-ID')}`, 130, y);
        doc.text(`Rp ${item.subtotal_cost.toLocaleString('id-ID')}`, 165, y);
        y += 6;
      });
    }

    y += 4;
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFontSize(10);
    doc.text(`Total Biaya Resep: Rp ${(recipe.total_cost || 0).toLocaleString('id-ID')}`, 14, y);
    y += 6;
    doc.text(`HPP Pokok per Porsi: Rp ${(recipe.cost_per_portion || 0).toLocaleString('id-ID')}`, 14, y);
    y += 6;
    doc.text(`Harga Jual Standar: Rp ${(recipe.selling_price || 0).toLocaleString('id-ID')}`, 14, y);
    y += 6;
    doc.text(`Food Cost: ${recipe.food_cost_pct || 0}% | Margin: ${recipe.margin_pct || 0}%`, 14, y);

    if (recipe.instructions) {
      y += 10;
      doc.setFontSize(11);
      doc.text('CARA MEMBUAT / SOP:', 14, y);
      y += 6;
      doc.setFontSize(9);
      const splitText = doc.splitTextToSize(recipe.instructions, 180);
      doc.text(splitText, 14, y);
    }

    doc.save(`Resep_${recipe.code}_${recipe.name.replace(/\s+/g, '_')}.pdf`);
  };

  const activeDetail = viewDetailRecipe || selectedRecipeForDetail;

  return (
    <div className="space-y-6">
      {/* Top Filter & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari resep masakan, kode SOP..."
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
              .filter((c) => c.type === 'recipe')
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
            <option value="active">Resep Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Tambah Resep Baru</span>
        </button>
      </div>

      {/* Grid Kartu Resep Modern */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.map((recipe) => {
          const costPortion = recipe.cost_per_portion || 0;
          const fcPct = recipe.food_cost_pct || 0;
          const marginPct = recipe.margin_pct || 0;

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col group"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                    <CookingPot className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg">
                    {getCategoryName(recipe.category_id)}
                  </span>
                  {recipe.is_sub_recipe && (
                    <span className="px-2.5 py-1 bg-purple-600/90 text-white text-[11px] font-bold rounded-lg">
                      SUB-RECIPE
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow">
                  Hasil: {recipe.yield_quantity} {recipe.yield_unit}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">{recipe.code}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {recipe.prep_time_minutes + recipe.cook_time_minutes} mnt
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-1">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {recipe.description || 'Standar porsi katering terstandar.'}
                  </p>
                </div>

                {/* HPP & Margin Badges Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">HPP / {recipe.yield_unit}:</span>
                    <span className="font-bold text-amber-700 font-mono text-sm">
                      {formatRupiah(costPortion)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Food Cost %</span>
                      <span
                        className={`font-extrabold ${
                          fcPct > 40 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {formatPercent(fcPct)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Gross Margin %</span>
                      <span className="font-extrabold text-blue-700">
                        {formatPercent(marginPct)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setViewDetailRecipe(recipe)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-800 transition"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Lihat HPP & Bahan</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportPDF(recipe)}
                      title="Export PDF"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(recipe)}
                      title="Edit"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus resep ${recipe.name}?`)) {
                          onDeleteRecipe(recipe.id);
                        }
                      }}
                      title="Hapus"
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

      {/* MODAL: DETAIL RESEP LENGKAP DENGAN EXPORT PDF & CETAK */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => {
              setViewDetailRecipe(null);
              if (onCloseDetailModal) onCloseDetailModal();
            }}
          />
          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl z-10 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  {activeDetail.image_url ? (
                    <img src={activeDetail.image_url} alt={activeDetail.name} className="h-full w-full object-cover" />
                  ) : (
                    <CookingPot className="h-8 w-8 m-3 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-xl">{activeDetail.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 font-bold">
                      {activeDetail.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 text-amber-800 font-bold">
                      Versi {activeDetail.active_version}.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hasil: {activeDetail.yield_quantity} {activeDetail.yield_unit} • Waktu: {activeDetail.prep_time_minutes + activeDetail.cook_time_minutes} mnt
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewDetailRecipe(null);
                  if (onCloseDetailModal) onCloseDetailModal();
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* TABEL RINCIAN BAHAN RESEP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CookingPot className="h-4 w-4 text-amber-600" />
                  Komposisi Bahan & Biaya
                </h4>
                <span className="text-xs text-slate-400">
                  Total Komponen: {activeDetail.ingredients?.length || 0}
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Nama Bahan</th>
                      <th className="py-2.5 px-3">Jumlah</th>
                      <th className="py-2.5 px-3">Satuan</th>
                      <th className="py-2.5 px-3">Harga Satuan</th>
                      <th className="py-2.5 px-3">Subtotal Biaya</th>
                      <th className="py-2.5 px-3 text-right">Kontribusi HPP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeDetail.ingredients && activeDetail.ingredients.length > 0 ? (
                      activeDetail.ingredients.map((item) => {
                        const ing = ingredients.find((i) => i.id === item.ingredient_id);
                        const sub = recipes.find((r) => r.id === item.sub_recipe_id);
                        const unitName = units.find((u) => u.id === item.unit_id)?.symbol || 'satuan';
                        const ingredientName = ing ? ing.name : sub ? `${sub.name} (Sub-Recipe)` : 'Bahan';
                        const totalCost = activeDetail.total_cost || 1;
                        const pctContrib = ((item.subtotal_cost / totalCost) * 100).toFixed(1);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {ingredientName}
                            </td>
                            <td className="py-2.5 px-3 font-mono">{item.quantity}</td>
                            <td className="py-2.5 px-3">{unitName}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              Rp {item.unit_cost.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                              {formatRupiah(item.subtotal_cost)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-700">
                              {pctContrib}%
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Resep ini menggunakan kalkulasi HPP terintegrasi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RINGKASAN HPP, FOOD COST & MARGIN */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs">
              <div>
                <span className="text-slate-500 block">Total Biaya Resep</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {formatRupiah(activeDetail.total_cost)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">HPP per Porsi</span>
                <span className="text-base font-extrabold text-amber-800 font-mono">
                  {formatRupiah(activeDetail.cost_per_portion)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Harga Jual Menu</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {formatRupiah(activeDetail.selling_price)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Food Cost (%)</span>
                <span className="text-base font-extrabold text-emerald-700">
                  {formatPercent(activeDetail.food_cost_pct)}
                </span>
              </div>
            </div>

            {/* CARA MEMBUAT / SOP */}
            {activeDetail.instructions && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">SOP Memasak / Cara Membuat:</h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {activeDetail.instructions}
                </div>
              </div>
            )}

            {/* TOMBOL AKSI */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPDF(activeDetail)}
                  className="flex items-center gap-1.5 px-3 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs font-semibold"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak SOP</span>
                </button>
                {onCreateNewVersion && (
                  <button
                    onClick={() => {
                      const summary = prompt('Masukkan ringkasan perubahan versi baru:');
                      if (summary) {
                        onCreateNewVersion(activeDetail.id, summary);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl text-xs font-semibold"
                  >
                    <GitBranch className="h-4 w-4" />
                    <span>Buat Versi Baru</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setViewDetailRecipe(null);
                  if (onCloseDetailModal) onCloseDetailModal();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORM TAMBAH/EDIT RESEP DENGAN MULTI-INGREDIENT BUILDER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingRecipe ? 'Edit Resep Masakan' : 'Buat Resep Baru & Rincian Bahan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Resep</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  >
                    {categories
                      .filter((c) => c.type === 'recipe')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Resep *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ayam Bakar Madu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isSubRecipe}
                      onChange={(e) => setIsSubRecipe(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Sebagai Sub-Recipe</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hasil Produksi (Yield)</label>
                  <input
                    type="number"
                    min="1"
                    value={yieldQuantity}
                    onChange={(e) => setYieldQuantity(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Satuan Hasil</label>
                  <input
                    type="text"
                    value={yieldUnit}
                    onChange={(e) => setYieldUnit(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
              </div>

              {/* MULTI-INGREDIENT BUILDER DENGAN SOLUSI BAHAN BELUM ADA (REQ E) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CookingPot className="h-4 w-4 text-amber-600" />
                    Daftar Bahan Resep
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddIngredientRow}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Pilih Bahan Ada</span>
                    </button>
                    {/* REQUIREMENT E: TOMBOL TAMBAH BAHAN BARU LANGSUNG */}
                    <button
                      type="button"
                      onClick={openQuickAddIngredientModal}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-300 flex items-center gap-1"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>+ Tambah Bahan Baru ke Master</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {ingredientRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <select
                        value={row.itemType}
                        onChange={(e) => handleRowChange(idx, 'itemType', e.target.value)}
                        className="w-28 px-2 py-1.5 bg-white border rounded-xl border-slate-300"
                      >
                        <option value="ingredient">Bahan Baku</option>
                        <option value="sub_recipe">Sub-Recipe</option>
                      </select>

                      <select
                        value={row.itemId}
                        onChange={(e) => handleRowChange(idx, 'itemId', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border rounded-xl border-slate-300"
                      >
                        {row.itemType === 'ingredient' ? (
                          ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} (Rp {ing.price_per_base_unit}/g)
                            </option>
                          ))
                        ) : availableSubRecipes.length > 0 ? (
                          availableSubRecipes.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              [Sub] {sub.name} (HPP: {formatRupiah(sub.cost_per_portion)})
                            </option>
                          ))
                        ) : (
                          <option value="">(Belum ada sub-recipe)</option>
                        )}
                      </select>

                      <input
                        type="number"
                        min="0.01"
                        placeholder="Jumlah"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        className="w-20 px-2 py-1.5 bg-white border rounded-xl border-slate-300 text-center font-mono font-bold"
                      />

                      <select
                        value={row.unitId}
                        onChange={(e) => handleRowChange(idx, 'unitId', e.target.value)}
                        className="w-20 px-2 py-1.5 bg-white border rounded-xl border-slate-300"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.symbol}
                          </option>
                        ))}
                      </select>

                      {ingredientRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ESTIMASI HARGA & FOOD COST DENGAN PEMBULATAN (REQ J) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Target Food Cost (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetFoodCost}
                    onChange={(e) => setTargetFoodCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                  <div className="flex gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="text-slate-400">Pembulatan:</span>
                    <button
                      type="button"
                      onClick={() => setSellingPrice(formCosts.round500)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                    >
                      Rp 500 ({formatRupiah(formCosts.round500)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellingPrice(formCosts.round1000)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                    >
                      Rp 1.000 ({formatRupiah(formCosts.round1000)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellingPrice(formCosts.ceil1000)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                    >
                      Ke Atas 1k ({formatRupiah(formCosts.ceil1000)})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Harga Jual Resmi (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* LIVE REKAP HASIL HITUNG FORM */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Total Biaya Bahan:</span>
                  <span className="font-mono font-bold">{formatRupiah(formCosts.totalCost)}</span>
                </div>
                <div className="flex justify-between text-amber-900 font-extrabold text-sm">
                  <span>HPP per {yieldUnit}:</span>
                  <span className="font-mono">{formatRupiah(formCosts.costPerPortion)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-amber-200 text-slate-700 font-bold">
                  <span>Food Cost: {formatPercent(formCosts.foodCostPct)}</span>
                  <span>Gross Margin: {formatPercent(formCosts.marginPct)}</span>
                  <span>Laba Kotor: {formatRupiah(formCosts.grossProfit)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">SOP / Langkah Memasak</label>
                <textarea
                  rows={2}
                  placeholder="Langkah memasak..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
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
                  Simpan Resep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUIREMENT E SUB-MODAL: TAMBAH BAHAN BARU LANGSUNG DARI FORM RESEP */}
      {isQuickIngModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsQuickIngModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Tambah Bahan Baru ke Master</h4>
              </div>
              <button onClick={() => setIsQuickIngModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <p className="text-[11px] text-slate-500">
              Bahan baru ini langsung tersimpan ke Supabase & Master Bahan Baku, serta otomatis terpasang pada baris resep saat ini.
            </p>

            <form onSubmit={handleSaveQuickIngredient} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Kode Bahan</label>
                  <input
                    type="text"
                    value={quickIngCode}
                    onChange={(e) => setQuickIngCode(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Kategori</label>
                  <select
                    value={quickIngCatId}
                    onChange={(e) => setQuickIngCatId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300"
                  >
                    {categories.filter((c) => c.type === 'ingredient').map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-0.5">Nama Bahan Baru *</label>
                <input
                  type="text"
                  placeholder="Contoh: Daun Jeruk / Lada Putih"
                  value={quickIngName}
                  onChange={(e) => setQuickIngName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Satuan Pembelian</label>
                  <select
                    value={quickIngUnitId}
                    onChange={(e) => setQuickIngUnitId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Harga Beli (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    value={quickIngPrice}
                    onChange={(e) => setQuickIngPrice(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Stok</label>
                  <input
                    type="number"
                    value={quickIngStock}
                    onChange={(e) => setQuickIngStock(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-0.5">Supplier</label>
                  <input
                    type="text"
                    value={quickIngSupplier}
                    onChange={(e) => setQuickIngSupplier(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickIngModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
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
