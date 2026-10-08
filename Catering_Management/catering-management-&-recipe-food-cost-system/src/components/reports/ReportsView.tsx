import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  PackageCheck,
  Truck,
  Users,
  ChefHat,
  Search,
} from 'lucide-react';
import { Order, Payment, Production, Shipment, Menu, Customer, Recipe } from '../../types/database';
import { formatRupiah, formatPercent } from '../../utils/calculations';

interface ReportsViewProps {
  orders: Order[];
  payments: Payment[];
  productions: Production[];
  shipments: Shipment[];
  menus: Menu[];
  customers: Customer[];
  recipes: Recipe[];
}

type ReportType =
  | 'orders'
  | 'sales'
  | 'payments'
  | 'production'
  | 'shipments'
  | 'menus'
  | 'customers'
  | 'hpp_margin';

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  payments,
  productions,
  shipments,
  menus,
  customers,
  recipes,
}) => {
  const [activeTab, setActiveTab] = useState<ReportType>('orders');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper date filter
  const isWithinDateRange = (dateStr?: string) => {
    if (!dateStr) return true;
    return dateStr >= startDate && dateStr <= endDate;
  };

  // Filtered datasets
  const filteredOrders = orders.filter(
    (o) =>
      isWithinDateRange(o.event_date) &&
      (o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.event_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPayments = payments.filter(
    (p) =>
      isWithinDateRange(p.payment_date) &&
      (p.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payment_method.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredProductions = productions.filter(
    (p) => isWithinDateRange(p.production_date)
  );

  const filteredShipments = shipments.filter(
    (s) => isWithinDateRange(s.delivery_date)
  );

  const filteredMenus = menus.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export data to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeTab === 'orders' || activeTab === 'sales') {
      headers = ['Nomor Pesanan', 'Pelanggan', 'Tanggal Acara', 'Subtotal', 'Diskon', 'Total', 'DP', 'Sisa', 'Status'];
      rows = filteredOrders.map((o) => {
        const c = customers.find((cust) => cust.id === o.customer_id)?.name || '';
        return [o.order_number, c, o.event_date, String(o.subtotal), String(o.discount), String(o.total_amount), String(o.down_payment), String(o.remaining_balance), o.status];
      });
    } else if (activeTab === 'payments') {
      headers = ['No Transaksi', 'No Pesanan', 'Tanggal', 'Metode', 'Tipe', 'Jumlah', 'No Referensi'];
      rows = filteredPayments.map((p) => {
        const o = orders.find((ord) => ord.id === p.order_id)?.order_number || '';
        return [p.payment_number, o, p.payment_date, p.payment_method, p.payment_type, String(p.amount), p.reference_number || ''];
      });
    } else if (activeTab === 'hpp_margin') {
      headers = ['Nama Menu', 'Harga Jual', 'HPP Resep', 'Food Cost %', 'Margin %', 'Laba Kotor'];
      rows = filteredMenus.map((m) => [
        m.name,
        String(m.selling_price),
        String(m.cost_price),
        `${m.food_cost_pct}%`,
        `${m.margin_pct}%`,
        String(m.selling_price - m.cost_price),
      ]);
    } else if (activeTab === 'production') {
      headers = ['Tgl Produksi', 'No Pesanan', 'Menu', 'Jumlah Porsi', 'Status', 'Catatan'];
      rows = filteredProductions.map((p) => {
        const o = orders.find((ord) => ord.id === p.order_id)?.order_number || '';
        const m = menus.find((mnu) => mnu.id === p.menu_id)?.name || '';
        return [p.production_date, o, m, String(p.portions_needed), p.status, p.notes || ''];
      });
    } else if (activeTab === 'shipments') {
      headers = ['Tgl Kirim', 'Jam', 'No Pesanan', 'Tujuan', 'Kurir', 'Paket', 'Status'];
      rows = filteredShipments.map((s) => {
        const o = orders.find((ord) => ord.id === s.order_id)?.order_number || '';
        return [s.delivery_date, s.delivery_time, o, s.destination_address, s.courier_name || '', String(s.package_count), s.status];
      });
    } else if (activeTab === 'customers') {
      headers = ['Kode', 'Nama', 'WhatsApp', 'Email', 'Alamat', 'Total Pesanan'];
      rows = filteredCustomers.map((c) => {
        const count = orders.filter((o) => o.customer_id === c.id).length;
        return [c.code, c.name, c.phone, c.email || '', c.address, String(count)];
      });
    } else {
      headers = ['Kode Menu', 'Nama Menu', 'Harga Jual', 'HPP', 'Status'];
      rows = filteredMenus.map((m) => [m.code, m.name, String(m.selling_price), String(m.cost_price), m.is_active ? 'Aktif' : 'Nonaktif']);
    }

    csvContent += headers.join(',') + '\r\n';
    rows.forEach((rowArray) => {
      const row = rowArray.map((cell) => `"${cell}"`).join(',');
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCustomerName = (cId: string) => customers.find((c) => c.id === cId)?.name || 'Pelanggan';
  const getMenuName = (mId: string) => menus.find((m) => m.id === mId)?.name || 'Menu';
  const getOrderNumber = (oId: string) => orders.find((o) => o.id === oId)?.order_number || oId;

  return (
    <div className="space-y-6">
      {/* Top Header & Export Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Pusat Laporan & Rekapitulasi Terpadu</h3>
          <p className="text-xs text-slate-500">
            Laporan pesanan, penjualan, produksi, pengiriman, HPP, margin & ekspor CSV/Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Tanggal & Pencarian */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
            <Calendar className="h-4 w-4 text-amber-600" />
            <span>Periode:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 border rounded-xl border-slate-300 font-medium"
          />
          <span className="text-slate-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 border rounded-xl border-slate-300 font-medium"
          />
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari data laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border rounded-xl border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Tabs Navigasi 8 Laporan */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'orders' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Pesanan
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'sales' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Penjualan
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'payments' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Pembayaran
        </button>
        <button
          onClick={() => setActiveTab('hpp_margin')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'hpp_margin' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan HPP & Margin
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'production' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Produksi
        </button>
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'shipments' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Pengiriman
        </button>
        <button
          onClick={() => setActiveTab('menus')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'menus' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Menu
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3 py-2 rounded-xl whitespace-nowrap transition ${
            activeTab === 'customers' ? 'bg-amber-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Pelanggan
        </button>
      </div>

      {/* Report Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {activeTab === 'orders' || activeTab === 'sales' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">No. Pesanan</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Tgl Acara</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Status Bayar</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.order_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{getCustomerName(o.customer_id)}</td>
                    <td className="py-3 px-4 text-slate-600">{o.event_date}</td>
                    <td className="py-3 px-4 font-mono">{formatRupiah(o.subtotal)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatRupiah(o.total_amount)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-800">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'hpp_margin' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Menu Jual</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4">HPP Pokok</th>
                  <th className="py-3 px-4">Laba Kotor</th>
                  <th className="py-3 px-4">Food Cost (%)</th>
                  <th className="py-3 px-4">Gross Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMenus.map((m) => {
                  const grossProfit = m.selling_price - m.cost_price;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 font-mono font-bold">{formatRupiah(m.selling_price)}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{formatRupiah(m.cost_price)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {formatRupiah(grossProfit)}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-amber-800">
                        {formatPercent(m.food_cost_pct)}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-blue-700">
                        {formatPercent(m.margin_pct)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'payments' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Tgl Pembayaran</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Jumlah Diterima</th>
                  <th className="py-3 px-4">No Referensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.payment_number}</td>
                    <td className="py-3 px-4 text-slate-600">{p.payment_date}</td>
                    <td className="py-3 px-4 font-bold">{p.payment_method}</td>
                    <td className="py-3 px-4">{p.payment_type}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">{formatRupiah(p.amount)}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.reference_number || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'production' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Tgl Produksi</th>
                  <th className="py-3 px-4">No Pesanan</th>
                  <th className="py-3 px-4">Menu Katering</th>
                  <th className="py-3 px-4">Jumlah Porsi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProductions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.production_date}</td>
                    <td className="py-3 px-4 font-mono text-amber-800">{getOrderNumber(p.order_id)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{getMenuName(p.menu_id)}</td>
                    <td className="py-3 px-4 font-mono font-bold">{p.portions_needed} porsi</td>
                    <td className="py-3 px-4">{p.status}</td>
                    <td className="py-3 px-4 text-slate-500">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'shipments' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Tgl Kirim</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">No Pesanan</th>
                  <th className="py-3 px-4">Alamat Tujuan</th>
                  <th className="py-3 px-4">Kurir</th>
                  <th className="py-3 px-4">Paket</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.delivery_date}</td>
                    <td className="py-3 px-4">{s.delivery_time} WIB</td>
                    <td className="py-3 px-4 font-mono text-amber-800">{getOrderNumber(s.order_id)}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{s.destination_address}</td>
                    <td className="py-3 px-4">{s.courier_name || '-'}</td>
                    <td className="py-3 px-4 font-mono">{s.package_count} box</td>
                    <td className="py-3 px-4">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'customers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Pelanggan</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Alamat</th>
                  <th className="py-3 px-4">Total Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCustomers.map((c) => {
                  const custOrders = orders.filter((o) => o.customer_id === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3 px-4">{c.phone}</td>
                      <td className="py-3 px-4 text-slate-500">{c.email || '-'}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{c.address}</td>
                      <td className="py-3 px-4 font-bold font-mono text-amber-800">
                        {custOrders.length} Pesanan
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Menu</th>
                  <th className="py-3 px-4">Kemasan</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4">HPP</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMenus.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{m.name}</td>
                    <td className="py-3 px-4">{m.unit}</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatRupiah(m.selling_price)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{formatRupiah(m.cost_price)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${m.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {m.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
