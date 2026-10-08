-- ==============================================================================
-- CATERING MANAGEMENT & RECIPE FOOD COST SYSTEM
-- SEED DATA UNTUK PENGUJIAN & PROYEK VOKASI SEKOLAH
-- ==============================================================================

-- 1. UNITS / SATUAN STANDAR
INSERT INTO units (id, name, symbol, base_unit, conversion_factor, description) VALUES
('10000000-0000-0000-0000-000000000001', 'Kilogram', 'Kg', 'gram', 1000.0, '1 Kg = 1000 Gram'),
('10000000-0000-0000-0000-000000000002', 'Gram', 'g', 'gram', 1.0, 'Satuan dasar berat'),
('10000000-0000-0000-0000-000000000003', 'Liter', 'L', 'ml', 1000.0, '1 Liter = 1000 Ml'),
('10000000-0000-0000-0000-000000000004', 'Mililiter', 'ml', 'ml', 1.0, 'Satuan dasar volume'),
('10000000-0000-0000-0000-000000000005', 'Pieces / Pcs', 'pcs', 'pcs', 1.0, 'Satuan butir / biji'),
('10000000-0000-0000-0000-000000000006', 'Botol', 'btl', 'pcs', 1.0, 'Kemasan botol'),
('10000000-0000-0000-0000-000000000007', 'Bungkus', 'bks', 'pcs', 1.0, 'Kemasan bungkus'),
('10000000-0000-0000-0000-000000000008', 'Box', 'box', 'pcs', 1.0, 'Kemasan box catering'),
('10000000-0000-0000-0000-000000000009', 'Sendok Makan', 'sdm', 'gram', 15.0, 'Estimasi 1 sdm = 15 gram'),
('10000000-0000-0000-0000-000000000010', 'Sendok Teh', 'sdt', 'gram', 5.0, 'Estimasi 1 sdt = 5 gram')
ON CONFLICT (name) DO NOTHING;

-- 2. KATEGORI
INSERT INTO categories (id, name, type, description) VALUES
('20000000-0000-0000-0000-000000000001', 'Daging & Unggas', 'ingredient', 'Bahan baku hewani segar'),
('20000000-0000-0000-0000-000000000002', 'Sembako & Tepung', 'ingredient', 'Beras, minyak, gula, tepung'),
('20000000-0000-0000-0000-000000000003', 'Bumbu & Rempah', 'ingredient', 'Cabai, bawang, rempah dapur'),
('20000000-0000-0000-0000-000000000004', 'Makanan Utama', 'recipe', 'Hidangan porsi katering'),
('20000000-0000-0000-0000-000000000005', 'Sambal & Saus', 'recipe', 'Sub-resep bumbu dan sambal'),
('20000000-0000-0000-0000-000000000006', 'Snack & Bakery', 'recipe', 'Kudapan dan kue box'),
('20000000-0000-0000-0000-000000000007', 'Paket Nasi Box', 'menu', 'Paket katering makan siang/malam'),
('20000000-0000-0000-0000-000000000008', 'Paket Snack Box', 'menu', 'Paket kue seminar dan acara')
ON CONFLICT DO NOTHING;

-- 3. PELANGGAN (SMAK Mater Dei, Budi Santoso, Maria)
INSERT INTO customers (id, code, name, phone, email, address, notes) VALUES
('30000000-0000-0000-0000-000000000001', 'CUST-001', 'Budi Santoso', '081234567890', 'budi.santoso@email.com', 'Jl. Merdeka No. 45, Jakarta Pusat', 'Pelanggan korporat rutin bulanan'),
('30000000-0000-0000-0000-000000000002', 'CUST-002', 'Maria', '081987654321', 'maria.catering@email.com', 'Perum Harmoni Indah Blok B2 No. 10', 'Suka menu sambal tidak terlalu pedas'),
('30000000-0000-0000-0000-000000000003', 'CUST-003', 'SMAK Mater Dei', '082111223344', 'admin@materdei.sch.id', 'Jl. Pendidikan Raya No. 12', 'Langganan pesanan ujian & seminar guru')
ON CONFLICT DO NOTHING;

