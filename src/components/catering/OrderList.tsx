import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Printer,
  X,
  CreditCard,
  User,
  UtensilsCrossed,
  CheckCircle,
} from 'lucide-react';
import { Order, Customer, Menu, OrderItem, OrderStatus, Payment } from '../../types/database';
import { formatRupiah } from '../../utils/calculations';

interface OrderListProps {
  orders: Order[];
  customers: Customer[];
  menus: Menu[];
  payments: Payment[];
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (orderId: string, updated: Partial<Order>) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  customers,
  menus,
  payments,
  onAddOrder,
  onUpdateOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewOrderDetail, setViewOrderDetail] = useState<Order | null>(null);

  // Modal State: Add or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [eventDate, setEventDate] = useState('2026-10-12');
  const [eventTime, setEventTime] = useState('11:00');
  const [eventType, setEventType] = useState('Seminar / Rapat');
  const [eventLocation, setEventLocation] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');

  // Selected Order items: { menu_id, quantity, unit_price }
  const [selectedItems, setSelectedItems] = useState<
    Array<{ menu_id: string; quantity: number; unit_price: number }>
  >([{ menu_id: menus[0]?.id || '', quantity: 50, unit_price: menus[0]?.selling_price || 25000 }]);

  // Hitung pembayaran riil per pesanan
  const getOrderPaymentsTotal = (orderId: string, upfrontDP: number = 0) => {
    const list = payments.filter((p) => p.order_id === orderId);
    const sum = list.reduce((acc, p) => acc + p.amount, 0);
    return Math.max(sum, upfrontDP);
  };

  const filteredOrders = orders.filter((o) => {
    const cust = customers.find((c) => c.id === o.customer_id);
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Siap dikirim':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Produksi':
      case 'Diproses':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Menunggu pembayaran':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Dibatalkan':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getCustomerName = (cId: string) => customers.find((c) => c.id === cId)?.name || 'Pelanggan';

  // Kalkulasi form pesanan
  const formSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const formTotalAmount = Math.max(0, formSubtotal - discount + additionalCost);
  const formRemainingBalance = Math.max(0, formTotalAmount - downPayment);

  const handleAddItemRow = () => {
    setSelectedItems([
      ...selectedItems,
      { menu_id: menus[0]?.id || '', quantity: 20, unit_price: menus[0]?.selling_price || 25000 },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...selectedItems];
    if (field === 'menu_id') {
      const chosenMenu = menus.find((m) => m.id === value);
      updated[index].menu_id = value;
      updated[index].unit_price = chosenMenu ? chosenMenu.selling_price : 25000;
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, Number(value));
    } else if (field === 'unit_price') {
      updated[index].unit_price = Math.max(0, Number(value));
    }
    setSelectedItems(updated);
  };

  const openAddModal = () => {
    setEditingOrder(null);
    const defaultCust = customers[0];
    setCustomerId(defaultCust?.id || '');
    setEventDate('2026-10-12');
    setEventTime('11:00');
    setEventType('Seminar / Rapat');
    setEventLocation(defaultCust?.address || '');
    setDiscount(0);
    setAdditionalCost(0);
    setDownPayment(0);
    setOrderNotes('');
    setSelectedItems([
      { menu_id: menus[0]?.id || '', quantity: 50, unit_price: menus[0]?.selling_price || 25000 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setCustomerId(order.customer_id);
    setEventDate(order.event_date);
    setEventTime(order.event_time || '11:00');
    setEventType(order.event_type);
    setEventLocation(order.event_location);
    setDiscount(order.discount);
    setAdditionalCost(order.additional_cost);
    setDownPayment(order.down_payment);
    setOrderNotes(order.notes || '');

    if (order.items && order.items.length > 0) {
      setSelectedItems(
        order.items.map((i) => ({
          menu_id: i.menu_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        }))
      );
    } else {
      setSelectedItems([
        { menu_id: menus[0]?.id || '', quantity: 50, unit_price: menus[0]?.selling_price || 25000 },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !eventDate || !eventLocation || selectedItems.length === 0) {
      alert('Mohon lengkapi formulir pesanan!');
      return;
    }

    const orderItems: OrderItem[] = selectedItems.map((item, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      order_id: editingOrder?.id || `ord-${Date.now()}`,
      menu_id: item.menu_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    const paymentStatus =
      downPayment >= formTotalAmount
        ? 'Lunas'
        : downPayment > 0
        ? 'DP Sebagian'
        : 'Belum Bayar';

    if (editingOrder) {
      onUpdateOrder(editingOrder.id, {
        customer_id: customerId,
        event_date: eventDate,
        event_time: eventTime,
        event_type: eventType,
        event_location: eventLocation,
        subtotal: formSubtotal,
        discount,
        additional_cost: additionalCost,
        total_amount: formTotalAmount,
        down_payment: downPayment,
        remaining_balance: formRemainingBalance,
        payment_status: paymentStatus,
        notes: orderNotes,
        items: orderItems,
      });
    } else {
      const newOrderNumber = `ORD-202610-00${orders.length + 1}`;
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        order_number: newOrderNumber,
        customer_id: customerId,
        order_date: new Date().toISOString().split('T')[0],
        event_date: eventDate,
        event_time: eventTime,
        event_type: eventType,
        event_location: eventLocation,
        subtotal: formSubtotal,
        discount,
        additional_cost: additionalCost,
        total_amount: formTotalAmount,
        down_payment: downPayment,
        remaining_balance: formRemainingBalance,
        payment_status: paymentStatus,
        status: downPayment > 0 ? 'Diproses' : 'Menunggu pembayaran',
        notes: orderNotes,
        items: orderItems,
      };
      onAddOrder(newOrder);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Add Order Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari no pesanan, pelanggan, acara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Menunggu pembayaran">Menunggu Pembayaran</option>
            <option value="Diproses">Diproses</option>
            <option value="Produksi">Produksi</option>
            <option value="Siap dikirim">Siap Dikirim</option>
            <option value="Selesai">Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Buat Pesanan Catering</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Pelanggan & Acara</th>
                <th className="py-3 px-4">Tgl Acara</th>
                <th className="py-3 px-4">Total Tagihan</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4">Status Pesanan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada pesanan katering ditemukan
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const actualPaid = getOrderPaymentsTotal(order.id, order.down_payment);
                  const actualRemaining = Math.max(0, order.total_amount - actualPaid);
                  const isPaidOff = actualRemaining === 0 && actualPaid > 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.order_number}
                        <span className="block text-[11px] font-normal text-slate-400">
                          Tgl: {order.order_date}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{getCustomerName(order.customer_id)}</div>
                        <div className="text-xs text-slate-500">{order.event_type}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-amber-600" />
                          <span>{order.event_date}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {order.event_time || '11:00'} WIB
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-bold text-slate-900 font-mono">
                          {formatRupiah(order.total_amount)}
                        </div>
                        {order.discount > 0 && (
                          <span className="text-[10px] text-emerald-600">
                            Diskon: {formatRupiah(order.discount)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPaidOff
                              ? 'bg-emerald-100 text-emerald-800'
                              : actualPaid > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPaidOff ? 'Lunas' : actualPaid > 0 ? 'DP Sebagian' : 'Belum Bayar'}
                        </span>
                        {actualRemaining > 0 ? (
                          <div className="text-[11px] text-rose-600 font-mono mt-0.5 font-semibold">
                            Sisa: {formatRupiah(actualRemaining)}
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-600 font-mono mt-0.5 font-semibold">
                            Terbayar: {formatRupiah(actualPaid)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                            order.status
                          )} cursor-pointer`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Menunggu pembayaran">Menunggu pembayaran</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Produksi">Produksi</option>
                          <option value="Siap dikirim">Siap dikirim</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewOrderDetail(order)}
                            title="Invoice & Detail"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            title="Edit Pesanan"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pesanan ${order.order_number}?`)) {
                                onDeleteOrder(order.id);
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

      {/* MODAL: FORM BUAT/EDIT PESANAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingOrder ? `Edit Pesanan #${editingOrder.order_number}` : 'Buat Pesanan Catering Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Pelanggan *</label>
                  <select
                    value={customerId}
                    onChange={(e) => {
                      setCustomerId(e.target.value);
                      const sel = customers.find((c) => c.id === e.target.value);
                      if (sel) setEventLocation(sel.address);
                    }}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-medium"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Acara *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Seminar Vokasi / Resepsi"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Acara *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jam Pelaksanaan *</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi Pengiriman / Acara *</label>
                <input
                  type="text"
                  placeholder="Gedung / Alamat lengkap..."
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
                />
              </div>

              {/* MULTI MENU PICKER */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                    Pilihan Menu Katering
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    + Tambah Menu
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <select
                        value={item.menu_id}
                        onChange={(e) => handleItemChange(idx, 'menu_id', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border rounded-xl border-slate-300"
                      >
                        {menus.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({formatRupiah(m.selling_price)})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Porsi"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 px-2.5 py-1.5 bg-white border rounded-xl border-slate-300 text-center font-bold"
                      />

                      <div className="w-24 text-right font-mono font-bold text-slate-800">
                        {formatRupiah(item.quantity * item.unit_price)}
                      </div>

                      {selectedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* KALKULASI TAGIHAN */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Diskon (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Biaya Kirim/Lain (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={additionalCost}
                    onChange={(e) => setAdditionalCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Down Payment / DP (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Menu:</span>
                  <span className="font-mono font-bold">{formatRupiah(formSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm">
                  <span>Total Tagihan:</span>
                  <span className="font-mono text-amber-900">{formatRupiah(formTotalAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold pt-1 border-t border-amber-200">
                  <span>Sisa Pembayaran:</span>
                  <span className="font-mono">{formatRupiah(formRemainingBalance)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Catatan pesanan..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-300"
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
                  Simpan Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PESANAN & INVOICE KWITANSI */}
      {viewOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setViewOrderDetail(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                  INVOICE CATERING
                </span>
                <h3 className="font-bold text-slate-900 text-xl font-mono">
                  {viewOrderDetail.order_number}
                </h3>
              </div>
              <button onClick={() => setViewOrderDetail(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
              <div>
                <span className="text-slate-400 block">Pemesan:</span>
                <p className="font-bold text-slate-900 text-sm">{getCustomerName(viewOrderDetail.customer_id)}</p>
                <p className="text-slate-600 mt-0.5">{viewOrderDetail.event_type}</p>
              </div>
              <div>
                <span className="text-slate-400 block">Waktu Acara:</span>
                <p className="font-bold text-slate-900">{viewOrderDetail.event_date} ({viewOrderDetail.event_time} WIB)</p>
                <p className="text-slate-600 truncate">{viewOrderDetail.event_location}</p>
              </div>
            </div>

            {/* Item tabel */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Menu</th>
                    <th className="py-2.5 px-3">Jumlah</th>
                    <th className="py-2.5 px-3">Harga</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewOrderDetail.items?.map((it) => {
                    const menu = menus.find((m) => m.id === it.menu_id);
                    return (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{menu?.name || 'Menu'}</td>
                        <td className="py-2.5 px-3">{it.quantity} porsi</td>
                        <td className="py-2.5 px-3 font-mono">{formatRupiah(it.unit_price)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                          {formatRupiah(it.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Riwayat Pembayaran Nyata yang Terhubung */}
            {payments.filter((p) => p.order_id === viewOrderDetail.id).length > 0 && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-950 block">Riwayat Transaksi Pembayaran:</span>
                {payments
                  .filter((p) => p.order_id === viewOrderDetail.id)
                  .map((pay) => (
                    <div key={pay.id} className="flex justify-between text-[11px] text-emerald-900">
                      <span>• {pay.payment_number} ({pay.payment_method} - {pay.payment_type}) [{pay.payment_date}]:</span>
                      <span className="font-mono font-bold">{formatRupiah(pay.amount)}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Ringkasan Biaya */}
            {(() => {
              const actualPaid = getOrderPaymentsTotal(viewOrderDetail.id, viewOrderDetail.down_payment);
              const actualRemaining = Math.max(0, viewOrderDetail.total_amount - actualPaid);

              return (
                <div className="p-4 bg-amber-50/70 rounded-2xl space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal Menu:</span>
                    <span className="font-mono font-bold">{formatRupiah(viewOrderDetail.subtotal)}</span>
                  </div>
                  {viewOrderDetail.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Potongan Diskon:</span>
                      <span className="font-mono">-{formatRupiah(viewOrderDetail.discount)}</span>
                    </div>
                  )}
                  {viewOrderDetail.additional_cost > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Pengantaran:</span>
                      <span className="font-mono">+{formatRupiah(viewOrderDetail.additional_cost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-amber-200">
                    <span>Total Tagihan:</span>
                    <span className="font-mono text-amber-900">{formatRupiah(viewOrderDetail.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Total Pembayaran Masuk:</span>
                    <span className="font-mono text-emerald-700 font-bold">{formatRupiah(actualPaid)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-extrabold text-sm pt-1 border-t border-amber-200">
                    <span>Sisa Tagihan:</span>
                    <span className="font-mono">{formatRupiah(actualRemaining)}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Nota Pesanan</span>
              </button>
              <button
                onClick={() => setViewOrderDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
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
