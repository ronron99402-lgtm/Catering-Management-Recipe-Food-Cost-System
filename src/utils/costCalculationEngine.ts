import { Ingredient, Recipe, Menu, Unit, Order, Payment } from '../types/database';

/**
 * Konversi jumlah dari unit asal ke unit dasar (gram atau ml).
 * Contoh: 1.5 Kg -> 1.5 * 1000 = 1500 gram.
 */
export const convertToBaseUnit = (quantity: number, unitId: string, units: Unit[]): number => {
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return quantity;
  return quantity * (unit.conversion_factor || 1);
};

/**
 * Menghitung ulang seluruh HPP resep dan sub-resep secara berurutan
 * untuk mencegah sirkular dependensi dan menjamin cascade update saat harga bahan berubah.
 */
export const recalculateRecipeCosts = (
  recipes: Recipe[],
  ingredients: Ingredient[],
  units: Unit[]
): Recipe[] => {
  // Peta harga bahan pokok per unit dasar (Rp/gram atau Rp/ml)
  const ingredientPriceMap = new Map<string, number>();
  ingredients.forEach((ing) => {
    ingredientPriceMap.set(ing.id, ing.price_per_base_unit);
  });

  // Pisahkan sub-resep terlebih dahulu, lalu resep utama
  const subRecipes = recipes.filter((r) => r.is_sub_recipe);
  const mainRecipes = recipes.filter((r) => !r.is_sub_recipe);

  const updatedSubRecipes: Recipe[] = subRecipes.map((recipe) => {
    let totalCost = 0;
    const updatedIngredients = (recipe.ingredients || []).map((item) => {
      let unitCost = item.unit_cost;
      if (item.ingredient_id && ingredientPriceMap.has(item.ingredient_id)) {
        unitCost = ingredientPriceMap.get(item.ingredient_id)!;
      }
      const subtotal = item.quantity * unitCost;
      totalCost += subtotal;
      return {
        ...item,
        unit_cost: unitCost,
        subtotal_cost: subtotal,
      };
    });

    const yieldQty = Math.max(1, recipe.yield_quantity || 1);
    const costPerPortion = Math.round(totalCost / yieldQty);
    const sellingPrice = recipe.selling_price || 0;
    const foodCostPct = sellingPrice > 0 ? Number(((costPerPortion / sellingPrice) * 100).toFixed(2)) : 0;
    const grossProfit = sellingPrice - costPerPortion;
    const marginPct = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;

    return {
      ...recipe,
      total_cost: totalCost,
      cost_per_portion: costPerPortion,
      food_cost_pct: foodCostPct,
      margin_pct: marginPct,
      gross_profit: grossProfit,
      ingredients: updatedIngredients,
    };
  });

  // Peta HPP porsi sub-resep yang baru dihitung
  const subRecipeCostMap = new Map<string, number>();
  updatedSubRecipes.forEach((sr) => {
    subRecipeCostMap.set(sr.id, sr.cost_per_portion || 0);
  });

  // Sekarang hitung resep utama yang mungkin menggunakan sub-resep
  const updatedMainRecipes: Recipe[] = mainRecipes.map((recipe) => {
    let totalCost = 0;
    const updatedIngredients = (recipe.ingredients || []).map((item) => {
      let unitCost = item.unit_cost;

      // Jika item berupa bahan baku langsung
      if (item.ingredient_id && ingredientPriceMap.has(item.ingredient_id)) {
        unitCost = ingredientPriceMap.get(item.ingredient_id)!;
      }
      // Jika item berupa sub-recipe
      else if (item.sub_recipe_id && subRecipeCostMap.has(item.sub_recipe_id)) {
        unitCost = subRecipeCostMap.get(item.sub_recipe_id)!;
      }

      const subtotal = item.quantity * unitCost;
      totalCost += subtotal;

      return {
        ...item,
        unit_cost: unitCost,
        subtotal_cost: subtotal,
      };
    });

    const yieldQty = Math.max(1, recipe.yield_quantity || 1);
    const costPerPortion = Math.round(totalCost / yieldQty);
    const sellingPrice = recipe.selling_price || 0;
    const foodCostPct = sellingPrice > 0 ? Number(((costPerPortion / sellingPrice) * 100).toFixed(2)) : 0;
    const grossProfit = sellingPrice - costPerPortion;
    const marginPct = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;

    return {
      ...recipe,
      total_cost: totalCost,
      cost_per_portion: costPerPortion,
      food_cost_pct: foodCostPct,
      margin_pct: marginPct,
      gross_profit: grossProfit,
      ingredients: updatedIngredients,
    };
  });

  return [...updatedSubRecipes, ...updatedMainRecipes];
};

/**
 * Sinkronisasi HPP, Food Cost, dan Margin ke Menu Jual
 */
export const recalculateMenuCosts = (menus: Menu[], recipes: Recipe[]): Menu[] => {
  const recipeCostMap = new Map<string, number>();
  recipes.forEach((r) => {
    recipeCostMap.set(r.id, r.cost_per_portion || 0);
  });

  return menus.map((menu) => {
    if (menu.recipe_id && recipeCostMap.has(menu.recipe_id)) {
      const costPrice = recipeCostMap.get(menu.recipe_id)!;
      const sellingPrice = menu.selling_price || 0;
      const foodCostPct = sellingPrice > 0 ? Number(((costPrice / sellingPrice) * 100).toFixed(2)) : 0;
      const grossProfit = sellingPrice - costPrice;
      const marginPct = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;

      return {
        ...menu,
        cost_price: costPrice,
        food_cost_pct: foodCostPct,
        margin_pct: marginPct,
      };
    }
    return menu;
  });
};

/**
 * Menghitung status pembayaran dan sisa tagihan pesanan berdasarkan riwayat transaksi pembayaran.
 */
export const calculateOrderBalance = (
  order: Order,
  payments: Payment[]
): { totalPaid: number; remaining: number; paymentStatus: 'Belum Bayar' | 'DP Sebagian' | 'Lunas' } => {
  const orderPayments = payments.filter((p) => p.order_id === order.id);
  const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);

  const remaining = Math.max(0, order.total_amount - totalPaid);
  let paymentStatus: 'Belum Bayar' | 'DP Sebagian' | 'Lunas' = 'Belum Bayar';

  if (remaining === 0 && totalPaid > 0) {
    paymentStatus = 'Lunas';
  } else if (totalPaid > 0) {
    paymentStatus = 'DP Sebagian';
  }

  return {
    totalPaid,
    remaining,
    paymentStatus,
  };
};