-- 4. MASTER BAHAN BAKU
-- Ayam, Beras, Tepung, Cabai, Bawang, Minyak, Garam
INSERT INTO ingredients (id, code, name, category_id, unit_id, purchase_price, price_per_base_unit, stock, min_stock, supplier, notes) VALUES
('40000000-0000-0000-0000-000000000001', 'ING-001', 'Daging Ayam Fillet', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 38000.00, 38.0000, 25.0, 5.0, 'CV Unggas Makmur', 'Harga per gram = Rp 38'),
('40000000-0000-0000-0000-000000000002', 'ING-002', 'Beras Ramos Super', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 14500.00, 14.5000, 100.0, 20.0, 'Toko Beras Barokah', 'Harga per gram = Rp 14.5'),
('40000000-0000-0000-0000-000000000003', 'ING-003', 'Tepung Terigu Serbaguna', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 14000.00, 14.0000, 40.0, 10.0, 'Grosir Sejahtera', 'Harga per gram = Rp 14'),
('40000000-0000-0000-0000-000000000004', 'ING-004', 'Cabai Rawit Merah', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 45000.00, 45.0000, 8.0, 3.0, 'Pasar Induk Kramat', 'Harga per gram = Rp 45'),
('40000000-0000-0000-0000-000000000005', 'ING-005', 'Bawang Merah & Putih Mix', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 35000.00, 35.0000, 12.0, 4.0, 'Pasar Induk Kramat', 'Harga per gram = Rp 35'),
('40000000-0000-0000-0000-000000000006', 'ING-006', 'Minyak Goreng Sawit', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 18000.00, 18.0000, 30.0, 8.0, 'Grosir Sejahtera', 'Harga per ml = Rp 18'),
('40000000-0000-0000-0000-000000000007', 'ING-007', 'Garam Beriodium', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 8000.00, 8.0000, 15.0, 2.0, 'Toko Sembako Berkah', 'Harga per gram = Rp 8')
ON CONFLICT DO NOTHING;

-- 5. RESEP & SUB-RECIPE
-- Sub-Recipe: Sambal Bawang (Untuk 10 porsi sambal)
INSERT INTO recipes (id, code, name, category_id, is_sub_recipe, yield_quantity, yield_unit, prep_time_minutes, cook_time_minutes, instructions, target_food_cost_pct, selling_price, notes) VALUES
('50000000-0000-0000-0000-000000000001', 'SUB-001', 'Sambal Bawang Spesial', '20000000-0000-0000-0000-000000000005', true, 10, 'porsi', 10, 15, 'Ulek kasar cabai rawit dan bawang putih, siram dengan minyak mendidih dan beri garam.', 35.00, 5000.00, 'Sub-resep serbaguna'),
('50000000-0000-0000-0000-000000000002', 'RCP-001', 'Ayam Geprek Crispy', '20000000-0000-0000-0000-000000000004', false, 10, 'porsi', 20, 25, 'Marinasi ayam, balurkan tepung terigu bumbu dua kali, goreng deep fry sampai keemasan, geprek bersama sambal bawang.', 35.00, 25000.00, 'Resep andalan catering'),
('50000000-0000-0000-0000-000000000003', 'RCP-002', 'Nasi Putih Pulen', '20000000-0000-0000-0000-000000000004', false, 10, 'porsi', 10, 30, 'Cuci beras, kukus dengan rasio air 1:1.2 sampai pulen dan tanak.', 30.00, 5000.00, 'Resep porsi nasi putih'),
('50000000-0000-0000-0000-000000000004', 'RCP-003', 'Snack Box Acara', '20000000-0000-0000-0000-000000000006', false, 10, 'box', 30, 45, 'Kombinasi lemper bakar, risoles mayo, dan air mineral botol mini.', 40.00, 15000.00, 'Paket snack box komplit')
ON CONFLICT DO NOTHING;

