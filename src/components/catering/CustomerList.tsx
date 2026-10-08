import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { Customer, Order } from '../../types/database';
import { formatRupiah } from '../../utils/calculations';

interface CustomerListProps {
  customers: Customer[];
  orders: Order[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onUpdateCustomer: (id: string, customer: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  orders,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setCode(`CUST-00${customers.length + 1}`);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setCode(c.code);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('Nama, Nomor WhatsApp, dan Alamat wajib diisi.');
      return;
    }

    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, {
        code,
        name,
        phone,
        email,
        address,
        notes,
      });
    } else {
      onAddCustomer({
        code: code || `CUST-00${customers.length + 1}`,
        name,
        phone,
        email,
        address,
        notes,
        created_at: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(false);
  };

  // Orders for view modal
  const customerOrders = viewCustomer
    ? orders.filter((o) => o.customer_id === viewCustomer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Bar: Search & Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, kode, no WA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Kode & Nama</th>
                <th className="py-3 px-4">WhatsApp / Kontak</th>
                <th className="py-3 px-4">Alamat Pengiriman</th>
                <th className="py-3 px-4">Total Pesanan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Tidak ada pelanggan ditemukan
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const orderCount = orders.filter((o) => o.customer_id === customer.id).length;
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{customer.name}</div>
                            <span className="text-[11px] font-mono text-slate-400">{customer.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                            <Phone className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{customer.phone}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate max-w-[180px]">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-full font-bold text-slate-700">
                          {orderCount} Pesanan
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewCustomer(customer)}
                            title="Detail & Riwayat"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(customer)}
                            title="Edit"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus ${customer.name}?`)) {
                                onDeleteCustomer(customer.id);
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

      {/* MODAL: Form Tambah/Edit Pelanggan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Pelanggan</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp / HP *</label>
                  <input
                    type="tel"
                    placeholder="0812..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap / Instansi *</label>
                <input
                  type="text"
                  placeholder="Contoh: SMAK Mater Dei / Ibu Maria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email (opsional)</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Pengiriman *</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Lengkap, No, Gedung, Patokan..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Khusus</label>
                <input
                  type="text"
                  placeholder="Contoh: Suka pedas, minta sendok plastik..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detail & Riwayat Pesanan Pelanggan */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setViewCustomer(null)} />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{viewCustomer.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{viewCustomer.code}</p>
              </div>
              <button onClick={() => setViewCustomer(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-400">WhatsApp:</span>
                <p className="font-bold text-slate-800">{viewCustomer.phone}</p>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="font-bold text-slate-800">{viewCustomer.email || '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Alamat:</span>
                <p className="font-medium text-slate-800">{viewCustomer.address}</p>
              </div>
              {viewCustomer.notes && (
                <div className="col-span-2">
                  <span className="text-slate-400">Catatan:</span>
                  <p className="italic text-slate-700">{viewCustomer.notes}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-amber-600" />
                Riwayat Pesanan Pelanggan
              </h4>

              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada riwayat pesanan</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900">{ord.order_number}</div>
                        <div className="text-slate-500">
                          {ord.event_type} • Acara: {ord.event_date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatRupiah(ord.total_amount)}</div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
