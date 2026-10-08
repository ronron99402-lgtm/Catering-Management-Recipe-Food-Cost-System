import React, { useState } from 'react';
import {
  Truck,
  Search,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Package,
  Printer,
  CheckCircle,
  AlertTriangle,
  FileText,
  X,
  ChefHat,
  User,
} from 'lucide-react';
import { Shipment, Order, ShipmentStatus } from '../../types/database';

interface ShipmentListProps {
  shipments: Shipment[];
  orders: Order[];
  onUpdateShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void;
}

export const ShipmentList: React.FC<ShipmentListProps> = ({
  shipments,
  orders,
  onUpdateShipmentStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedShipmentForDoc, setSelectedShipmentForDoc] = useState<Shipment | null>(null);

  const filteredShipments = shipments.filter((s) => {
    const order = orders.find((o) => o.id === s.order_id);
    const orderNum = order ? order.order_number : '';
    const matchesSearch =
      orderNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.courier_name && s.courier_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrder = (oId: string) => orders.find((o) => o.id === oId);
  const getOrderNumber = (oId: string) => orders.find((o) => o.id === oId)?.order_number || oId;

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Terkirim':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Dalam perjalanan':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Gagal dikirim':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const handlePrintDocument = (s: Shipment) => {
    setSelectedShipmentForDoc(s);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kurir, no pesanan, alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="Belum dikirim">Belum Dikirim</option>
            <option value="Dalam perjalanan">Dalam Perjalanan</option>
            <option value="Terkirim">Terkirim</option>
            <option value="Gagal dikirim">Gagal Dikirim</option>
          </select>
        </div>

        <button
          onClick={() => {
            if (filteredShipments.length > 0) {
              setSelectedShipmentForDoc(filteredShipments[0]);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Cetak Surat Jalan</span>
        </button>
      </div>

      {/* Shipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Jadwal Kirim</th>
                <th className="py-3 px-4">Tujuan & Penerima</th>
                <th className="py-3 px-4">Jumlah Paket</th>
                <th className="py-3 px-4">Kurir Ditugaskan</th>
                <th className="py-3 px-4">Status Pengiriman</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada jadwal pengiriman
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {getOrderNumber(s.order_id)}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-amber-600" />
                        <span>{s.delivery_date}</span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-1 text-[11px] mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{s.delivery_time} WIB</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs max-w-xs">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-slate-800 truncate">{s.destination_address}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>{s.recipient_phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-800 font-mono">
                        {s.package_count} box/kontainer
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                      {s.courier_name || 'Driver Internal'}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <select
                        value={s.status}
                        onChange={(e) =>
                          onUpdateShipmentStatus(s.id, e.target.value as ShipmentStatus)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          s.status
                        )} cursor-pointer`}
                      >
                        <option value="Belum dikirim">Belum dikirim</option>
                        <option value="Dalam perjalanan">Dalam perjalanan</option>
                        <option value="Terkirim">Terkirim</option>
                        <option value="Gagal dikirim">Gagal dikirim</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handlePrintDocument(s)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        title="Lihat & Cetak Surat Jalan"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-600" />
                        <span>Surat Jalan</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CETAK SURAT JALAN RESMI */}
      {selectedShipmentForDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedShipmentForDoc(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header Surat Jalan */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-amber-600" />
                  <span className="font-black text-slate-900 text-base tracking-wider">
                    CATERING MANAGEMENT SYSTEM
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Layanan Katering & Kuliner Vokasi SMK Tata Boga
                </p>
                <p className="text-[11px] text-slate-400">
                  Jl. Pendidikan Vokasi No. 10 | Telp: 0812-3456-7890
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider inline-block">
                  SURAT JALAN
                </span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">
                  SJ-{selectedShipmentForDoc.id.replace(/\D/g, '').slice(-6) || '202610-01'}
                </p>
                <p className="text-xs text-slate-500">
                  Tanggal: {selectedShipmentForDoc.delivery_date}
                </p>
              </div>
            </div>

            {/* Informasi Pengiriman */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">
                  Kepada Penerima:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {getOrder(selectedShipmentForDoc.order_id)?.event_type || 'Pelanggan Katering'}
                </p>
                <p className="text-slate-700 mt-1 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedShipmentForDoc.destination_address}</span>
                </p>
                <p className="text-slate-600 mt-1 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-600" />
                  <span>No. Telp / WA: {selectedShipmentForDoc.recipient_phone}</span>
                </p>
              </div>

              <div className="border-l border-slate-200 pl-4 space-y-1.5">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    No. Pesanan Referensi:
                  </span>
                  <p className="font-mono font-bold text-amber-800 text-xs">
                    {getOrderNumber(selectedShipmentForDoc.order_id)}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Jadwal Sampai di Lokasi:
                  </span>
                  <p className="font-bold text-slate-900">
                    {selectedShipmentForDoc.delivery_date} pk {selectedShipmentForDoc.delivery_time} WIB
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Driver / Petugas Pengantar:
                  </span>
                  <p className="font-semibold text-slate-800">
                    {selectedShipmentForDoc.courier_name || 'Driver Ekspedisi Internal Catering'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rincian Muatan */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Item / Rincian Menu</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Kemasan</th>
                    <th className="py-2.5 px-3">Kondisi / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-mono">1</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      Pesanan Menu Katering Lengkap ({getOrderNumber(selectedShipmentForDoc.order_id)})
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono">
                      {selectedShipmentForDoc.package_count} Box / Kontainer
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {selectedShipmentForDoc.notes || 'Kondisi hangat & tersegel'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Kolom Tanda Tangan */}
            <div className="grid grid-cols-2 gap-8 pt-4 text-xs text-center border-t border-slate-200">
              <div>
                <p className="font-semibold text-slate-500">Petugas Pengantar (Driver),</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="border-b border-slate-400 w-36 inline-block"></span>
                </div>
                <p className="font-bold text-slate-900 mt-1">
                  ( {selectedShipmentForDoc.courier_name || 'Driver Catering'} )
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-500">Penerima Barang / Acara,</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="border-b border-slate-400 w-36 inline-block"></span>
                </div>
                <p className="font-bold text-slate-900 mt-1">( ........................................ )</p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Lembar Surat Jalan</span>
              </button>

              <button
                onClick={() => setSelectedShipmentForDoc(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
