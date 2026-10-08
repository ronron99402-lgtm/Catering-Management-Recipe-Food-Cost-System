import React from 'react';
import { History, TrendingUp, TrendingDown, ArrowRight, AlertCircle } from 'lucide-react';
import { IngredientPriceHistory } from '../../types/database';
import { formatRupiah } from '../../utils/calculations';

interface PriceHistoryProps {
  priceHistories: IngredientPriceHistory[];
}

export const PriceHistory: React.FC<PriceHistoryProps> = ({ priceHistories }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Riwayat Perubahan Harga Bahan</h3>
          <p className="text-xs text-slate-500">
            Log histori penyesuaian harga beli bahan baku yang memengaruhi kalkulasi HPP resep aktif.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <th className="py-3 px-4">Bahan Baku</th>
              <th className="py-3 px-4">Harga Lama</th>
              <th className="py-3 px-4">Harga Baru</th>
              <th className="py-3 px-4">Selisih</th>
              <th className="py-3 px-4">Tgl Perubahan</th>
              <th className="py-3 px-4">User Pengubah</th>
              <th className="py-3 px-4">Alasan / Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {priceHistories.map((h) => {
              const diff = h.new_price - h.old_price;
              const isUp = diff > 0;
              return (
                <tr key={h.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{h.ingredient_name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 line-through">
                    {formatRupiah(h.old_price)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
                    {formatRupiah(h.new_price)}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-bold font-mono flex items-center gap-1 w-fit ${
                        isUp ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isUp ? '+' : ''}
                      {formatRupiah(diff)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{h.change_date}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">{h.changed_by || 'Admin'}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">{h.notes || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
