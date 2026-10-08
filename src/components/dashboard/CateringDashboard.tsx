import React from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  Calendar,
  AlertCircle,
  ArrowRight,
  PackageCheck,
  MapPin,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { Order, Production, Shipment, Customer, Menu } from '../../types/database';
import { formatRupiah } from '../../utils/calculations';
import { NavItemKey } from '../layout/Sidebar';

interface CateringDashboardProps {
  orders: Order[];
  productions: Production[];
  shipments: Shipment[];
  customers: Customer[];
  menus: Menu[];
  onNavigate: (view: NavItemKey) => void;
  onSelectOrder?: (order: Order) => void;
}

export const CateringDashboard: React.FC<CateringDashboardProps> = ({
  orders,
  productions,
  shipments,
  customers,
  menus,
  onNavigate,
  onSelectOrder,
}) => {
  // Hitungan statistik
  const totalOrders = orders.length;
  const todayStr = '2026-10-07';
  
  const ordersToday = orders.filter((o) => o.event_date === todayStr || o.order_date === todayStr).length;
  const inProgressOrders = orders.filter((o) => ['Diproses', 'Produksi', 'Siap dikirim'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'Selesai').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalRemaining = orders.reduce((sum, o) => sum + (o.remaining_balance || 0), 0);

  // Jadwal terdekat (urutkan berdasarkan event_date)
  const upcomingOrders = [...orders]
    .filter((o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan')
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 4);

  // Status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Diproses':
      case 'Produksi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Siap dikirim':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Menunggu pembayaran':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Dibatalkan':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || 'Pelanggan';
  };

  const getMenuName = (menuId: string) => {
    return menus.find((m) => m.id === menuId)?.name || 'Menu Catering';
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 sm:p-7 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs rounded-full font-semibold mb-2">
            Proyek Vokasi Tata Boga & Manajemen
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Selamat Datang di Catering Management System
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Pantau seluruh alur operasional: dari harga bahan baku, kalkulasi HPP resep, hingga pesanan dan produksi katering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold rounded-xl text-sm transition shadow"
          >
            + Pesanan Baru
          </button>
          <button
            onClick={() => onNavigate('dashboard-recipe')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold rounded-xl text-sm transition border border-white/20"
          >
            Cek Food Cost
          </button>
        </div>
      </div>

      {/* 6 Statistik Kartu Utama */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Pesanan</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{totalOrders}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua waktu</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pesanan Hari Ini</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600">{ordersToday}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Jadwal hari ini</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sedang Diproses</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600">{inProgressOrders}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Dapur & Pengiriman</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pesanan Selesai</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600">{completedOrders}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tuntas diantar</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Pendapatan</span>
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">{formatRupiah(totalRevenue)}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Akumulasi omset</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sisa Piutang / Tagihan</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-rose-600 truncate">{formatRupiah(totalRemaining)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Belum lunas</p>
        </div>
      </div>

      {/* Grid: Jadwal Katering Terdekat & Ringkasan Dapur */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Terdekat (2 Kolom di Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Jadwal Acara Catering Terdekat
              </h3>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Semua Pesanan <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingOrders.map((order) => {
              const cust = customers.find((c) => c.id === order.customer_id);
              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{order.order_number}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        • {order.event_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">{cust?.name || 'Pelanggan'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{order.event_date} ({order.event_time || '11:00'} WIB)</span>
                      </div>
                      <div className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{order.event_location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span className="text-sm font-bold text-slate-900">
                      {formatRupiah(order.total_amount)}
                    </span>
                    <span className={`text-[11px] font-medium ${order.remaining_balance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {order.remaining_balance === 0 ? 'Lunas' : `Sisa: ${formatRupiah(order.remaining_balance)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Produksi & Pengiriman */}
        <div className="space-y-6">
          {/* Ringkasan Produksi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Ringkasan Produksi</h3>
              </div>
              <button
                onClick={() => onNavigate('production')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Lihat Rekap
              </button>
            </div>

            <div className="space-y-3">
              {productions.slice(0, 3).map((prod) => (
                <div key={prod.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{getMenuName(prod.menu_id)}</p>
                    <p className="text-[11px] text-slate-500">Tgl: {prod.production_date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {prod.portions_needed} porsi
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{prod.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ringkasan Pengiriman */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Ringkasan Pengiriman</h3>
              </div>
              <button
                onClick={() => onNavigate('shipments')}
                className="text-xs text-amber-600 font-semibold hover:underline"
              >
                Cek Kurir
              </button>
            </div>

            <div className="space-y-3">
              {shipments.slice(0, 2).map((ship) => (
                <div key={ship.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{ship.courier_name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                      {ship.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{ship.destination_address}</p>
                  <p className="text-[10px] text-slate-400">Jam: {ship.delivery_time} WIB • {ship.package_count} paket</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