-- 6. BAHAN RESEP (Recipe Ingredients)
-- Sambal Bawang: Cabai (200g) + Bawang (100g) + Minyak (100ml) + Garam (20g)
-- Biaya: (200*45) + (100*35) + (100*18) + (20*8) = 9000 + 3500 + 1800 + 160 = Rp 14.460 / 10 porsi = Rp 1.446/porsi
INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit_id, unit_cost, subtotal_cost) VALUES
('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 200, '10000000-0000-0000-0000-000000000002', 45.0, 9000.00),
('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000005', 100, '10000000-0000-0000-0000-000000000002', 35.0, 3500.00),
('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000006', 100, '10000000-0000-0000-0000-000000000004', 18.0, 1800.00),
('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000007', 20, '10000000-0000-0000-0000-000000000002', 8.0, 160.00)
ON CONFLICT DO NOTHING;

-- Ayam Geprek (10 porsi): Ayam (1500g) + Tepung (500g) + Minyak (500ml) + Garam (30g) + Sub-resep Sambal Bawang (10 porsi)
-- Ayam = 1500 * 38 = 57.000
-- Tepung = 500 * 14 = 7.000
-- Minyak = 500 * 18 = 9.000
-- Garam = 30 * 8 = 240
-- Sambal Bawang (sub-recipe) = 14.460
-- Total HPP = 87.700 / 10 porsi = Rp 8.770/porsi
INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit_id, unit_cost, subtotal_cost) VALUES
('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 1500, '10000000-0000-0000-0000-000000000002', 38.0, 57000.00),
('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 500, '10000000-0000-0000-0000-000000000002', 14.0, 7000.00),
('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000006', 500, '10000000-0000-0000-0000-000000000004', 18.0, 9000.00),
('60000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000007', 30, '10000000-0000-0000-0000-000000000002', 8.0, 240.00)
ON CONFLICT DO NOTHING;

-- Masukkan Sub-Recipe Sambal Bawang ke Ayam Geprek
INSERT INTO recipe_ingredients (id, recipe_id, sub_recipe_id, quantity, unit_id, unit_cost, subtotal_cost) VALUES
('60000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 10, '10000000-0000-0000-0000-000000000005', 1446.0, 14460.00)
ON CONFLICT DO NOTHING;

-- Nasi Putih Pulen: Beras 1500g -> 1500 * 14.5 = Rp 21.750 / 10 porsi = Rp 2.175/porsi
INSERT INTO recipe_ingredients (id, recipe_id, ingredient_id, quantity, unit_id, unit_cost, subtotal_cost) VALUES
('60000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 1500, '10000000-0000-0000-0000-000000000002', 14.5, 21750.00)
ON CONFLICT DO NOTHING;

-- 7. MENU JUAL
-- Menu 1: Ayam Geprek + Nasi (Harga 25.000, HPP 8.770 + 2.175 = 10.945, Food Cost = 43.78%, Margin = 56.22%)
-- Menu 2: Nasi Box Ayam Komplit (Harga 28.000, HPP 11.500)
-- Menu 3: Snack Box (Harga 15.000, HPP 6.000)
INSERT INTO menus (id, code, name, category_id, recipe_id, unit, selling_price, cost_price, food_cost_pct, margin_pct, description, is_active) VALUES
('70000000-0000-0000-0000-000000000001', 'MNU-001', 'Ayam Geprek + Nasi', '20000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000002', 'Porsi', 25000.00, 10945.00, 43.78, 56.22, 'Ayam geprek krispi pedas nikmat disajikan dengan nasi pulen hangat dan lalapan.', true),
('70000000-0000-0000-0000-000000000002', 'MNU-002', 'Nasi Box Ayam Komplit', '20000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000002', 'Box', 28000.00, 11500.00, 41.07, 58.93, 'Paket box premium dengan lauk ayam geprek, tahu tempe, sambal bawang, lalap, dan buah.', true),
('70000000-0000-0000-0000-000000000003', 'MNU-003', 'Snack Box Seminar', '20000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000004', 'Box', 15000.00, 6000.00, 40.00, 60.00, 'Box kudapan berisi 2 macam kue premium (lemper & risoles) plus air mineral mini.', true)
ON CONFLICT DO NOTHING;

-- 8. CONTOH PESANAN CATERING
INSERT INTO orders (id, order_number, customer_id, order_date, event_date, event_time, event_type, event_location, subtotal, discount, additional_cost, total_amount, down_payment, remaining_balance, payment_status, status, notes) VALUES
('80000000-0000-0000-0000-000000000001', 'ORD-202610-001', '30000000-0000-0000-0000-000000000003', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 day', '10:30:00', 'Seminar Sekolah', 'Aula SMAK Mater Dei, Lt. 3', 4300000.00, 100000.00, 50000.00, 4250000.00, 2000000.00, 2250000.00, 'DP Sebagian', 'Diproses', 'Pengiriman sebelum pukul 10:00 WIB tepat waktu'),
('80000000-0000-0000-0000-000000000002', 'ORD-202610-002', '30000000-0000-0000-0000-000000000001', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', '12:00:00', 'Makan Siang Kantor', 'Gedung Wisma Antara Lt. 5, Jakpus', 2500000.00, 0.00, 0.00, 2500000.00, 2500000.00, 0.00, 'Lunas', 'Siap dikirim', 'Pembayaran full lunas via transfer BCA'),
('80000000-0000-0000-0000-000000000003', 'ORD-202610-003', '30000000-0000-0000-0000-000000000002', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 day', '16:00:00', 'Syukuran Ulang Tahun', 'Jl. Harmoni Indah Blok B2', 1500000.00, 0.00, 50000.00, 1550000.00, 0.00, 1550000.00, 'Belum Bayar', 'Menunggu pembayaran', 'Menunggu konfirmasi DP pelanggan')
ON CONFLICT DO NOTHING;

-- ORDER ITEMS
-- Pesanan 1 (SMAK Mater Dei): 100 Nasi Box Ayam Komplit (2.800.000) + 100 Snack Box (1.500.000) = 4.300.000
INSERT INTO order_items (id, order_id, menu_id, quantity, unit_price, subtotal) VALUES
('81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 100, 28000.00, 2800000.00),
('81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', 100, 15000.00, 1500000.00),
-- Pesanan 2 (Budi Santoso): 100 Ayam Geprek + Nasi = 2.500.000
('81000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 100, 25000.00, 2500000.00)
ON CONFLICT DO NOTHING;

-- 9. PRODUKSI TERKAIT PESANAN
INSERT INTO production (id, production_date, order_id, menu_id, portions_needed, status, notes) VALUES
('90000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '2 day', '80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 100, 'Diproses', 'Persiapan bumbu dan ungkep ayam D-1'),
('90000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '2 day', '80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', 100, 'Belum diproses', 'Packing snack box mulai subuh hari H'),
('90000000-0000-0000-0000-000000000003', CURRENT_DATE + INTERVAL '1 day', '80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 100, 'Selesai', 'Selesai dimasak & dikotaki')
ON CONFLICT DO NOTHING;

-- 10. PEMBAYARAN
INSERT INTO payments (id, payment_number, order_id, payment_date, amount, payment_method, payment_type, reference_number, notes) VALUES
('91000000-0000-0000-0000-000000000001', 'PAY-202610-001', '80000000-0000-0000-0000-000000000001', CURRENT_DATE, 2000000.00, 'Transfer', 'DP', 'TRF-BCA-889102', 'Uang muka 50% acara seminar'),
('91000000-0000-0000-0000-000000000002', 'PAY-202610-002', '80000000-0000-0000-0000-000000000002', CURRENT_DATE, 2500000.00, 'Transfer', 'Pelunasan', 'TRF-MANDIRI-44391', 'Pelunasan pesanan kantor')
ON CONFLICT DO NOTHING;

-- 11. PENGIRIMAN
INSERT INTO shipments (id, order_id, delivery_date, delivery_time, courier_name, package_count, destination_address, recipient_phone, status, notes) VALUES
('92000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '2 day', '10:00:00', 'Pak Joko (Driver Internal)', 5, 'Aula SMAK Mater Dei, Lt. 3, Jl. Pendidikan Raya No. 12', '082111223344', 'Belum dikirim', '5 kontainer box catering thermal'),
('92000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '1 day', '11:15:00', 'Pak Rudi (Lalamove)', 3, 'Gedung Wisma Antara Lt. 5, Jakpus', '081234567890', 'Dalam perjalanan', 'Gunakan lift barang saat antar ke lt 5')
ON CONFLICT DO NOTHING;
