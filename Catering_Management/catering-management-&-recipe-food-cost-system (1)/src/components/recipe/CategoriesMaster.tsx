import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Category, CategoryType } from '../../types/database';

interface CategoriesMasterProps {
  categories: Category[];
  onAddCategory: (cat: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoriesMaster: React.FC<CategoriesMasterProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('ingredient');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddCategory({
      name,
      type,
      description,
      is_active: true,
    });
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  const getTypeName = (t: CategoryType) => {
    switch (t) {
      case 'ingredient':
        return 'Bahan Baku';
      case 'recipe':
        return 'Resep Masakan';
      case 'menu':
        return 'Menu Katering';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Master Kategori</h3>
          <p className="text-xs text-slate-500">Klasifikasi bahan, resep standar, dan menu komersial</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <th className="py-3 px-4">Nama Kategori</th>
              <th className="py-3 px-4">Tipe Penggunaan</th>
              <th className="py-3 px-4">Deskripsi</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-4 text-xs">
                  <span className="px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {getTypeName(c.type)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500">{c.description || '-'}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kategori ${c.name}?`)) onDeleteCategory(c.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl z-10 space-y-4 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900">Tambah Kategori Baru</h4>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                >
                  <option value="ingredient">Bahan Baku</option>
                  <option value="recipe">Resep Masakan</option>
                  <option value="menu">Menu Katering</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-slate-600">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-600 text-white rounded-xl font-semibold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
