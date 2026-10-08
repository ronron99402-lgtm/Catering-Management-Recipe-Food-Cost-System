import React, { useState } from 'react';
import { GitBranch, CheckCircle2, History, Plus, X, ArrowRight, Sparkles } from 'lucide-react';
import { Recipe, RecipeVersion } from '../../types/database';
import { formatRupiah } from '../../utils/calculations';

interface RecipeVersionsProps {
  recipes: Recipe[];
  onUpdateActiveVersion?: (recipeId: string, versionNumber: number, costPerPortion?: number) => void;
}

export const RecipeVersions: React.FC<RecipeVersionsProps> = ({
  recipes,
  onUpdateActiveVersion,
}) => {
  // Version records per recipe
  const [versions, setVersions] = useState<RecipeVersion[]>([
    {
      id: 'ver-1',
      recipe_id: 'rcp-main-1',
      version_number: 1,
      total_cost: 87700,
      cost_per_portion: 8770,
      ingredients_snapshot: [],
      change_summary: 'Standar awal SOP resep katering (10 porsi)',
      created_by: 'Chef Head Vokasi',
      created_at: '2026-09-20',
    },
    {
      id: 'ver-2',
      recipe_id: 'rcp-main-1',
      version_number: 2,
      total_cost: 84500,
      cost_per_portion: 8450,
      ingredients_snapshot: [],
      change_summary: 'Optimasi takaran tepung krispi dan marinasi hemat minyak',
      created_by: 'Tim Litbang Dapur',
      created_at: '2026-10-02',
    },
    {
      id: 'ver-3',
      recipe_id: 'rcp-sub-1',
      version_number: 1,
      total_cost: 14460,
      cost_per_portion: 1446,
      ingredients_snapshot: [],
      change_summary: 'Formulasi sambal bawang pedas gurih original',
      created_by: 'Chef Bumbu',
      created_at: '2026-09-25',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [versionNumber, setVersionNumber] = useState(2);
  const [costPerPortion, setCostPerPortion] = useState(8500);
  const [changeSummary, setChangeSummary] = useState('');
  const [createdBy, setCreatedBy] = useState('Staff Chef Vokasi');

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const newVer: RecipeVersion = {
      id: `ver-${Date.now()}`,
      recipe_id: selectedRecipeId,
      version_number: Number(versionNumber),
      total_cost: Number(costPerPortion) * 10,
      cost_per_portion: Number(costPerPortion),
      ingredients_snapshot: [],
      change_summary: changeSummary || 'Pembaruan formulasi takaran bahan',
      created_by: createdBy,
      created_at: new Date().toISOString().split('T')[0],
    };

    setVersions([newVer, ...versions]);
    setIsModalOpen(false);
    setChangeSummary('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Audit Versi Resep (Recipe Versioning)</h3>
          <p className="text-xs text-slate-500">
            Audit histori modifikasi komposisi gramatur dan perbandingan efisiensi HPP antar versi formulasi.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedRecipeId(recipes[0]?.id || '');
            setCostPerPortion(recipes[0]?.cost_per_portion || 8000);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Catat Versi Resep Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recipes.map((recipe) => {
          const recipeVersions = versions.filter((v) => v.recipe_id === recipe.id);
          // Urutkan versi terbesar ke terkecil
          const sortedVers = [...recipeVersions].sort((a, b) => b.version_number - a.version_number);

          return (
            <div key={recipe.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{recipe.name}</h4>
                  <span className="text-[11px] font-mono text-slate-400">{recipe.code}</span>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                  Versi Aktif: v{recipe.active_version}.0
                </span>
              </div>

              {/* Version timeline items */}
              <div className="space-y-2.5">
                {sortedVers.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Versi 1.0 (Aktif Default)</span>
                      <p className="text-[11px] text-slate-500">Formulasi standar resep katering</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatRupiah(recipe.cost_per_portion)}</span>
                  </div>
                ) : (
                  sortedVers.map((ver) => {
                    const isActive = ver.version_number === recipe.active_version;
                    return (
                      <div
                        key={ver.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                          isActive
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold">
                            {isActive ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <History className="h-4 w-4 text-slate-400" />
                            )}
                            <span>Versi {ver.version_number}.0</span>
                            {isActive && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded font-semibold">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{ver.change_summary}</p>
                          <p className="text-[10px] text-slate-400">
                            {ver.created_at} • Oleh: {ver.created_by}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="font-mono font-black text-slate-900 text-sm block">
                            {formatRupiah(ver.cost_per_portion)}
                          </span>
                          {!isActive && onUpdateActiveVersion && (
                            <button
                              onClick={() =>
                                onUpdateActiveVersion(recipe.id, ver.version_number, ver.cost_per_portion)
                              }
                              className="px-2 py-0.5 bg-white border border-slate-300 hover:border-emerald-500 text-[10px] font-bold rounded-md text-slate-700 hover:text-emerald-700 transition"
                            >
                              Jadikan Aktif
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: BUAT VERSI BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl z-10 space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Catat Versi Formulasi Resep Baru</h4>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateVersion} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Resep *</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Versi *</label>
                  <input
                    type="number"
                    min="1"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">HPP per Porsi (Rp) *</label>
                  <input
                    type="number"
                    min="1"
                    value={costPerPortion}
                    onChange={(e) => setCostPerPortion(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ringkasan Perubahan *</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Mengurangi minyak goreng 50ml dan menambah bumbu ungkep..."
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">User / Chef Pengubah</label>
                <input
                  type="text"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl">
                  Simpan Versi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
