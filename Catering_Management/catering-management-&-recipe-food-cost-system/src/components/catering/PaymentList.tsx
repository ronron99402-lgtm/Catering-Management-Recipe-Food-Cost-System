import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  TrendingUp,
  Printer,
  FileCheck,
  ChefHat,
} from 'lucide-react';
import { Payment, Order, PaymentMethod, PaymentType } from '../../types/database';
import { formatRupiah } from '../../utils/calculations';

interface PaymentListProps {
  payments: Payment[];
  orders: Order[];
  onAddPayment: (payment: Payment) => void;
}

// Helper Terbilang Bahasa Indonesia
function terbilang(angka: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  if (angka < 12) {
    return bilangan[angka];
  } else if (angka < 20) {
    return terbilang(angka - 10) + ' Belas';
  } else if (angka < 100) {
    return (
      terbilang(Math.floor(angka / 10)) +
      ' Puluh ' +
      bilangan[angka % 10]
    ).trim();
  } else if (angka < 200) {
    return 'Seratus ' + terbilang(angka - 100);
  } else if (angka < 1000) {
    return (
      terbilang(Math.floor(angka / 100)) +
      ' Ratus ' +
      terbilang(angka % 100)
    ).trim();
  } else if (angka < 2000) {
    return 'Seribu ' + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    return (
      terbilang(Math.floor(angka / 1000)) +
      ' Ribu ' +
      terbilang(angka % 1000)
    ).trim();
  } else if (angka < 1000000000) {
    return (
      terbilang(Math.floor(angka / 1000000)) +
      ' Juta ' +
      terbilang(angka % 1000000)
    ).trim();
  } else {
    return (
      terbilang(Math.floor(angka / 1000000000)) +
      ' Miliar ' +
      terbilang(angka % 1000000000)
    ).trim();
  }
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  orders,
  onAddPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);

  // Form states
  const [orderId, setOrderId] = useState(orders[0]?.id || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(1000000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transfer');
  const [paymentType, setPaymentType] = useState<PaymentType>('Pelunasan');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Ringkasan Keuangan
  const totalOrderAmount = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalPaymentReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = Math.max(0, totalOrderAmount - totalPaymentReceived);

  const filteredPayments = payments.filter((p) => {
    const order = orders.find((o) => o.id === p.order_id);
    const orderNum = order ? order.order_number : '';
    return (
      p.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.reference_number && p.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getOrder = (oId: string) => orders.find((o) => o.id === oId);
  const getOrderNumber = (oId: string) => orders.find((o) => o.id === oId)?.order_number || oId;

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || amount <= 0) {
      alert('Mohon pilih pesanan dan isi jumlah pembayaran!');
      return;
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      payment_number: `PAY-202610-00${payments.length + 1}`,
      order_id: orderId,
      payment_date: paymentDate,
      amount: Number(amount),
      payment_method: paymentMethod,
      payment_type: paymentType,
      reference_number: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes,
    };

    onAddPayment(newPayment);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 3 KARTU RINGKASAN KEUANGAN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Nilai Pesanan</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatRupiah(totalOrderAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Akumulasi seluruh invoice</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Kas Masuk (Lunas/DP)</span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            {formatRupiah(totalPaymentReceived)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-medium">Uang telah diterima</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Sisa Piutang Pelanggan</span>
          <div className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatRupiah(totalOutstanding)}
          </div>
          <span className="text-[11px] text-rose-600 mt-1 block font-medium">Belum dibayarkan</span>
        </div>
      </div>

      {/* Top Filter & Tombol Catat Pembayaran */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no pembayaran, no pesanan, referensi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <button
          onClick={() => {
            const first = orders[0];
            setOrderId(first?.id || '');
            if (first) setAmount(first.remaining_balance > 0 ? first.remaining_balance : 500000);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Catat Transaksi Pembayaran</span>
        </button>
      </div>

      {/* Tabel Riwayat Pembayaran */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Tanggal Bayar</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Metode & Ref</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Belum ada riwayat transaksi pembayaran
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.payment_number}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {getOrderNumber(p.order_id)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{p.payment_date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.payment_type === 'Pelunasan'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.payment_type === 'DP'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.payment_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-bold text-slate-800">{p.payment_method}</span>
                      <span className="block text-[11px] font-mono text-slate-400">
                        {p.reference_number || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {p.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPaymentForReceipt(p)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        title="Cetak Bukti Kwitansi"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-600" />
                        <span>Kwitansi</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CATAT PEMBAYARAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl z-10 space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Catat Pembayaran Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Pesanan *</label>
                <select
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    const sel = orders.find((o) => o.id === e.target.value);
                    if (sel) setAmount(sel.remaining_balance > 0 ? sel.remaining_balance : 500000);
                  }}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 font-medium text-xs"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} - {o.event_type} (Sisa: {formatRupiah(o.remaining_balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Bayar *</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Pembayaran</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 text-xs"
                  >
                    <option value="DP">Uang Muka (DP)</option>
                    <option value="Pelunasan">Pelunasan</option>
                    <option value="Cicilan">Cicilan Termin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Metode Bayar *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 text-xs"
                  >
                    <option value="Cash">Tunai / Cash</option>
                    <option value="Transfer">Transfer Bank</option>
                    <option value="QRIS">QRIS / E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Referensi Transaksi</label>
                <input
                  type="text"
                  placeholder="Contoh: TRF-BCA-991203"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan</label>
                <input
                  type="text"
                  placeholder="Catatan tambahan pembayaran"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK KWITANSI PEMBAYARAN RESMI */}
      {selectedPaymentForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedPaymentForReceipt(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Kop Kwitansi */}
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
                <span className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider inline-block">
                  KWITANSI RESMI
                </span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">
                  {selectedPaymentForReceipt.payment_number}
                </p>
                <p className="text-xs text-slate-500">
                  Tanggal: {selectedPaymentForReceipt.payment_date}
                </p>
              </div>
            </div>

            {/* Isi Kwitansi */}
            <div className="space-y-4 text-xs text-slate-800">
              <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                <span className="w-40 font-semibold text-slate-500">Telah Diterima Dari</span>
                <span className="font-bold text-slate-900 text-sm flex-1">
                  : {getOrder(selectedPaymentForReceipt.order_id)?.event_type || 'Pelanggan Katering'}
                </span>
              </div>

              <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                <span className="w-40 font-semibold text-slate-500">Uang Sejumlah</span>
                <span className="font-bold text-slate-900 italic bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs flex-1">
                  : " {terbilang(selectedPaymentForReceipt.amount)} Rupiah "
                </span>
              </div>

              <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                <span className="w-40 font-semibold text-slate-500">Untuk Pembayaran</span>
                <span className="font-medium text-slate-800 flex-1">
                  : {selectedPaymentForReceipt.payment_type} untuk Pesanan #{getOrderNumber(selectedPaymentForReceipt.order_id)}
                  {selectedPaymentForReceipt.notes ? ` (${selectedPaymentForReceipt.notes})` : ''}
                </span>
              </div>

              <div className="flex items-start gap-3 py-2 border-b border-slate-100">
                <span className="w-40 font-semibold text-slate-500">Metode Pembayaran</span>
                <span className="font-bold text-slate-800 flex-1">
                  : {selectedPaymentForReceipt.payment_method}
                  {selectedPaymentForReceipt.reference_number
                    ? ` (No. Ref: ${selectedPaymentForReceipt.reference_number})`
                    : ''}
                </span>
              </div>
            </div>

            {/* Jumlah Uang & Tanda Tangan */}
            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl w-fit">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                  JUMLAH DITERIMA:
                </span>
                <span className="text-xl font-black font-mono text-emerald-900">
                  {formatRupiah(selectedPaymentForReceipt.amount)}
                </span>
              </div>

              <div className="text-center text-xs space-y-1">
                <p className="font-semibold text-slate-500">
                  Jakarta, {selectedPaymentForReceipt.payment_date}
                </p>
                <p className="text-slate-400">Bagian Keuangan & Kasir,</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="border-b border-slate-400 w-36 inline-block"></span>
                </div>
                <p className="font-bold text-slate-900 mt-1">( Bendahara Katering )</p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Lembar Kwitansi</span>
              </button>

              <button
                onClick={() => setSelectedPaymentForReceipt(null)}
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
