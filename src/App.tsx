import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CateringDashboard } from './components/dashboard/CateringDashboard';
import { RecipeDashboard } from './components/dashboard/RecipeDashboard';
import { CustomerList } from './components/catering/CustomerList';
import { IngredientsMaster } from './components/recipe/IngredientsMaster';
import { RecipeBank } from './components/recipe/RecipeBank';
import { OrderList } from './components/catering/OrderList';
import { ProductionBoard } from './components/catering/ProductionBoard';
import { ShipmentList } from './components/catering/ShipmentList';
import { PaymentList } from './components/catering/PaymentList';
import { SubRecipeManager } from './components/recipe/SubRecipeManager';
import { SellingMenuList } from './components/recipe/SellingMenuList';
import { CategoriesMaster } from './components/recipe/CategoriesMaster';
import { UnitsMaster } from './components/recipe/UnitsMaster';
import { PriceHistory } from './components/recipe/PriceHistory';
import { RecipeVersions } from './components/recipe/RecipeVersions';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginPage } from './components/auth/LoginPage';
import {
  initialCustomers,
  initialIngredients,
  initialRecipes,
  initialMenus,
  initialOrders,
  initialProduction,
  initialShipments,
  initialPayments,
  initialCategories,
  initialUnits,
  initialPriceHistory,
} from './data/initialData';
import {
  Customer,
  Ingredient,
  Recipe,
  Menu,
  Order,
  Production,
  Shipment,
  Payment,
  Category,
  OrderStatus,
  ProductionStatus,
  ShipmentStatus,
  IngredientPriceHistory,
} from './types/database';
import { isSupabaseConfigured, getStoredSupabaseConfig, supabase } from './lib/supabase';
import {
  loadSavedData,
  saveData,
  syncWithSupabase,
  fetchFromSupabase,
  deleteFromSupabase,
} from './lib/storage';
import {
  recalculateRecipeCosts,
  recalculateMenuCosts,
  calculateOrderBalance,
} from './utils/costCalculationEngine';
import { Sparkles, X, Database, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Session Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(() =>
    loadSavedData('user_session', {
      email: 'admin@vokasi.sch.id',
      name: 'Admin Vokasi Tata Boga',
    })
  );

  // Navigation State
  const [currentView, setCurrentView] = useState<NavItemKey>('dashboard-catering');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Cloud Database Connection State
  const [isDbConnected, setIsDbConnected] = useState<boolean>(() => getStoredSupabaseConfig().isConfigured);

  // Persistent Datasets (LocalStorage fallback + Supabase ready)
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadSavedData('customers', initialCustomers)
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    loadSavedData('ingredients', initialIngredients)
  );
  const [recipes, setRecipes] = useState<Recipe[]>(() =>
    loadSavedData('recipes', initialRecipes)
  );
  const [menus, setMenus] = useState<Menu[]>(() =>
    loadSavedData('menus', initialMenus)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadSavedData('orders', initialOrders)
  );
  const [productions, setProductions] = useState<Production[]>(() =>
    loadSavedData('productions', initialProduction)
  );
  const [shipments, setShipments] = useState<Shipment[]>(() =>
    loadSavedData('shipments', initialShipments)
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    loadSavedData('payments', initialPayments)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadSavedData('categories', initialCategories)
  );
  const [units] = useState(initialUnits);
  const [priceHistories, setPriceHistories] = useState<IngredientPriceHistory[]>(() =>
    loadSavedData('price_history', initialPriceHistory)
  );

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail Modal helper
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);

  // Database Hydration Callback
  const hydrateFromDatabase = useCallback(async () => {
    const config = getStoredSupabaseConfig();
    setIsDbConnected(config.isConfigured);
    if (!config.isConfigured) return;

    try {
      const [
        dbCust,
        dbIng,
        dbRec,
        dbMenu,
        dbOrd,
        dbProd,
        dbShip,
        dbPay,
        dbCat,
        dbHist,
      ] = await Promise.all([
        fetchFromSupabase<Customer>('customers'),
        fetchFromSupabase<Ingredient>('ingredients'),
        fetchFromSupabase<Recipe>('recipes'),
        fetchFromSupabase<Menu>('menus'),
        fetchFromSupabase<Order>('orders'),
        fetchFromSupabase<Production>('production'),
        fetchFromSupabase<Shipment>('shipments'),
        fetchFromSupabase<Payment>('payments'),
        fetchFromSupabase<Category>('categories'),
        fetchFromSupabase<IngredientPriceHistory>('ingredient_price_history'),
      ]);

      if (dbCust && dbCust.length > 0) setCustomers(dbCust);
      if (dbIng && dbIng.length > 0) setIngredients(dbIng);
      if (dbRec && dbRec.length > 0) setRecipes(dbRec);
      if (dbMenu && dbMenu.length > 0) setMenus(dbMenu);
      if (dbOrd && dbOrd.length > 0) setOrders(dbOrd);
      if (dbProd && dbProd.length > 0) setProductions(dbProd);
      if (dbShip && dbShip.length > 0) setShipments(dbShip);
      if (dbPay && dbPay.length > 0) setPayments(dbPay);
      if (dbCat && dbCat.length > 0) setCategories(dbCat);
      if (dbHist && dbHist.length > 0) setPriceHistories(dbHist);

      setToastMessage('Data tersinkronisasi dari Supabase Cloud Database!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.warn('Database hydration failed:', err);
    }
  }, []);

  // Run Hydration on mount
  useEffect(() => {
    hydrateFromDatabase();
  }, [hydrateFromDatabase]);

  // Save to persistence on change
  useEffect(() => {
    saveData('customers', customers);
  }, [customers]);

  useEffect(() => {
    saveData('ingredients', ingredients);
  }, [ingredients]);

  useEffect(() => {
    saveData('recipes', recipes);
  }, [recipes]);

  useEffect(() => {
    saveData('menus', menus);
  }, [menus]);

  useEffect(() => {
    saveData('orders', orders);
  }, [orders]);

  useEffect(() => {
    saveData('productions', productions);
  }, [productions]);

  useEffect(() => {
    saveData('shipments', shipments);
  }, [shipments]);

  useEffect(() => {
    saveData('payments', payments);
  }, [payments]);

  useEffect(() => {
    saveData('categories', categories);
  }, [categories]);

  useEffect(() => {
    saveData('price_history', priceHistories);
  }, [priceHistories]);

  // --- CRUD Handlers ---

  // Pelanggan
  const handleAddCustomer = (newCust: Omit<Customer, 'id'>) => {
    const cust: Customer = { id: `cust-${Date.now()}`, ...newCust };
    setCustomers([cust, ...customers]);
    syncWithSupabase('customers', cust);
  };
  const handleUpdateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(customers.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    syncWithSupabase('customers', { id, ...updated });
  };
  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
    deleteFromSupabase('customers', id);
  };

  // Bahan Baku
  const handleAddIngredient = (newIng: Omit<Ingredient, 'id'>) => {
    const ing: Ingredient = { id: `ing-${Date.now()}`, ...newIng };
    setIngredients([ing, ...ingredients]);
    syncWithSupabase('ingredients', ing);
  };

  /**
   * Update Bahan Baku:
   * Jika harga bahan berubah, otomatis catat riwayat harga,
   * lalu hitung ulang seluruh HPP Resep & Menu Jual yang terdampak!
   */
  const handleUpdateIngredient = (
    id: string,
    updated: Partial<Ingredient>,
    oldPrice?: number,
    newPrice?: number,
    notes?: string
  ) => {
    const updatedIngredients = ingredients.map((i) => (i.id === id ? { ...i, ...updated } : i));
    setIngredients(updatedIngredients);
    syncWithSupabase('ingredients', { id, ...updated });

    // Cek perubahan harga
    if (oldPrice !== undefined && newPrice !== undefined && oldPrice !== newPrice) {
      const ingName = updated.name || ingredients.find((i) => i.id === id)?.name || 'Bahan Baku';
      const historyItem: IngredientPriceHistory = {
        id: `hist-${Date.now()}`,
        ingredient_id: id,
        ingredient_name: ingName,
        old_price: oldPrice,
        new_price: newPrice,
        change_date: new Date().toISOString().split('T')[0],
        changed_by: currentUser?.name || 'Admin Chef',
        notes: notes || 'Pembaruan harga dari Master Bahan Baku',
      };
      setPriceHistories([historyItem, ...priceHistories]);
      syncWithSupabase('ingredient_price_history', historyItem);

      // Cascade recalculate recipes & menus!
      const recalculatedRecipes = recalculateRecipeCosts(recipes, updatedIngredients, units);
      setRecipes(recalculatedRecipes);

      const recalculatedMenus = recalculateMenuCosts(menus, recalculatedRecipes);
      setMenus(recalculatedMenus);

      setToastMessage(
        `Harga ${ingName} diubah ke Rp ${newPrice.toLocaleString('id-ID')}. Seluruh HPP Resep dan Menu Jual telah dihitung ulang secara otomatis!`
      );
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
    deleteFromSupabase('ingredients', id);
  };

  // Resep
  const handleAddRecipe = (newRec: Recipe) => {
    const updatedRecipes = [newRec, ...recipes];
    setRecipes(updatedRecipes);
    syncWithSupabase('recipes', newRec);

    // Sinkronkan ke menu jual
    const updatedMenus = recalculateMenuCosts(menus, updatedRecipes);
    setMenus(updatedMenus);
  };

  const handleUpdateRecipe = (id: string, updated: Partial<Recipe>) => {
    const updatedRecipes = recipes.map((r) => (r.id === id ? { ...r, ...updated } : r));
    setRecipes(updatedRecipes);
    syncWithSupabase('recipes', { id, ...updated });

    const updatedMenus = recalculateMenuCosts(menus, updatedRecipes);
    setMenus(updatedMenus);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter((r) => r.id !== id));
    deleteFromSupabase('recipes', id);
  };

  // Ubah versi aktif resep
  const handleUpdateActiveVersion = (recipeId: string, versionNumber: number, costPerPortion?: number) => {
    const updatedRecipes = recipes.map((r) => {
      if (r.id === recipeId) {
        return {
          ...r,
          active_version: versionNumber,
          cost_per_portion: costPerPortion || r.cost_per_portion,
        };
      }
      return r;
    });
    setRecipes(updatedRecipes);
    const updatedMenus = recalculateMenuCosts(menus, updatedRecipes);
    setMenus(updatedMenus);
    setToastMessage(`Versi ${versionNumber}.0 diaktifkan untuk resep terpilih!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Menu Jual
  const handleAddMenu = (newMenu: Menu) => {
    setMenus([newMenu, ...menus]);
    syncWithSupabase('menus', newMenu);
  };
  const handleUpdateMenu = (id: string, updated: Partial<Menu>) => {
    setMenus(menus.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    syncWithSupabase('menus', { id, ...updated });
  };
  const handleDeleteMenu = (id: string) => {
    setMenus(menus.filter((m) => m.id !== id));
    deleteFromSupabase('menus', id);
  };

  // Pesanan Catering
  const handleAddOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    syncWithSupabase('orders', newOrder);

    // Buat tiket produksi dan pengiriman otomatis dari pesanan
    if (newOrder.items) {
      newOrder.items.forEach((item, idx) => {
        const newProd: Production = {
          id: `prod-${Date.now()}-${idx}`,
          production_date: newOrder.event_date,
          order_id: newOrder.id,
          menu_id: item.menu_id,
          portions_needed: item.quantity,
          status: 'Belum diproses',
          notes: `Kebutuhan porsi untuk ${newOrder.event_type}`,
        };
        setProductions((prev) => [newProd, ...prev]);
        syncWithSupabase('production', newProd);
      });
    }

    const newShip: Shipment = {
      id: `shp-${Date.now()}`,
      order_id: newOrder.id,
      delivery_date: newOrder.event_date,
      delivery_time: newOrder.event_time || '10:00',
      courier_name: 'Driver Internal Catering',
      package_count: Math.ceil((newOrder.items?.reduce((s, i) => s + i.quantity, 0) || 50) / 25),
      destination_address: newOrder.event_location,
      recipient_phone: customers.find((c) => c.id === newOrder.customer_id)?.phone || '081234567890',
      status: 'Belum dikirim',
      notes: 'Antar sesuai jadwal pelaksanaan acara',
    };
    setShipments((prev) => [newShip, ...prev]);
    syncWithSupabase('shipments', newShip);

    // Jika ada DP yang dibayarkan saat input pesanan, catat transaksi pembayaran pertama!
    if (newOrder.down_payment > 0) {
      const dpPayment: Payment = {
        id: `pay-${Date.now()}`,
        payment_number: `PAY-202610-00${payments.length + 1}`,
        order_id: newOrder.id,
        payment_date: newOrder.order_date,
        amount: newOrder.down_payment,
        payment_method: 'Transfer',
        payment_type: 'DP',
        reference_number: `DP-${newOrder.order_number}`,
        notes: `Uang muka (DP) pesanan #${newOrder.order_number}`,
      };
      setPayments((prev) => [dpPayment, ...prev]);
      syncWithSupabase('payments', dpPayment);
    }
  };

  const handleUpdateOrder = (orderId: string, updated: Partial<Order>) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
    syncWithSupabase('orders', { id: orderId, ...updated });
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    syncWithSupabase('orders', { id: orderId, status });
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(orders.filter((o) => o.id !== orderId));
    deleteFromSupabase('orders', orderId);
  };

  // Produksi
  const handleUpdateProductionStatus = (prodId: string, status: ProductionStatus) => {
    setProductions(productions.map((p) => (p.id === prodId ? { ...p, status } : p)));
    syncWithSupabase('production', { id: prodId, status });
  };

  // Pengiriman
  const handleUpdateShipmentStatus = (shipId: string, status: ShipmentStatus) => {
    setShipments(shipments.map((s) => (s.id === shipId ? { ...s, status } : s)));
    syncWithSupabase('shipments', { id: shipId, status });
  };

  // Pembayaran
  const handleAddPayment = (newPay: Payment) => {
    const updatedPayments = [newPay, ...payments];
    setPayments(updatedPayments);
    syncWithSupabase('payments', newPay);

    // Hitung ulang status pembayaran dan sisa tagihan pesanan terkait secara akurat
    setOrders(
      orders.map((order) => {
        if (order.id === newPay.order_id) {
          const balance = calculateOrderBalance(order, updatedPayments);
          return {
            ...order,
            remaining_balance: balance.remaining,
            payment_status: balance.paymentStatus,
          };
        }
        return order;
      })
    );
  };

  // Kategori
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const cat: Category = { id: `cat-${Date.now()}`, ...newCat };
    setCategories([cat, ...categories]);
    syncWithSupabase('categories', cat);
  };
  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    deleteFromSupabase('categories', id);
  };

  // Quick Action Handler
  const handleQuickAction = () => {
    if (currentView === 'dashboard-catering' || currentView === 'orders') {
      setCurrentView('orders');
    } else if (currentView === 'dashboard-recipe' || currentView === 'recipe-bank') {
      setCurrentView('recipe-bank');
    } else {
      setCurrentView('orders');
    }
  };

  // Count indicators
  const lowStockCount = ingredients.filter((i) => i.stock <= i.min_stock).length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'Selesai' && o.status !== 'Dibatalkan').length;

  // Logout Handler
  const handleLogout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('catering_app_user_session');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout:', err);
      }
    }
    setToastMessage('Anda telah berhasil keluar dari sistem.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Jika belum login, tampilkan Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          saveData('user_session', user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 max-w-md animate-fade-in">
          <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-xs font-medium leading-relaxed flex-1">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sidebar Navigasi Responsif */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        orderCount={activeOrdersCount}
        lowStockCount={lowStockCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onQuickAction={handleQuickAction}
          isDbConnected={isDbConnected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard-catering' && (
            <CateringDashboard
              orders={orders}
              productions={productions}
              shipments={shipments}
              customers={customers}
              menus={menus}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'customers' && (
            <CustomerList
              customers={customers}
              orders={orders}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {currentView === 'catering-menus' && (
            <SellingMenuList
              menus={menus}
              recipes={recipes}
              categories={categories}
              onAddMenu={handleAddMenu}
              onUpdateMenu={handleUpdateMenu}
              onDeleteMenu={handleDeleteMenu}
            />
          )}

          {currentView === 'orders' && (
            <OrderList
              orders={orders}
              customers={customers}
              menus={menus}
              payments={payments}
              onAddOrder={handleAddOrder}
              onUpdateOrder={handleUpdateOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {currentView === 'production' && (
            <ProductionBoard
              productions={productions}
              orders={orders}
              menus={menus}
              recipes={recipes}
              ingredients={ingredients}
              units={units}
              onUpdateProductionStatus={handleUpdateProductionStatus}
            />
          )}

          {currentView === 'catering-ingredients' && (
            <IngredientsMaster
              ingredients={ingredients}
              categories={categories}
              units={units}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onViewPriceHistory={() => setCurrentView('price-history')}
            />
          )}

          {currentView === 'shipments' && (
            <ShipmentList
              shipments={shipments}
              orders={orders}
              onUpdateShipmentStatus={handleUpdateShipmentStatus}
            />
          )}

          {currentView === 'payments' && (
            <PaymentList
              payments={payments}
              orders={orders}
              onAddPayment={handleAddPayment}
            />
          )}

          {currentView === 'dashboard-recipe' && (
            <RecipeDashboard
              recipes={recipes}
              ingredients={ingredients}
              menus={menus}
              categories={categories}
              onNavigate={(v) => setCurrentView(v)}
              onSelectRecipe={(r) => {
                setSelectedRecipeDetail(r);
                setCurrentView('recipe-bank');
              }}
            />
          )}

          {currentView === 'recipe-bank' && (
            <RecipeBank
              recipes={recipes}
              categories={categories}
              ingredients={ingredients}
              units={units}
              onAddRecipe={handleAddRecipe}
              onUpdateRecipe={handleUpdateRecipe}
              onDeleteRecipe={handleDeleteRecipe}
              selectedRecipeForDetail={selectedRecipeDetail}
              onCloseDetailModal={() => setSelectedRecipeDetail(null)}
              onCreateNewVersion={(recipeId, summary) => {
                const rec = recipes.find((r) => r.id === recipeId);
                if (rec) {
                  const newVer = rec.active_version + 1;
                  handleUpdateActiveVersion(recipeId, newVer, rec.cost_per_portion);
                }
              }}
            />
          )}

          {currentView === 'recipe-ingredients' && (
            <IngredientsMaster
              ingredients={ingredients}
              categories={categories}
              units={units}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onViewPriceHistory={() => setCurrentView('price-history')}
            />
          )}

          {currentView === 'categories' && (
            <CategoriesMaster
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentView === 'units' && <UnitsMaster units={units} />}

          {currentView === 'sub-recipes' && (
            <SubRecipeManager
              recipes={recipes}
              ingredients={ingredients}
              units={units}
              onSelectRecipeForDetail={(r) => {
                setSelectedRecipeDetail(r);
                setCurrentView('recipe-bank');
              }}
            />
          )}

          {currentView === 'selling-menus' && (
            <SellingMenuList
              menus={menus}
              recipes={recipes}
              categories={categories}
              onAddMenu={handleAddMenu}
              onUpdateMenu={handleUpdateMenu}
              onDeleteMenu={handleDeleteMenu}
            />
          )}

          {currentView === 'price-history' && <PriceHistory priceHistories={priceHistories} />}

          {currentView === 'recipe-versions' && (
            <RecipeVersions
              recipes={recipes}
              onUpdateActiveVersion={handleUpdateActiveVersion}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              orders={orders}
              payments={payments}
              productions={productions}
              shipments={shipments}
              menus={menus}
              customers={customers}
              recipes={recipes}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsView orders={orders} customers={customers} />
          )}

          {currentView === 'settings' && (
            <SettingsView onRefreshData={hydrateFromDatabase} />
          )}
        </main>
      </div>
    </div>
  );
}
