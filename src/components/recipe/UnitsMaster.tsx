import React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';
import { Unit } from '../../types/database';

interface UnitsMasterProps {
  units: Unit[];
}

export const UnitsMaster: React.FC<UnitsMasterProps> = ({ units }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-3xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full text-xs font-bold inline-block mb-2">
            Standarisasi Satuan Dapur & Konversi HPP
          </span>
          <h3 className="text-xl font-bold">Master Satuan & Faktor Konversi</h3>
          <p className="text-xs text-blue-200 max-w-xl mt-1 leading-relaxed">
            Menghubungkan satuan pembelian grosir (Kg / Liter) dengan satuan takaran resep (Gram / Ml) untuk memastikan akurasi perhitungan HPP hingga ke level pecahan rupiah.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <th className="py-3 px-4">Nama Satuan</th>
              <th className="py-3 px-4">Simbol</th>
              <th className="py-3 px-4">Satuan Dasar</th>
              <th className="py-3 px-4">Faktor Konversi Dasar</th>
              <th className="py-3 px-4">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {units.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{u.symbol}</td>
                <td className="py-3.5 px-4 text-xs">
                  <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    {u.base_unit}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                  1 {u.symbol} = {u.conversion_factor} {u.base_unit}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500">{u.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
