export const formatRupiah = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
  return 'Rp ' + Math.round(value).toLocaleString('id-ID');
};

export const formatPercent = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return Number(value).toFixed(1) + '%';
};

export const calculateFoodCostPct = (costPerPortion: number, sellingPrice: number): number => {
  if (!sellingPrice || sellingPrice <= 0) return 0;
  return Number(((costPerPortion / sellingPrice) * 100).toFixed(2));
};

export const calculateMarginPct = (costPerPortion: number, sellingPrice: number): number => {
  if (!sellingPrice || sellingPrice <= 0) return 0;
  const grossProfit = sellingPrice - costPerPortion;
  return Number(((grossProfit / sellingPrice) * 100).toFixed(2));
};

export const calculateEstimatedSellingPrice = (costPerPortion: number, targetFoodCostPct: number): number => {
  if (!targetFoodCostPct || targetFoodCostPct <= 0) return costPerPortion;
  const rawPrice = costPerPortion / (targetFoodCostPct / 100);
  // Bulatkan ke kelipatan 500 terdekat agar harga jual rapi
  return Math.ceil(rawPrice / 500) * 500;
};
