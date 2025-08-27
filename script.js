// ===================================================================================
// SECTION 1: GLOBAL STATE MANAGEMENT (ALPINE.JS STORE)
// - State for all modals AND global UI state (like sidebar) is stored here.
// ===================================================================================
document.addEventListener("alpine:init", () => {
  // Store for global UI state
  Alpine.store("app", {
    sidebarOpen: false,
  });

  // Centralized store for all modals, now including all features.
  Alpine.store("modals", {
    po: false,
    receipt: false,
    lotDetail: false,
    workOrder: false,
    shipment: false,
    recipeDetail: false,
    recipeForm: false,
    siklusMenu: false,
    karyawan: false,
    gaji: false,
    deleteConfirm: false,
    // Tambahan untuk master data
    item: false,
    supplier: false,
    school: false,
    user: false,
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // ===================================================================================
  // SECTION 2: CONFIGURATION & CORE DATA
  // - Handles data loading/saving from localStorage and holds all mock data.
  // ===================================================================================

  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  const loadFromLocalStorage = (key, defaultValue) => {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error("Failed to load from localStorage", e);
        return defaultValue;
      }
    }
    saveToLocalStorage(key, defaultValue);
    return defaultValue;
  };

  // --- Master Data ---
  const mockSuppliers = loadFromLocalStorage("sppg_suppliers", [
    { id: 1, name: "PT Sinar Pangan Sejahtera" },
    { id: 2, name: "CV Dapur Nusantara" },
    { id: 3, name: "UD Beras Delanggu Jaya" },
    { id: 4, name: "Mitra Sayur Organik" },
  ]);
  const mockItems = loadFromLocalStorage("sppg_items", [
    { id: 1, name: "Beras Premium", unit: "kg", price: 12000 },
    { id: 2, name: "Daging Ayam Fillet", unit: "kg", price: 45000 },
    { id: 3, name: "Telur Ayam", unit: "kg", price: 25000 },
    { id: 4, name: "Wortel", unit: "kg", price: 8000 },
    { id: 5, name: "Buncis", unit: "kg", price: 10000 },
    { id: 6, name: "Minyak Goreng", unit: "liter", price: 15000 },
  ]);
  const mockDrivers = loadFromLocalStorage("sppg_drivers", [
    { id: 301, name: "Budi Santoso" },
    { id: 302, name: "Agus Wijaya" },
  ]);
  const mockVehicles = loadFromLocalStorage("sppg_vehicles", [
    { id: 401, plate_number: "D 1234 ABC" },
    { id: 402, plate_number: "B 5678 XYZ" },
  ]);
  const mockSchools = loadFromLocalStorage("sppg_schools", [
    { id: 501, name: "SDN Merdeka 1", address: "Jl. Merdeka No. 10" },
    { id: 502, name: "SDN Pelita Harapan", address: "Jl. Pendidikan No. 5" },
    { id: 503, name: "SDN Tunas Bangsa", address: "Jl. Cendekia No. 1" },
  ]);
  const mockUsers = loadFromLocalStorage("sppg_users", [
    { id: 901, name: "Bapak Kepala", role: "Manajer SPPG" },
    { id: 902, name: "Ibu Ani", role: "Operator Sekolah", school_id: 501 },
    { id: 903, name: "Budi Santoso", role: "Driver" },
    { id: 904, name: "Dr. Fitri", role: "Ahli Gizi" },
    { id: 905, name: "Admin Utama", role: "Admin" },
  ]);

  // --- Transactional Data ---
  let purchaseOrders = loadFromLocalStorage("sppg_purchaseOrders", [
    {
      id: 1,
      po_number: "PO-2025-08-001",
      supplier_id: 1,
      order_date: "2025-08-20",
      expected_delivery_date: "2025-08-25",
      status: "Diterima Penuh",
      items: [
        { item_id: 1, quantity: 100, price: 12000, received_qty: 100 },
        { item_id: 2, quantity: 50, price: 45000, received_qty: 50 },
      ],
      total_amount: 3450000,
    },
    {
      id: 2,
      po_number: "PO-2025-08-002",
      supplier_id: 2,
      order_date: "2025-08-21",
      expected_delivery_date: "2025-08-26",
      status: "Disetujui",
      items: [{ item_id: 3, quantity: 20, price: 25000, received_qty: 0 }],
      total_amount: 500000,
    },
    {
      id: 3,
      po_number: "PO-2025-08-003",
      supplier_id: 4,
      order_date: "2025-08-22",
      expected_delivery_date: "2025-08-24",
      status: "Draft",
      items: [
        { item_id: 4, quantity: 30, price: 8000, received_qty: 0 },
        { item_id: 5, quantity: 30, price: 10000, received_qty: 0 },
      ],
      total_amount: 540000,
    },
  ]);
  let inventoryLots = loadFromLocalStorage("sppg_inventoryLots", [
    {
      id: 1,
      item_id: 1,
      quantity: 100,
      lot_number: "BRS-0825A",
      receipt_date: "2025-08-25",
      expiry_date: "2026-08-25",
    },
    {
      id: 2,
      item_id: 2,
      quantity: 50,
      lot_number: "AYM-0825B",
      receipt_date: "2025-08-25",
      expiry_date: "2025-09-01",
    },
  ]);
  let mockRecipes = loadFromLocalStorage("sppg_recipes", [
    {
      id: 101,
      name: "Nasi Ayam Goreng & Tumis Buncis",
      bom: [
        { item_id: 1, quantity_per_portion: 0.15 },
        { item_id: 2, quantity_per_portion: 0.1 },
        { item_id: 5, quantity_per_portion: 0.05 },
      ],
      nutrition: {
        kalori: "550 kcal",
        protein: "25g",
        lemak: "15g",
        karbohidrat: "60g",
      },
    },
    {
      id: 102,
      name: "Bubur Ayam Spesial",
      bom: [
        { item_id: 1, quantity_per_portion: 0.1 },
        { item_id: 2, quantity_per_portion: 0.08 },
      ],
      nutrition: {
        kalori: "400 kcal",
        protein: "20g",
        lemak: "10g",
        karbohidrat: "45g",
      },
    },
  ]);
  let mockSiklusMenu = loadFromLocalStorage(
    "sppg_siklusMenu",
    Array.from({ length: 20 }, (_, i) => ({
      day: i + 1,
      recipe_id: i < 10 ? (i % 2 === 0 ? 101 : 102) : null,
    }))
  );
  let workOrders = loadFromLocalStorage("sppg_workOrders", [
    {
      id: 201,
      wo_number: "WO-20250825-01",
      recipe_id: 101,
      target_quantity: 500,
      production_date: "2025-08-25",
      status: "Selesai",
    },
  ]);
  let shipments = loadFromLocalStorage("sppg_shipments", [
    {
      id: 601,
      shipment_number: "SHP-20250825-01",
      driver_id: 301,
      vehicle_id: 401,
      recipe_id: 101,
      departure_time: "2025-08-25T09:30:00",
      status: "Selesai",
      delivery_lines: [
        { school_id: 501, quantity: 300, status: "Terkirim" },
        { school_id: 502, quantity: 200, status: "Terkirim" },
      ],
    },
    {
      id: 602,
      shipment_number: "SHP-20250825-02",
      driver_id: 302,
      vehicle_id: 402,
      recipe_id: 101,
      departure_time: null,
      status: "Direncanakan",
      delivery_lines: [{ school_id: 503, quantity: 250, status: "Pending" }],
    },
  ]);
  let mockKaryawan = loadFromLocalStorage("sppg_karyawan", [
    {
      id: 1001,
      nama: "Ahmad Subarjo",
      posisi: "Kepala Dapur",
      tgl_bergabung: "2024-01-15",
      status: "Aktif",
    },
    {
      id: 1002,
      nama: "Siti Aminah",
      posisi: "Staf Dapur",
      tgl_bergabung: "2024-02-01",
      status: "Aktif",
    },
    {
      id: 1003,
      nama: "Bambang Pamungkas",
      posisi: "Staf Gudang",
      tgl_bergabung: "2024-01-20",
      status: "Aktif",
    },
    {
      id: 1004,
      nama: "Rina Wati",
      posisi: "Staf Administrasi",
      tgl_bergabung: "2024-03-10",
      status: "Tidak Aktif",
    },
  ]);
  let mockGaji = loadFromLocalStorage("sppg_gaji", [
    {
      id: 2001,
      karyawan_id: 1001,
      periode: "2025-07",
      gaji_pokok: 5000000,
      tunjangan: 500000,
      potongan: 100000,
    },
    {
      id: 2002,
      karyawan_id: 1002,
      periode: "2025-07",
      gaji_pokok: 4000000,
      tunjangan: 300000,
      potongan: 50000,
    },
    {
      id: 2003,
      karyawan_id: 1003,
      periode: "2025-07",
      gaji_pokok: 4200000,
      tunjangan: 350000,
      potongan: 75000,
    },
  ]);
  let mockAbsensi = loadFromLocalStorage("sppg_absensi", {
    "2025-08-25": [
      { karyawan_id: 1001, status: "Hadir" },
      { karyawan_id: 1002, status: "Hadir" },
      { karyawan_id: 1003, status: "Sakit" },
    ],
  });

  // --- Profile Data ---
  let mockProfilYayasan = loadFromLocalStorage("sppg_profilYayasan", {
    nama: "Yayasan Cerdas Bangsa",
    alamat: "Jl. Pendidikan No. 1, Jakarta",
    telp: "021-1234567",
    email: "info@cerdasbangsa.org",
    pimpinan: "Dr. H. Susilo Bambang",
  });
  let mockProfilSPPG = loadFromLocalStorage("sppg_profilSppg", {
    nama: "Dapur Sehat SPPG Jakarta Pusat",
    alamat: "Jl. Kesehatan No. 10, Jakarta",
    telp: "021-7654321",
    email: "sppg.jakpus@cerdasbangsa.org",
    penanggung_jawab: "Ibu Manager",
  });

  // --- Application State ---
  let appState = {
    currentPage: "pelaporan",
    currentUser: { type: "Manajer SPPG", name: "Bapak Kepala" },
    po: { filter: { search: "", status: "all" } },
    receiptFilter: "",
    stockFilter: "",
  };

  // ===================================================================================
  // SECTION 3: HTML TEMPLATES FOR PAGES & MODALS
  // - All dynamic HTML content is defined here as template literals.
  // ===================================================================================
  const resepContentTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Daftar Resep</h3><button onclick="openRecipeModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Tambah Resep</button></div><div id="recipeList" class="space-y-3"></div></div>`;
  const siklusMenuContentTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Siklus Menu (20 Hari)</h3><button id="saveSiklusButton" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">Simpan Siklus</button></div><div id="siklusMenuGrid" class="grid grid-cols-2 md:grid-cols-5 gap-4"></div></div>`;
  const pengadaanPageTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"><div class="w-full md:w-1/3"><input type="text" id="searchInputPO" placeholder="Cari No. PO atau Supplier..." class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></div><div class="flex items-center gap-2 w-full md:w-auto"><select id="statusFilterPO" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="all">Semua Status</option><option value="Draft">Draft</option><option value="Menunggu Persetujuan">Menunggu Persetujuan</option><option value="Disetujui">Disetujui</option><option value="Diterima Sebagian">Diterima Sebagian</option><option value="Diterima Penuh">Diterima Penuh</option><option value="Dibatalkan">Dibatalkan</option></select><button id="createPOButton" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center whitespace-nowrap"><svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Buat PO</button></div></div><div class="overflow-x-auto"><table class="w-full text-sm text-left text-gray-500"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">No. PO</th><th class="px-6 py-3">Supplier</th><th class="px-6 py-3">Tgl Pesan</th><th class="px-6 py-3 text-right">Total</th><th class="px-6 py-3 text-center">Status</th><th class="px-6 py-3 text-center">Aksi</th></tr></thead><tbody id="poTableBody"></tbody></table></div><div id="emptyStatePO" class="hidden text-center py-12"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg><h3 class="mt-2 text-sm font-medium">Tidak ada data PO</h3></div></div>`;
  const penerimaanContentTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><h3 class="text-lg font-semibold mb-4">PO Menunggu Penerimaan</h3><input type="text" id="receiptSearchInput" placeholder="Cari No. PO atau Supplier..." class="w-full md:w-1/3 px-4 py-2 border rounded-lg mb-4"><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">No. PO</th><th class="px-6 py-3">Supplier</th><th class="px-6 py-3">Perkiraan Tiba</th><th class="px-6 py-3 text-center">Status</th><th class="px-6 py-3 text-center">Aksi</th></tr></thead><tbody id="receiptPoTableBody"></tbody></table></div><div id="emptyStateReceipt" class="hidden text-center py-12"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><h3 class="mt-2 text-sm font-medium">Tidak ada PO menunggu penerimaan.</h3></div></div>`;
  const stokContentTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Daftar Stok Inventaris</h3><input type="text" id="stockSearchInput" placeholder="Cari nama item..." class="w-full md:w-1/3 px-4 py-2 border rounded-lg"></div><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">Nama Item</th><th class="px-6 py-3 text-center">Total Stok</th><th class="px-6 py-3">Kedaluwarsa Terdekat</th><th class="px-6 py-3 text-center">Aksi</th></tr></thead><tbody id="stockTableBody"></tbody></table></div><div id="emptyStateStock" class="hidden text-center py-12"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg><h3 class="mt-2 text-sm font-medium">Belum ada stok.</h3></div></div>`;
  const produksiPageTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Perintah Kerja</h3><button onclick="openWorkOrderModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Buat Perintah Kerja</button></div><div id="workOrderList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div><div id="emptyStateWO" class="hidden text-center py-12"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><h3 class="mt-2 text-sm font-medium">Tidak ada perintah kerja.</h3></div></div>`;
  const distribusiPageTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Jadwal Pengiriman</h3><button onclick="openShipmentModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Buat Pengiriman</button></div><div id="shipmentList" class="space-y-4"></div><div id="emptyStateShipment" class="hidden text-center py-12"><svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-9m17.25 9v-9m-17.25-2.25H21" /></svg><h3 class="mt-2 text-sm font-medium">Tidak ada jadwal pengiriman.</h3></div></div>`;
  const keuanganPageTemplate = `<div><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"><div class="bg-white p-5 rounded-lg shadow"><h4 class="text-sm font-medium text-gray-500">Total Biaya Pengadaan</h4><p class="text-3xl font-bold mt-1" id="finance-procurement-cost">Rp 0</p><p class="text-xs text-gray-500 mt-1">PO yang disetujui</p></div><div class="bg-white p-5 rounded-lg shadow"><h4 class="text-sm font-medium text-gray-500">Total Biaya Produksi</h4><p class="text-3xl font-bold mt-1" id="finance-production-cost">Rp 0</p><p class="text-xs text-gray-500 mt-1">Bahan baku hari ini</p></div><div class="bg-white p-5 rounded-lg shadow"><h4 class="text-sm font-medium text-gray-500">Biaya per Porsi</h4><p class="text-3xl font-bold mt-1" id="finance-cost-per-portion">Rp 0</p><p class="text-xs text-gray-500 mt-1">Rata-rata hari ini</p></div></div><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Rincian Transaksi Biaya</h3><div class="overflow-x-auto"><table class="w-full text-sm text-left"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">Tanggal</th><th class="px-6 py-3">Deskripsi</th><th class="px-6 py-3">Tipe</th><th class="px-6 py-3 text-right">Jumlah</th></tr></thead><tbody id="finance-transactions-table"></tbody></table></div></div></div>`;
  const pelaporanPageTemplate = `<div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"><div class="bg-white p-5 rounded-lg shadow"><h4 class="text-sm font-medium text-gray-500">Porsi Terdistribusi</h4><p class="text-3xl font-bold mt-1" id="kpi-total-porsi">0</p><p class="text-xs text-gray-500 mt-1">hari ini</p></div><div class="bg-white p-5 rounded-lg shadow"><h4 class="text-sm font-medium text-gray-500">Kehadiran Karyawan</h4><p class="text-3xl font-bold mt-1" id="kpi-attendance-rate">0%</p><p class="text-xs text-gray-500 mt-1" id="kpi-attendance-detail">0 dari 0 karyawan</p></div><div class="bg-white p-5 rounded-lg shadow"><h4 class="text-sm font-medium text-gray-500">Sekolah Terlayani</h4><p class="text-3xl font-bold mt-1" id="kpi-schools-served">0</p><p class="text-xs text-gray-500 mt-1" id="kpi-schools-total">dari 0 sekolah</p></div><div class="bg-white p-5 rounded-lg shadow"><h4 class="text-sm font-medium text-gray-500">Total Pengadaan</h4><p class="text-3xl font-bold mt-1" id="kpi-total-procurement">Rp 0</p><p class="text-xs text-gray-500 mt-1">bulan ini</p></div></div></div>`;
  const karyawanContentTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Daftar Karyawan</h3><button onclick="openKaryawanModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Tambah Karyawan</button></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">Nama</th><th class="px-6 py-3">Posisi</th><th class="px-6 py-3">Tgl Bergabung</th><th class="px-6 py-3 text-center">Status</th><th class="px-6 py-3 text-center">Aksi</th></tr></thead><tbody id="karyawanTableBody"></tbody></table></div></div>`;
  const gajiContentTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Manajemen Gaji Karyawan</h3><button onclick="openGajiModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>Buat Gaji Baru</button></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">Nama Karyawan</th><th class="px-6 py-3">Periode</th><th class="px-6 py-3 text-right">Gaji Bersih</th><th class="px-6 py-3 text-center">Aksi</th></tr></thead><tbody id="gajiTableBody"></tbody></table></div></div>`;
  const absensiContentTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4"><h3 class="text-lg font-semibold">Absensi Karyawan</h3><div class="flex items-center gap-2"><label for="absensiDate" class="text-sm font-medium">Tanggal:</label><input type="date" id="absensiDate" class="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2"></div></div><div id="absensiList" class="divide-y border rounded-lg"></div><div class="mt-6 flex justify-end"><button id="saveAbsensiButton" class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">Simpan Absensi</button></div></div>`;
  const profilYayasanTemplate = `<div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Profil Yayasan</h3><button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">Edit Profil</button></div><div class="space-y-4"><div><label class="text-sm font-medium text-gray-500">Nama Yayasan</label><p id="yayasan-nama" class="text-gray-800 font-semibold"></p></div><div><label class="text-sm font-medium text-gray-500">Alamat</label><p id="yayasan-alamat" class="text-gray-800"></p></div><div><label class="text-sm font-medium text-gray-500">No. Telepon</label><p id="yayasan-telp" class="text-gray-800"></p></div><div><label class="text-sm font-medium text-gray-500">Email</label><p id="yayasan-email" class="text-gray-800"></p></div><div><label class="text-sm font-medium text-gray-500">Pimpinan</label><p id="yayasan-pimpinan" class="text-gray-800"></p></div></div></div>`;
  const profilSppgTemplate = `<div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Profil SPPG</h3><button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">Edit Profil</button></div><div class="space-y-4"><div><label class="text-sm font-medium text-gray-500">Nama SPPG</label><p id="sppg-nama" class="text-gray-800 font-semibold"></p></div><div><label class="text-sm font-medium text-gray-500">Alamat</label><p id="sppg-alamat" class="text-gray-800"></p></div><div><label class="text-sm font-medium text-gray-500">No. Telepon</label><p id="sppg-telp" class="text-gray-800"></p></div><div><label class="text-sm font-medium text-gray-500">Email</label><p id="sppg-email" class="text-gray-800"></p></div><div><label class="text-sm font-medium text-gray-500">Penanggung Jawab</label><p id="sppg-pj" class="text-gray-800"></p></div></div></div>`;
  const masterDataItemsTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><h3 class="text-lg font-semibold mb-4">Master Data Item</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">ID</th><th class="px-6 py-3">Nama Item</th><th class="px-6 py-3">Unit</th><th class="px-6 py-3 text-right">Harga</th></tr></thead><tbody id="master-items-table"></tbody></table></div></div>`;
  const masterDataSchoolsTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><h3 class="text-lg font-semibold mb-4">Master Data Sekolah</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">ID</th><th class="px-6 py-3">Nama Sekolah</th><th class="px-6 py-3">Alamat</th></tr></thead><tbody id="master-schools-table"></tbody></table></div></div>`;
  const masterDataUsersTemplate = `<div class="bg-white p-6 rounded-lg shadow-md"><h3 class="text-lg font-semibold mb-4">Master Data Pengguna</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-6 py-3">ID</th><th class="px-6 py-3">Nama</th><th class="px-6 py-3">Peran</th></tr></thead><tbody id="master-users-table"></tbody></table></div></div>`;
  // GANTI template lama dengan yang ini
  const masterDataSuppliersTemplate = `
<div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Master Data Supplier</h3>
        <button onclick="openSupplierModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Tambah Supplier
        </button>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                    <th class="px-6 py-3">ID</th>
                    <th class="px-6 py-3">Nama Supplier</th>
                    <th class="px-6 py-3 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody id="master-suppliers-table"></tbody>
        </table>
    </div>
</div>`;

  // The complete HTML for all modals, managed by Alpine.js
  const modalsTemplate = `
        <div x-show="$store.modals.po" @keydown.escape.window="$store.modals.po = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.po = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-y-auto transform"><form id="poForm"><input type="hidden" id="poId"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitlePO"></h3></div><div class="p-6 space-y-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label for="supplier" class="block mb-2 text-sm font-medium">Supplier</label><select id="supplier" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></select></div><div><label for="orderDate" class="block mb-2 text-sm font-medium">Tanggal Pesan</label><input type="date" id="orderDate" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div></div><h4 class="text-lg font-semibold border-t pt-4">Item Pesanan</h4><div id="itemLines" class="space-y-4"></div><button type="button" id="addItemButton" class="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Tambah Item</button><div class="border-t pt-4 flex justify-end"><div class="text-right"><span class="text-sm text-gray-500">Total</span><p id="totalAmount" class="text-2xl font-bold">Rp 0</p></div></div></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.po = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Simpan</button></div></form></div></div>

        <div x-show="$store.modals.receipt" @keydown.escape.window="$store.modals.receipt = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.receipt = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-full overflow-y-auto transform"><form id="receiptForm"><input type="hidden" id="receiptPoId"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="receiptModalTitle"></h3></div><div class="p-6"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-4 py-3">Item</th><th class="px-4 py-3 text-center">Dipesan</th><th class="px-4 py-3 text-center">Diterima Sblmnya</th><th class="px-4 py-3">Jml Diterima</th><th class="px-4 py-3">No. Lot</th><th class="px-4 py-3">Tgl. Kedaluwarsa</th></tr></thead><tbody id="receiptItemLines"></tbody></table></div></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.receipt = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Simpan Penerimaan</button></div></form></div></div>
        
        <div x-show="$store.modals.lotDetail" @keydown.escape.window="$store.modals.lotDetail = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.lotDetail = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto transform"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="lotModalTitle"></h3></div><div class="p-6"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-700 uppercase bg-gray-100"><tr><th class="px-4 py-3">No. Lot</th><th class="px-4 py-3 text-center">Jumlah</th><th class="px-4 py-3">Tgl. Diterima</th><th class="px-4 py-3">Tgl. Kedaluwarsa</th></tr></thead><tbody id="lotDetailTableBody"></tbody></table></div></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.lotDetail = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5">Tutup</button></div></div></div>

        <div x-show="$store.modals.workOrder" @keydown.escape.window="$store.modals.workOrder = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.workOrder = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg transform"><form id="workOrderForm"><input type="hidden" id="workOrderId"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitleWO"></h3></div><div class="p-6 space-y-4"><div><label for="woRecipeId" class="block mb-2 text-sm font-medium">Resep</label><select id="woRecipeId" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></select></div><div><label for="woTargetQuantity" class="block mb-2 text-sm font-medium">Target Kuantitas (Porsi)</label><input type="number" id="woTargetQuantity" min="1" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><div><label for="woProductionDate" class="block mb-2 text-sm font-medium">Tanggal Produksi</label><input type="date" id="woProductionDate" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.workOrder = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Simpan</button></div></form></div></div>
        
        <div x-show="$store.modals.shipment" @keydown.escape.window="$store.modals.shipment = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.shipment = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full overflow-y-auto transform"><form id="shipmentForm"><input type="hidden" id="shipmentId"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitleShipment"></h3></div><div class="p-6 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label for="shipmentDriverId" class="block mb-2 text-sm font-medium">Driver</label><select id="shipmentDriverId" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></select></div><div><label for="shipmentVehicleId" class="block mb-2 text-sm font-medium">Kendaraan</label><select id="shipmentVehicleId" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></select></div></div><div><label for="shipmentRecipeId" class="block mb-2 text-sm font-medium">Menu yang Dikirim</label><select id="shipmentRecipeId" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></select></div><h4 class="text-lg font-semibold border-t pt-4">Tujuan Pengiriman</h4><div id="deliveryLines" class="space-y-3"></div><button type="button" id="addDeliveryLineButton" class="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Tambah Tujuan</button></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.shipment = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Simpan Pengiriman</button></div></form></div></div>

        <div x-show="$store.modals.recipeDetail" @keydown.escape.window="$store.modals.recipeDetail = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.recipeDetail = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto transform"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="recipeDetailModalTitle"></h3></div><div class="p-6"><h4 class="font-semibold text-gray-700 mb-2">Bahan per Porsi</h4><ul id="recipeBomList" class="list-disc list-inside space-y-1 text-gray-600"></ul><h4 class="font-semibold text-gray-700 mt-4 mb-2">Informasi Gizi (per porsi)</h4><div id="recipeNutritionInfo" class="grid grid-cols-2 gap-2 text-sm"></div></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.recipeDetail = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5">Tutup</button></div></div></div>

        <div x-show="$store.modals.recipeForm" @keydown.escape.window="$store.modals.recipeForm = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.recipeForm = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto transform"><form id="recipeForm"><input type="hidden" id="recipeId"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitleRecipe"></h3></div><div class="p-6 space-y-4"><div><label for="recipeName" class="block mb-2 text-sm font-medium">Nama Resep</label><input type="text" id="recipeName" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><h4 class="text-lg font-semibold border-t pt-4">Bahan-bahan (per porsi)</h4><div id="recipeIngredients" class="space-y-3"></div><button type="button" id="addIngredientButton" class="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center"><svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Tambah Bahan</button></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.recipeForm = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Simpan Resep</button></div></form></div></div>

        <div x-show="$store.modals.siklusMenu" @keydown.escape.window="$store.modals.siklusMenu = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.siklusMenu = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md transform"><form id="siklusMenuForm"><input type="hidden" id="siklusDay"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitleSiklus"></h3></div><div class="p-6"><label for="siklusRecipeId" class="block mb-2 text-sm font-medium">Pilih Resep</label><select id="siklusRecipeId" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"></select></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.siklusMenu = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Pilih</button></div></form></div></div>

        <div x-show="$store.modals.karyawan" @keydown.escape.window="$store.modals.karyawan = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.karyawan = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg transform"><form id="karyawanForm"><input type="hidden" id="karyawanId"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitleKaryawan"></h3></div><div class="p-6 space-y-4"><div><label for="karyawanNama" class="block mb-2 text-sm font-medium">Nama Lengkap</label><input type="text" id="karyawanNama" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><div><label for="karyawanPosisi" class="block mb-2 text-sm font-medium">Posisi</label><input type="text" id="karyawanPosisi" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><div><label for="karyawanTglBergabung" class="block mb-2 text-sm font-medium">Tanggal Bergabung</label><input type="date" id="karyawanTglBergabung" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><div><label for="karyawanStatus" class="block mb-2 text-sm font-medium">Status</label><select id="karyawanStatus" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"><option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option></select></div></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.karyawan = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Simpan</button></div></form></div></div>
        
        <div x-show="$store.modals.gaji" @keydown.escape.window="$store.modals.gaji = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.gaji = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg transform"><form id="gajiForm"><input type="hidden" id="gajiId"><div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitleGaji"></h3></div><div class="p-6 space-y-4"><div><label for="gajiKaryawanId" class="block mb-2 text-sm font-medium">Karyawan</label><select id="gajiKaryawanId" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></select></div><div><label for="gajiPeriode" class="block mb-2 text-sm font-medium">Periode</label><input type="month" id="gajiPeriode" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><div><label for="gajiPokok" class="block mb-2 text-sm font-medium">Gaji Pokok</label><input type="number" id="gajiPokok" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><div><label for="gajiTunjangan" class="block mb-2 text-sm font-medium">Tunjangan</label><input type="number" id="gajiTunjangan" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div><div><label for="gajiPotongan" class="block mb-2 text-sm font-medium">Potongan</label><input type="number" id="gajiPotongan" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required></div></div><div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg"><button type="button" @click="$store.modals.gaji = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button><button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Simpan</button></div></form></div></div>
        <div x-show="$store.modals.deleteConfirm" @keydown.escape.window="$store.modals.deleteConfirm = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition><div @click.outside="$store.modals.deleteConfirm = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md transform"><div class="p-6 text-center"><svg class="mx-auto mb-4 text-gray-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg><h3 class="mb-5 text-lg font-normal text-gray-500" id="deleteConfirmMessage"></h3><button id="confirmDeleteButton" class="text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">Ya, Hapus</button><button type="button" @click="$store.modals.deleteConfirm = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5">Batal</button></div></div></div>
<div x-show="$store.modals.supplier" @keydown.escape.window="$store.modals.supplier = false" class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;" x-transition>
    <div @click.outside="$store.modals.supplier = false" class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg transform">
        <form id="supplierForm">
            <input type="hidden" id="supplierId">
            <div class="p-6 border-b"><h3 class="text-xl font-semibold" id="modalTitleSupplier"></h3></div>
            <div class="p-6 space-y-4">
                <div>
                    <label for="supplierName" class="block mb-2 text-sm font-medium">Nama Supplier</label>
                    <input type="text" id="supplierName" class="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" required>
                </div>
            </div>
            <div class="flex items-center justify-end p-6 bg-gray-50 rounded-b-lg">
                <button type="button" @click="$store.modals.supplier = false" class="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 mr-3">Batal</button>
                <button type="submit" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5">Simpan</button>
            </div>
        </form>
    </div>
</div>
        
    `;

  // ===================================================================================
  // SECTION 4: GLOBAL FUNCTIONS & UTILITIES
  // - Helper functions used across multiple parts of the application.
  // ===================================================================================
  const pageContent = document.getElementById("page-content");
  const pageTitle = document.getElementById("page-title");
  const mainNav = document.getElementById("main-nav");
  const modalsContainer = document.getElementById("all-modals");
  const userInfo = document.getElementById("user-info");

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  /**
   * Shows a toast notification.
   * @param {string} message - The message to display.
   * @param {('success'|'error'|'info')} type - The type of toast, for styling.
   */
  window.showToast = (message, type = "success") => {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.remove("bg-green-500", "bg-red-500", "bg-blue-500");

    if (type === "success") toast.classList.add("bg-green-500");
    else if (type === "error") toast.classList.add("bg-red-500");
    else toast.classList.add("bg-blue-500");

    toast.classList.remove("translate-x-[120%]");
    setTimeout(() => {
      toast.classList.add("translate-x-[120%]");
    }, 3000);
  };

  /**
   * Generates a Tailwind CSS badge class for a given status.
   * @param {string} status - The status string.
   * @returns {string} - The HTML span element for the badge.
   */
  window.getStatusBadge = (status) => {
    const statuses = {
      Draft: "bg-gray-100 text-gray-800",
      "Menunggu Persetujuan": "bg-yellow-100 text-yellow-800",
      Disetujui: "bg-orange-100 text-orange-800",
      "Diterima Sebagian": "bg-blue-100 text-blue-800",
      "Diterima Penuh": "bg-indigo-100 text-indigo-800",
      Dibatalkan: "bg-red-100 text-red-800",
      Direncanakan: "bg-gray-100 text-gray-800",
      "Bahan Diminta": "bg-yellow-100 text-yellow-800",
      "Siap Produksi": "bg-blue-100 text-blue-800",
      "Dalam Perjalanan": "bg-cyan-100 text-cyan-800",
      Selesai: "bg-green-100 text-green-800",
      Bermasalah: "bg-red-100 text-red-800",
      Pending: "bg-gray-100 text-gray-800",
      Terkirim: "bg-green-100 text-green-800",
      Investigasi: "bg-blue-100 text-blue-800",
      Produksi: "bg-indigo-100 text-indigo-800",
      Pengadaan: "bg-orange-100 text-orange-800",
      Aktif: "bg-green-100 text-green-800",
      "Tidak Aktif": "bg-red-100 text-red-800",
      Hadir: "bg-green-100 text-green-800",
      Sakit: "bg-yellow-100 text-yellow-800",
      Izin: "bg-blue-100 text-blue-800",
      Alpa: "bg-gray-100 text-gray-800",
    };
    return `<span class="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
      statuses[status] || "bg-gray-200"
    }">${status}</span>`;
  };

  /**
   * Generates HTML <option> elements for a <select> dropdown.
   * @param {Array<Object>} data - The array of objects to map.
   * @param {string} valueKey - The key for the option value.
   * @param {string} textKey - The key for the option text.
   * @returns {string} - The HTML string of options.
   */
  const generateSelectOptions = (data, valueKey, textKey) => {
    return data
      .map(
        (item) => `<option value="${item[valueKey]}">${item[textKey]}</option>`
      )
      .join("");
  };

  // ===================================================================================
  // SECTION 5: PAGE SETUP FUNCTIONS
  // - Each function is called by `renderPage` to set up event listeners
  //   and render the initial content for that specific page.
  // ===================================================================================

  function setupResepPage() {
    renderRecipeList();
  }
  function setupSiklusMenuPage() {
    renderSiklusMenuGrid();
    document
      .getElementById("saveSiklusButton")
      .addEventListener("click", () => {
        saveToLocalStorage("sppg_siklusMenu", mockSiklusMenu);
        showToast("Siklus menu berhasil disimpan.", "success");
      });
  }
  function setupPengadaanPage() {
    renderPOTable();
    document.getElementById("searchInputPO").addEventListener("input", (e) => {
      appState.po.filter.search = e.target.value;
      renderPOTable();
    });
    document
      .getElementById("statusFilterPO")
      .addEventListener("change", (e) => {
        appState.po.filter.status = e.target.value;
        renderPOTable();
      });
    document
      .getElementById("createPOButton")
      .addEventListener("click", () => openPOModal());
  }
  function setupPenerimaanPage() {
    renderReceiptPOTable();
    document
      .getElementById("receiptSearchInput")
      .addEventListener("input", (e) => {
        appState.receiptFilter = e.target.value;
        renderReceiptPOTable();
      });
  }
  function setupStokPage() {
    renderStockTable();
    document
      .getElementById("stockSearchInput")
      .addEventListener("input", (e) => {
        appState.stockFilter = e.target.value;
        renderStockTable();
      });
  }
  function setupProduksiPage() {
    renderWorkOrderList();
  }
  function setupDistribusiPage() {
    renderShipmentList();
  }
  function setupKaryawanPage() {
    renderKaryawanTable();
  }
  function setupGajiPage() {
    renderGajiTable();
  }
  function setupAbsensiPage() {
    const dateInput = document.getElementById("absensiDate");
    dateInput.value = new Date().toISOString().split("T")[0];
    renderAbsensiList(dateInput.value);
    dateInput.addEventListener("change", (e) =>
      renderAbsensiList(e.target.value)
    );
    document
      .getElementById("saveAbsensiButton")
      .addEventListener("click", handleSaveAbsensi);
  }
  function setupProfilYayasanPage() {
    document.getElementById("yayasan-nama").textContent =
      mockProfilYayasan.nama;
    document.getElementById("yayasan-alamat").textContent =
      mockProfilYayasan.alamat;
    document.getElementById("yayasan-telp").textContent =
      mockProfilYayasan.telp;
    document.getElementById("yayasan-email").textContent =
      mockProfilYayasan.email;
    document.getElementById("yayasan-pimpinan").textContent =
      mockProfilYayasan.pimpinan;
  }
  function setupProfilSppgPage() {
    document.getElementById("sppg-nama").textContent = mockProfilSPPG.nama;
    document.getElementById("sppg-alamat").textContent = mockProfilSPPG.alamat;
    document.getElementById("sppg-telp").textContent = mockProfilSPPG.telp;
    document.getElementById("sppg-email").textContent = mockProfilSPPG.email;
    document.getElementById("sppg-pj").textContent =
      mockProfilSPPG.penanggung_jawab;
  }
  function setupMasterDataItemsPage() {
    document.getElementById("master-items-table").innerHTML = mockItems
      .map(
        (item) => `
            <tr class="bg-white border-b"><td class="px-6 py-4">${
              item.id
            }</td><td class="px-6 py-4 font-medium">${
          item.name
        }</td><td class="px-6 py-4">${
          item.unit
        }</td><td class="px-6 py-4 text-right">${formatCurrency(
          item.price
        )}</td></tr>
        `
      )
      .join("");
  }
  function setupMasterDataSuppliersPage() {
    document.getElementById("master-suppliers-table").innerHTML = mockSuppliers
      .map(
        (s) => `
            <tr class="bg-white border-b"><td class="px-6 py-4">${s.id}</td><td class="px-6 py-4 font-medium">${s.name}</td></tr>
        `
      )
      .join("");
  }
  function setupMasterDataSchoolsPage() {
    document.getElementById("master-schools-table").innerHTML = mockSchools
      .map(
        (s) => `
            <tr class="bg-white border-b"><td class="px-6 py-4">${s.id}</td><td class="px-6 py-4 font-medium">${s.name}</td><td class="px-6 py-4">${s.address}</td></tr>
        `
      )
      .join("");
  }
  function setupMasterDataUsersPage() {
    document.getElementById("master-users-table").innerHTML = mockUsers
      .map(
        (u) => `
            <tr class="bg-white border-b"><td class="px-6 py-4">${u.id}</td><td class="px-6 py-4 font-medium">${u.name}</td><td class="px-6 py-4">${u.role}</td></tr>
        `
      )
      .join("");
  }
  function renderMasterDataSuppliersTable() {
    const tableBody = document.getElementById("master-suppliers-table");
    tableBody.innerHTML = mockSuppliers
      .map(
        (s) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4">${s.id}</td>
            <td class="px-6 py-4 font-medium">${s.name}</td>
            <td class="px-6 py-4 text-center space-x-2">
                <button onclick="openSupplierModal(${
                  s.id
                })" class="text-blue-600 hover:underline font-medium text-sm">Edit</button>
                <button onclick="openDeleteModal('supplier', ${
                  s.id
                }, '${s.name.replace(
          /'/g,
          "\\'"
        )}')" class="text-red-600 hover:underline font-medium text-sm">Hapus</button>
            </td>
        </tr>
    `
      )
      .join("");
  }

  function setupKeuanganPage() {
    const totalProcurement = purchaseOrders
      .filter((p) => p.status !== "Draft" && p.status !== "Dibatalkan")
      .reduce((sum, p) => sum + p.total_amount, 0);
    let totalProductionCost = 0;
    let totalPortionsProduced = 0;
    const transactions = [];
    workOrders.forEach((wo) => {
      const recipe = mockRecipes.find((r) => r.id === wo.recipe_id);
      if (recipe) {
        let woCost = recipe.bom.reduce((sum, ing) => {
          const item = mockItems.find((i) => i.id === ing.item_id);
          return (
            sum +
            ing.quantity_per_portion *
              wo.target_quantity *
              (item ? item.price : 0)
          );
        }, 0);
        totalProductionCost += woCost;
        totalPortionsProduced += wo.target_quantity;
        transactions.push({
          date: wo.production_date,
          desc: `Biaya Produksi ${wo.wo_number}`,
          type: "Produksi",
          amount: woCost,
        });
      }
    });
    purchaseOrders
      .filter((p) => p.status !== "Draft" && p.status !== "Dibatalkan")
      .forEach((po) => {
        transactions.push({
          date: po.order_date,
          desc: `Biaya Pengadaan ${po.po_number}`,
          type: "Pengadaan",
          amount: po.total_amount,
        });
      });
    const costPerPortion =
      totalPortionsProduced > 0
        ? totalProductionCost / totalPortionsProduced
        : 0;
    document.getElementById("finance-procurement-cost").textContent =
      formatCurrency(totalProcurement);
    document.getElementById("finance-production-cost").textContent =
      formatCurrency(totalProductionCost);
    document.getElementById("finance-cost-per-portion").textContent =
      formatCurrency(costPerPortion);
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById("finance-transactions-table").innerHTML =
      transactions
        .map(
          (t) => `
            <tr class="bg-white border-b"><td class="px-6 py-4">${formatDate(
              t.date
            )}</td><td class="px-6 py-4 font-medium">${
            t.desc
          }</td><td class="px-6 py-4">${getStatusBadge(
            t.type
          )}</td><td class="px-6 py-4 text-right font-mono">${formatCurrency(
            t.amount
          )}</td></tr>
        `
        )
        .join("");
  }
  function setupPelaporanPage() {
    const today = new Date().toISOString().split("T")[0];
    const totalPortions = shipments
      .filter(
        (s) => s.status === "Selesai" && s.departure_time?.startsWith(today)
      )
      .flatMap((s) => s.delivery_lines)
      .filter((l) => l.status === "Terkirim")
      .reduce((sum, l) => sum + l.quantity, 0);
    document.getElementById("kpi-total-porsi").textContent =
      totalPortions.toLocaleString("id-ID");

    const attendedKaryawan = (mockAbsensi[today] || []).filter(
      (a) => a.status === "Hadir"
    ).length;
    const totalKaryawan = mockKaryawan.filter(
      (k) => k.status === "Aktif"
    ).length;
    const attendanceRate =
      totalKaryawan > 0
        ? ((attendedKaryawan / totalKaryawan) * 100).toFixed(0)
        : 0;
    document.getElementById(
      "kpi-attendance-rate"
    ).textContent = `${attendanceRate}%`;
    document.getElementById(
      "kpi-attendance-detail"
    ).textContent = `${attendedKaryawan} dari ${totalKaryawan} karyawan`;

    const servedSchools = new Set(
      shipments
        .filter(
          (s) => s.status === "Selesai" && s.departure_time?.startsWith(today)
        )
        .flatMap((s) => s.delivery_lines.map((l) => l.school_id))
    ).size;
    document.getElementById("kpi-schools-served").textContent = servedSchools;
    document.getElementById(
      "kpi-schools-total"
    ).textContent = `dari ${mockSchools.length} sekolah`;

    const currentMonth = today.substring(0, 7);
    const totalProcurement = purchaseOrders
      .filter(
        (p) =>
          p.status !== "Dibatalkan" && p.order_date.startsWith(currentMonth)
      )
      .reduce((sum, p) => sum + p.total_amount, 0);
    document.getElementById("kpi-total-procurement").textContent =
      formatCurrency(totalProcurement);
  }

  function setupMasterDataItemsPage() {
    renderMasterDataItemsTable();
  }
  function renderMasterDataItemsTable() {
    const tableBody = document.getElementById("master-items-table");
    tableBody.innerHTML = mockItems
      .map(
        (item) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4">${
              item.id
            }</td><td class="px-6 py-4 font-medium">${
          item.name
        }</td><td class="px-6 py-4">${
          item.unit
        }</td><td class="px-6 py-4 text-right">${formatCurrency(
          item.price
        )}</td>
            <td class="px-6 py-4 text-center space-x-2"><button onclick="openItemModal(${
              item.id
            })" class="text-blue-600 hover:underline font-medium text-sm">Edit</button><button onclick="openDeleteModal('item', ${
          item.id
        }, '${item.name.replace(
          /'/g,
          "\\'"
        )}')" class="text-red-600 hover:underline font-medium text-sm">Hapus</button></td>
        </tr>`
      )
      .join("");
  }
  window.openItemModal = function (id = null) {
    document.getElementById("itemForm").reset();
    document.getElementById("itemId").value = "";
    if (id) {
      const item = mockItems.find((i) => i.id === id);
      document.getElementById("modalTitleItem").textContent = "Edit Item";
      document.getElementById("itemId").value = item.id;
      document.getElementById("itemName").value = item.name;
      document.getElementById("itemUnit").value = item.unit;
      document.getElementById("itemPrice").value = item.price;
    } else {
      document.getElementById("modalTitleItem").textContent =
        "Tambah Item Baru";
    }
    Alpine.store("modals").item = true;
  };
  function handleItemFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("itemId").value;
    const itemData = {
      name: document.getElementById("itemName").value.trim(),
      unit: document.getElementById("itemUnit").value.trim(),
      price: parseInt(document.getElementById("itemPrice").value),
    };
    if (!itemData.name || !itemData.unit || isNaN(itemData.price)) {
      showToast("Semua field harus diisi dengan benar.", "error");
      return;
    }
    if (id) {
      const index = mockItems.findIndex((i) => i.id == id);
      mockItems[index] = { ...mockItems[index], ...itemData };
      showToast("Data item berhasil diperbarui.", "success");
    } else {
      const newId =
        mockItems.length > 0 ? Math.max(...mockItems.map((i) => i.id)) + 1 : 1;
      mockItems.push({ id: newId, ...itemData });
      showToast("Item baru berhasil ditambahkan.", "success");
    }
    saveToLocalStorage("sppg_items", mockItems);
    Alpine.store("modals").item = false;
    renderMasterDataItemsTable();
  }

  // --- Suppliers ---
  function setupMasterDataSuppliersPage() {
    renderMasterDataSuppliersTable();
  }
  function renderMasterDataSuppliersTable() {
    /* (Sudah dibuat di Langkah 1) */
  }
  window.openSupplierModal = function (id = null) {
    /* (Sudah dibuat di Langkah 1) */
  };
  function handleSupplierFormSubmit(e) {
    /* (Sudah dibuat di Langkah 1) */
  }

  // --- Schools ---
  function setupMasterDataSchoolsPage() {
    renderMasterDataSchoolsTable();
  }
  function renderMasterDataSchoolsTable() {
    const tableBody = document.getElementById("master-schools-table");
    tableBody.innerHTML = mockSchools
      .map(
        (s) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4">${
              s.id
            }</td><td class="px-6 py-4 font-medium">${
          s.name
        }</td><td class="px-6 py-4">${s.address}</td>
            <td class="px-6 py-4 text-center space-x-2"><button onclick="openSchoolModal(${
              s.id
            })" class="text-blue-600 hover:underline font-medium text-sm">Edit</button><button onclick="openDeleteModal('school', ${
          s.id
        }, '${s.name.replace(
          /'/g,
          "\\'"
        )}')" class="text-red-600 hover:underline font-medium text-sm">Hapus</button></td>
        </tr>`
      )
      .join("");
  }
  window.openSchoolModal = function (id = null) {
    document.getElementById("schoolForm").reset();
    document.getElementById("schoolId").value = "";
    if (id) {
      const school = mockSchools.find((s) => s.id === id);
      document.getElementById("modalTitleSchool").textContent = "Edit Sekolah";
      document.getElementById("schoolId").value = school.id;
      document.getElementById("schoolName").value = school.name;
      document.getElementById("schoolAddress").value = school.address;
    } else {
      document.getElementById("modalTitleSchool").textContent =
        "Tambah Sekolah Baru";
    }
    Alpine.store("modals").school = true;
  };
  function handleSchoolFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("schoolId").value;
    const schoolData = {
      name: document.getElementById("schoolName").value.trim(),
      address: document.getElementById("schoolAddress").value.trim(),
    };
    if (!schoolData.name || !schoolData.address) {
      showToast("Nama dan alamat sekolah harus diisi.", "error");
      return;
    }
    if (id) {
      const index = mockSchools.findIndex((s) => s.id == id);
      mockSchools[index] = { ...mockSchools[index], ...schoolData };
      showToast("Data sekolah berhasil diperbarui.", "success");
    } else {
      const newId =
        mockSchools.length > 0
          ? Math.max(...mockSchools.map((s) => s.id)) + 1
          : 501;
      mockSchools.push({ id: newId, ...schoolData });
      showToast("Sekolah baru berhasil ditambahkan.", "success");
    }
    saveToLocalStorage("sppg_schools", mockSchools);
    Alpine.store("modals").school = false;
    renderMasterDataSchoolsTable();
  }

  // --- Users ---
  function setupMasterDataUsersPage() {
    renderMasterDataUsersTable();
  }
  function renderMasterDataUsersTable() {
    const tableBody = document.getElementById("master-users-table");
    tableBody.innerHTML = mockUsers
      .map(
        (u) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4">${
              u.id
            }</td><td class="px-6 py-4 font-medium">${
          u.name
        }</td><td class="px-6 py-4">${u.role}</td>
            <td class="px-6 py-4 text-center space-x-2"><button onclick="openUserModal(${
              u.id
            })" class="text-blue-600 hover:underline font-medium text-sm">Edit</button><button onclick="openDeleteModal('user', ${
          u.id
        }, '${u.name.replace(
          /'/g,
          "\\'"
        )}')" class="text-red-600 hover:underline font-medium text-sm">Hapus</button></td>
        </tr>`
      )
      .join("");
  }
  window.openUserModal = function (id = null) {
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
    if (id) {
      const user = mockUsers.find((u) => u.id === id);
      document.getElementById("modalTitleUser").textContent = "Edit Pengguna";
      document.getElementById("userId").value = user.id;
      document.getElementById("userName").value = user.name;
      document.getElementById("userRole").value = user.role;
    } else {
      document.getElementById("modalTitleUser").textContent =
        "Tambah Pengguna Baru";
    }
    Alpine.store("modals").user = true;
  };
  function handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("userId").value;
    const userData = {
      name: document.getElementById("userName").value.trim(),
      role: document.getElementById("userRole").value,
    };
    if (!userData.name) {
      showToast("Nama pengguna harus diisi.", "error");
      return;
    }
    if (id) {
      const index = mockUsers.findIndex((u) => u.id == id);
      mockUsers[index] = { ...mockUsers[index], ...userData };
      showToast("Data pengguna berhasil diperbarui.", "success");
    } else {
      const newId =
        mockUsers.length > 0
          ? Math.max(...mockUsers.map((u) => u.id)) + 1
          : 901;
      mockUsers.push({ id: newId, ...userData });
      showToast("Pengguna baru berhasil ditambahkan.", "success");
    }
    saveToLocalStorage("sppg_users", mockUsers);
    Alpine.store("modals").user = false;
    renderMasterDataUsersTable();
  }


  // ===================================================================================
  // SECTION 6: CONTENT RENDERING FUNCTIONS
  // - Functions responsible for displaying data in HTML (rendering tables, lists, etc.).
  // ===================================================================================
  function renderRecipeList() {
    const listContainer = document.getElementById("recipeList");
    listContainer.innerHTML = mockRecipes
      .map(
        (recipe) => `
            <div class="bg-gray-50 border rounded-lg p-4 flex justify-between items-center">
                <div><p class="font-semibold text-gray-800">${
                  recipe.name
                }</p><p class="text-sm text-gray-500">${
          recipe.bom.length
        } bahan</p></div>
                <div class="space-x-2"><button onclick="openRecipeDetailModal(${
                  recipe.id
                })" class="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 font-semibold text-sm">Lihat Detail</button><button onclick="openRecipeModal(${
          recipe.id
        })" class="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 font-semibold text-sm">Edit</button><button onclick="openDeleteModal('resep', ${
          recipe.id
        }, '${recipe.name.replace(
          /'/g,
          "\\'"
        )}')" class="bg-red-50 border-red-200 text-red-700 px-3 py-1 rounded-lg hover:bg-red-100 font-semibold text-sm">Hapus</button></div>
            </div>
        `
      )
      .join("");
  }
  function renderSiklusMenuGrid() {
    const gridContainer = document.getElementById("siklusMenuGrid");
    gridContainer.innerHTML = mockSiklusMenu
      .map((item) => {
        const recipe = mockRecipes.find((r) => r.id === item.recipe_id);
        return `<div onclick="openSiklusMenuModal(${
          item.day
        })" class="border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-blue-500 transition"><p class="font-bold text-lg text-gray-700">Hari ke-${
          item.day
        }</p><div class="mt-2 h-16">${
          recipe
            ? `<p class="text-sm font-semibold text-blue-600">${recipe.name}</p>`
            : `<p class="text-sm text-gray-400">Belum diatur</p>`
        }</div></div>`;
      })
      .join("");
  }
  function renderPOTable() {
    const { search, status } = appState.po.filter;
    const filteredPOs = purchaseOrders.filter(
      (po) =>
        (po.po_number.toLowerCase().includes(search.toLowerCase()) ||
          mockSuppliers
            .find((s) => s.id === po.supplier_id)
            ?.name.toLowerCase()
            .includes(search.toLowerCase())) &&
        (status === "all" || po.status === status)
    );
    const tableBody = document.getElementById("poTableBody");
    tableBody.innerHTML = filteredPOs
      .map((po) => {
        const supplier = mockSuppliers.find((s) => s.id === po.supplier_id);
        return `<tr class="bg-white border-b hover:bg-gray-50"><td class="px-6 py-4 font-medium text-gray-900">${
          po.po_number
        }</td><td class="px-6 py-4">${
          supplier?.name || "N/A"
        }</td><td class="px-6 py-4">${formatDate(
          po.order_date
        )}</td><td class="px-6 py-4 text-right font-medium">${formatCurrency(
          po.total_amount
        )}</td><td class="px-6 py-4 text-center">${getStatusBadge(
          po.status
        )}</td><td class="px-6 py-4 text-center space-x-2"><button class="text-blue-600 hover:underline" onclick="openPOModal(${
          po.id
        })">Edit</button>${
          po.status === "Draft"
            ? `<button class="text-red-600 hover:underline" onclick="openDeleteModal('po', ${po.id}, '${po.po_number}')">Hapus</button>`
            : ""
        }</td></tr>`;
      })
      .join("");
    document
      .getElementById("emptyStatePO")
      .classList.toggle("hidden", filteredPOs.length > 0);
  }
  function renderReceiptPOTable() {
    const filter = (appState.receiptFilter || "").toLowerCase();
    const poToReceive = purchaseOrders.filter(
      (po) =>
        (po.status === "Disetujui" || po.status === "Diterima Sebagian") &&
        (po.po_number.toLowerCase().includes(filter) ||
          mockSuppliers
            .find((s) => s.id === po.supplier_id)
            ?.name.toLowerCase()
            .includes(filter))
    );
    const tableBody = document.getElementById("receiptPoTableBody");
    tableBody.innerHTML = poToReceive
      .map((po) => {
        const supplier = mockSuppliers.find((s) => s.id === po.supplier_id);
        return `<tr class="bg-white border-b hover:bg-gray-50"><td class="px-6 py-4 font-medium">${
          po.po_number
        }</td><td>${supplier?.name}</td><td>${formatDate(
          po.expected_delivery_date
        )}</td><td class="text-center">${getStatusBadge(
          po.status
        )}</td><td class="text-center"><button onclick="openReceiptModal(${
          po.id
        })" class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm">Terima Barang</button></td></tr>`;
      })
      .join("");
    document
      .getElementById("emptyStateReceipt")
      .classList.toggle("hidden", poToReceive.length > 0);
  }
  function renderStockTable() {
    const filter = (appState.stockFilter || "").toLowerCase();
    const aggregatedStock = mockItems
      .map((item) => {
        const lots = inventoryLots.filter((l) => l.item_id === item.id);
        const totalQuantity = lots.reduce((sum, l) => sum + l.quantity, 0);
        const nearestExpiry =
          lots.length > 0
            ? lots.reduce((earliest, current) =>
                new Date(earliest.expiry_date) < new Date(current.expiry_date)
                  ? earliest
                  : current
              ).expiry_date
            : null;
        return { ...item, totalQuantity, nearestExpiry };
      })
      .filter(
        (item) =>
          item.totalQuantity > 0 && item.name.toLowerCase().includes(filter)
      );
    const tableBody = document.getElementById("stockTableBody");
    tableBody.innerHTML = aggregatedStock
      .map(
        (item) => `
            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-6 py-4 font-medium">${
              item.name
            }</td><td class="text-center font-semibold">${item.totalQuantity.toLocaleString(
          "id-ID"
        )} ${item.unit}</td><td class="px-6 py-4">${
          item.nearestExpiry ? formatDate(item.nearestExpiry) : "N/A"
        }</td><td class="text-center"><button onclick="openLotDetailModal(${
          item.id
        })" class="text-blue-600 hover:underline text-sm">Lihat Lot</button></td></tr>
        `
      )
      .join("");
    document
      .getElementById("emptyStateStock")
      .classList.toggle("hidden", aggregatedStock.length > 0);
  }
  function renderWorkOrderList() {
    const listEl = document.getElementById("workOrderList");
    listEl.innerHTML = workOrders
      .map((wo) => {
        const recipe = mockRecipes.find((r) => r.id === wo.recipe_id);
        return `<div class="bg-white border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"><div><div class="flex justify-between items-start"><p class="font-semibold">${
          recipe?.name || "Resep tidak ada"
        }</p>${getStatusBadge(
          wo.status
        )}</div><p class="text-sm text-gray-500">${wo.wo_number} (${formatDate(
          wo.production_date
        )})</p></div><div class="mt-4 flex justify-between items-end"><div><p class="text-xs">Target</p><p class="text-xl font-bold text-blue-600">${wo.target_quantity.toLocaleString(
          "id-ID"
        )} Porsi</p></div><div class="space-x-2"><button onclick="openWorkOrderModal(${
          wo.id
        })" class="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 font-semibold text-sm">Edit</button><button onclick="openDeleteModal('produksi', ${
          wo.id
        }, '${
          wo.wo_number
        }')" class="bg-red-50 border-red-200 text-red-700 px-3 py-1 rounded-lg hover:bg-red-100 font-semibold text-sm">Hapus</button></div></div></div>`;
      })
      .join("");
    document
      .getElementById("emptyStateWO")
      .classList.toggle("hidden", workOrders.length > 0);
  }
  function renderShipmentList() {
    const listEl = document.getElementById("shipmentList");
    listEl.innerHTML = shipments
      .map((shipment) => {
        const driver = mockDrivers.find((d) => d.id === shipment.driver_id);
        return `<div class="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md"><div class="flex justify-between items-start"><div><p class="font-semibold">${
          shipment.shipment_number
        }</p><p class="text-sm text-gray-500">Driver: ${
          driver?.name || "N/A"
        }</p></div>${getStatusBadge(
          shipment.status
        )}</div><div class="mt-4 flex justify-between items-center"><p class="text-sm">${
          shipment.delivery_lines.length
        } tujuan</p><div class="space-x-2"><button onclick="openShipmentModal(${
          shipment.id
        })" class="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 font-semibold text-sm">Edit</button><button onclick="openDeleteModal('distribusi', ${
          shipment.id
        }, '${
          shipment.shipment_number
        }')" class="bg-red-50 border-red-200 text-red-700 px-3 py-1 rounded-lg hover:bg-red-100 font-semibold text-sm">Hapus</button></div></div></div>`;
      })
      .join("");
    document
      .getElementById("emptyStateShipment")
      .classList.toggle("hidden", shipments.length > 0);
  }
  function renderKaryawanTable() {
    const tableBody = document.getElementById("karyawanTableBody");
    tableBody.innerHTML = mockKaryawan
      .map(
        (k) => `
            <tr class="bg-white border-b hover:bg-gray-50"><td class="px-6 py-4 font-medium">${
              k.nama
            }</td><td class="px-6 py-4">${
          k.posisi
        }</td><td class="px-6 py-4">${formatDate(
          k.tgl_bergabung
        )}</td><td class="px-6 py-4 text-center">${getStatusBadge(
          k.status
        )}</td><td class="px-6 py-4 text-center space-x-4"><button onclick="openKaryawanModal(${
          k.id
        })" class="text-blue-600 hover:underline font-medium">Edit</button><button onclick="openDeleteModal('karyawan', ${
          k.id
        }, '${k.nama.replace(
          /'/g,
          "\\'"
        )}')" class="text-red-600 hover:underline font-medium">Hapus</button></td></tr>
        `
      )
      .join("");
  }
  function renderGajiTable() {
    const tableBody = document.getElementById("gajiTableBody");
    tableBody.innerHTML = mockGaji
      .map((g) => {
        const karyawan = mockKaryawan.find((k) => k.id === g.karyawan_id);
        const gajiBersih = g.gaji_pokok + g.tunjangan - g.potongan;
        const periode = new Date(g.periode + "-02").toLocaleDateString(
          "id-ID",
          { month: "long", year: "numeric" }
        );
        return `<tr class="bg-white border-b hover:bg-gray-50"><td class="px-6 py-4 font-medium">${
          karyawan?.nama || "N/A"
        }</td><td class="px-6 py-4">${periode}</td><td class="px-6 py-4 text-right font-semibold">${formatCurrency(
          gajiBersih
        )}</td><td class="px-6 py-4 text-center space-x-4"><button onclick="openGajiModal(${
          g.id
        })" class="text-blue-600 hover:underline font-medium">Edit</button><button onclick="openDeleteModal('gaji', ${
          g.id
        }, 'Gaji ${karyawan?.nama.replace(
          /'/g,
          "\\'"
        )} periode ${periode}')" class="text-red-600 hover:underline font-medium">Hapus</button></td></tr>`;
      })
      .join("");
  }
  function renderAbsensiList(tanggal) {
    const listContainer = document.getElementById("absensiList");
    const absensiHariIni = mockAbsensi[tanggal] || [];
    const karyawanAktif = mockKaryawan.filter((k) => k.status === "Aktif");
    listContainer.innerHTML = karyawanAktif
      .map((karyawan) => {
        const absensi = absensiHariIni.find(
          (a) => a.karyawan_id === karyawan.id
        );
        const status = absensi ? absensi.status : "Alpa";
        return `<div class="flex justify-between items-center p-4"><div><p class="font-medium">${
          karyawan.nama
        }</p><p class="text-sm text-gray-500">${
          karyawan.posisi
        }</p></div><div class="flex items-center gap-2"><select data-karyawan-id="${
          karyawan.id
        }" class="absensi-status-select bg-gray-50 border border-gray-300 text-sm rounded-lg p-2"><option value="Hadir" ${
          status === "Hadir" ? "selected" : ""
        }>Hadir</option><option value="Sakit" ${
          status === "Sakit" ? "selected" : ""
        }>Sakit</option><option value="Izin" ${
          status === "Izin" ? "selected" : ""
        }>Izin</option><option value="Alpa" ${
          status === "Alpa" ? "selected" : ""
        }>Alpa</option></select></div></div>`;
      })
      .join("");
  }

  // ===================================================================================
  // SECTION 7: USER ACTION HANDLERS (MODALS, FORMS, DELETES)
  // - All modal functions now interact with the Alpine.js store.
  // ===================================================================================

  // --- 7.1: Modal Openers ---

  window.openPOModal = function (poId = null) {
    const form = document.getElementById("poForm");
    form.reset();
    document.getElementById("poId").value = "";
    document.getElementById("itemLines").innerHTML = "";
    document.getElementById("supplier").innerHTML = generateSelectOptions(
      mockSuppliers,
      "id",
      "name"
    );
    if (poId) {
      const po = purchaseOrders.find((p) => p.id === poId);
      document.getElementById(
        "modalTitlePO"
      ).textContent = `Edit PO ${po.po_number}`;
      document.getElementById("poId").value = po.id;
      document.getElementById("supplier").value = po.supplier_id;
      document.getElementById("orderDate").value = po.order_date;
      po.items.forEach((item) => addPOItemLine(item));
    } else {
      document.getElementById("modalTitlePO").textContent =
        "Buat Pesanan Pembelian Baru";
      document.getElementById("orderDate").value = new Date()
        .toISOString()
        .split("T")[0];
      addPOItemLine();
    }
    updatePOTotalAmount();
    Alpine.store("modals").po = true;
  };

  window.openSupplierModal = function (id = null) {
    const form = document.getElementById("supplierForm");
    form.reset();
    document.getElementById("supplierId").value = "";

    if (id) {
      const supplier = mockSuppliers.find((s) => s.id === id);
      document.getElementById("modalTitleSupplier").textContent =
        "Edit Supplier";
      document.getElementById("supplierId").value = supplier.id;
      document.getElementById("supplierName").value = supplier.name;
    } else {
      document.getElementById("modalTitleSupplier").textContent =
        "Tambah Supplier Baru";
    }
    Alpine.store("modals").supplier = true;
  };

  window.openReceiptModal = function (poId) {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;
    document.getElementById("receiptPoId").value = poId;
    document.getElementById(
      "receiptModalTitle"
    ).textContent = `Penerimaan Barang untuk PO: ${po.po_number}`;
    const container = document.getElementById("receiptItemLines");
    container.innerHTML = po.items
      .map((item) => {
        const masterItem = mockItems.find((i) => i.id === item.item_id);
        const remainingQty = item.quantity - (item.received_qty || 0);
        if (remainingQty <= 0) return ""; // Don't show fully received items
        return `<tr class="receipt-item-row bg-white border-b"><td class="px-4 py-3 font-medium">${
          masterItem.name
        }</td><td class="text-center">${
          item.quantity
        }</td><td class="text-center">${
          item.received_qty || 0
        }</td><td><input type="number" data-item-id="${
          item.item_id
        }" class="received-qty-input bg-gray-50 border rounded-lg w-24 p-2" max="${remainingQty}" placeholder="0" min="0"></td><td><input type="text" class="lot-number-input bg-gray-50 border rounded-lg w-32 p-2" placeholder="e.g., A123"></td><td><input type="date" class="expiry-date-input bg-gray-50 border rounded-lg w-40 p-2"></td></tr>`;
      })
      .join("");
    Alpine.store("modals").receipt = true;
  };

  window.openLotDetailModal = function (itemId) {
    const item = mockItems.find((i) => i.id === itemId);
    const lots = inventoryLots.filter((l) => l.item_id === itemId);
    document.getElementById(
      "lotModalTitle"
    ).textContent = `Detail Lot untuk: ${item.name}`;
    const tableBody = document.getElementById("lotDetailTableBody");
    tableBody.innerHTML = lots.length
      ? lots
          .map(
            (lot) =>
              `<tr class="bg-white border-b"><td class="px-4 py-3">${
                lot.lot_number
              }</td><td class="text-center">${lot.quantity.toLocaleString(
                "id-ID"
              )}</td><td class="px-4 py-3">${formatDate(
                lot.receipt_date
              )}</td><td class="px-4 py-3">${formatDate(
                lot.expiry_date
              )}</td></tr>`
          )
          .join("")
      : `<tr><td colspan="4" class="text-center p-4 text-gray-500">Tidak ada lot untuk item ini.</td></tr>`;
    Alpine.store("modals").lotDetail = true;
  };

  window.openWorkOrderModal = function (workOrderId = null) {
    const form = document.getElementById("workOrderForm");
    form.reset();
    document.getElementById("workOrderId").value = "";
    document.getElementById("woRecipeId").innerHTML = generateSelectOptions(
      mockRecipes,
      "id",
      "name"
    );
    if (workOrderId) {
      const wo = workOrders.find((w) => w.id === workOrderId);
      document.getElementById(
        "modalTitleWO"
      ).textContent = `Edit Perintah Kerja: ${wo.wo_number}`;
      document.getElementById("workOrderId").value = wo.id;
      document.getElementById("woRecipeId").value = wo.recipe_id;
      document.getElementById("woTargetQuantity").value = wo.target_quantity;
      document.getElementById("woProductionDate").value = wo.production_date;
    } else {
      document.getElementById("modalTitleWO").textContent =
        "Buat Perintah Kerja Baru";
      document.getElementById("woProductionDate").value = new Date()
        .toISOString()
        .split("T")[0];
    }
    Alpine.store("modals").workOrder = true;
  };

  window.openShipmentModal = function (shipmentId = null) {
    const form = document.getElementById("shipmentForm");
    form.reset();
    document.getElementById("shipmentId").value = "";
    document.getElementById("deliveryLines").innerHTML = "";
    document.getElementById("shipmentDriverId").innerHTML =
      generateSelectOptions(mockDrivers, "id", "name");
    document.getElementById("shipmentVehicleId").innerHTML =
      generateSelectOptions(mockVehicles, "id", "plate_number");
    document.getElementById("shipmentRecipeId").innerHTML =
      generateSelectOptions(mockRecipes, "id", "name");

    if (shipmentId) {
      const shipment = shipments.find((s) => s.id === shipmentId);
      document.getElementById(
        "modalTitleShipment"
      ).textContent = `Edit Pengiriman: ${shipment.shipment_number}`;
      document.getElementById("shipmentId").value = shipment.id;
      document.getElementById("shipmentDriverId").value = shipment.driver_id;
      document.getElementById("shipmentVehicleId").value = shipment.vehicle_id;
      document.getElementById("shipmentRecipeId").value = shipment.recipe_id;
      shipment.delivery_lines.forEach((line) => addDeliveryLine(line));
    } else {
      document.getElementById("modalTitleShipment").textContent =
        "Buat Pengiriman Baru";
      addDeliveryLine();
    }
    Alpine.store("modals").shipment = true;
  };

  window.openRecipeDetailModal = function (recipeId) {
    const recipe = mockRecipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    document.getElementById(
      "recipeDetailModalTitle"
    ).textContent = `Detail Resep: ${recipe.name}`;
    document.getElementById("recipeBomList").innerHTML = recipe.bom
      .map((ing) => {
        const item = mockItems.find((i) => i.id === ing.item_id);
        return `<li>${item.name}: ${ing.quantity_per_portion} ${item.unit}</li>`;
      })
      .join("");
    document.getElementById("recipeNutritionInfo").innerHTML = Object.entries(
      recipe.nutrition
    )
      .map(
        ([key, value]) => `
            <div class="flex justify-between border-b py-1"><span class="text-gray-500 capitalize">${key}</span><span class="font-medium text-gray-800">${value}</span></div>
        `
      )
      .join("");
    Alpine.store("modals").recipeDetail = true;
  };

  window.openRecipeModal = function (recipeId = null) {
    const form = document.getElementById("recipeForm");
    form.reset();
    document.getElementById("recipeId").value = "";
    document.getElementById("recipeIngredients").innerHTML = "";
    if (recipeId) {
      const recipe = mockRecipes.find((r) => r.id === recipeId);
      document.getElementById(
        "modalTitleRecipe"
      ).textContent = `Edit Resep: ${recipe.name}`;
      document.getElementById("recipeId").value = recipe.id;
      document.getElementById("recipeName").value = recipe.name;
      recipe.bom.forEach((ing) => addIngredientLine(ing));
    } else {
      document.getElementById("modalTitleRecipe").textContent =
        "Tambah Resep Baru";
      addIngredientLine();
    }
    Alpine.store("modals").recipeForm = true;
  };

  window.openSiklusMenuModal = function (day) {
    document.getElementById(
      "modalTitleSiklus"
    ).textContent = `Pilih Menu untuk Hari ke-${day}`;
    document.getElementById("siklusDay").value = day;
    const recipeSelect = document.getElementById("siklusRecipeId");
    const currentRecipeId = mockSiklusMenu.find(
      (s) => s.day === day
    )?.recipe_id;
    recipeSelect.innerHTML =
      `<option value="">-- Kosongkan --</option>` +
      mockRecipes
        .map(
          (r) =>
            `<option value="${r.id}" ${
              r.id === currentRecipeId ? "selected" : ""
            }>${r.name}</option>`
        )
        .join("");
    Alpine.store("modals").siklusMenu = true;
  };

  window.openKaryawanModal = function (karyawanId = null) {
    const form = document.getElementById("karyawanForm");
    form.reset();
    document.getElementById("karyawanId").value = "";
    if (karyawanId) {
      const karyawan = mockKaryawan.find((k) => k.id === karyawanId);
      document.getElementById(
        "modalTitleKaryawan"
      ).textContent = `Edit Data: ${karyawan.nama}`;
      document.getElementById("karyawanId").value = karyawan.id;
      document.getElementById("karyawanNama").value = karyawan.nama;
      document.getElementById("karyawanPosisi").value = karyawan.posisi;
      document.getElementById("karyawanTglBergabung").value =
        karyawan.tgl_bergabung;
      document.getElementById("karyawanStatus").value = karyawan.status;
    } else {
      document.getElementById("modalTitleKaryawan").textContent =
        "Tambah Karyawan Baru";
    }
    Alpine.store("modals").karyawan = true;
  };

  window.openGajiModal = function (gajiId = null) {
    const form = document.getElementById("gajiForm");
    form.reset();
    document.getElementById("gajiId").value = "";
    const karyawanSelect = document.getElementById("gajiKaryawanId");
    karyawanSelect.innerHTML = mockKaryawan
      .filter((k) => k.status === "Aktif")
      .map((k) => `<option value="${k.id}">${k.nama}</option>`)
      .join("");
    if (gajiId) {
      const gaji = mockGaji.find((g) => g.id === gajiId);
      document.getElementById("modalTitleGaji").textContent = `Edit Gaji`;
      document.getElementById("gajiId").value = gaji.id;
      karyawanSelect.value = gaji.karyawan_id;
      document.getElementById("gajiPeriode").value = gaji.periode;
      document.getElementById("gajiPokok").value = gaji.gaji_pokok;
      document.getElementById("gajiTunjangan").value = gaji.tunjangan;
      document.getElementById("gajiPotongan").value = gaji.potongan;
    } else {
      document.getElementById("modalTitleGaji").textContent = "Buat Gaji Baru";
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      document.getElementById("gajiPeriode").value = `${year}-${month}`;
    }
    Alpine.store("modals").gaji = true;
  };

  // --- 7.2: Data Deletion Logic ---

  const deleteHandlers = {
    po: (id) => {
      saveToLocalStorage(
        "sppg_purchaseOrders",
        (purchaseOrders = purchaseOrders.filter((p) => p.id !== id))
      );
      renderPOTable();
      showToast("PO berhasil dihapus.", "success");
    },
    resep: (id) => {
      saveToLocalStorage(
        "sppg_recipes",
        (mockRecipes = mockRecipes.filter((r) => r.id !== id))
      );
      renderRecipeList();
      showToast("Data resep berhasil dihapus.", "success");
    },
    produksi: (id) => {
      saveToLocalStorage(
        "sppg_workOrders",
        (workOrders = workOrders.filter((wo) => wo.id !== id))
      );
      renderWorkOrderList();
      showToast("Perintah kerja berhasil dihapus.", "success");
    },
    distribusi: (id) => {
      saveToLocalStorage(
        "sppg_shipments",
        (shipments = shipments.filter((s) => s.id !== id))
      );
      renderShipmentList();
      showToast("Jadwal pengiriman berhasil dihapus.", "success");
    },
    karyawan: (id) => {
      saveToLocalStorage(
        "sppg_karyawan",
        (mockKaryawan = mockKaryawan.filter((k) => k.id !== id))
      );
      renderKaryawanTable();
      showToast("Data karyawan berhasil dihapus.", "success");
    },
    gaji: (id) => {
      saveToLocalStorage(
        "sppg_gaji",
        (mockGaji = mockGaji.filter((g) => g.id !== id))
      );
      renderGajiTable();
      showToast("Data gaji berhasil dihapus.", "success");
    },
    item: (id) => {
      saveToLocalStorage(
        "sppg_items",
        (mockItems = mockItems.filter((i) => i.id !== id))
      );
      renderMasterDataItemsTable();
      showToast("Item berhasil dihapus.", "success");
    },
    supplier: (id) => {
      saveToLocalStorage(
        "sppg_suppliers",
        (mockSuppliers = mockSuppliers.filter((s) => s.id !== id))
      );
      renderMasterDataSuppliersTable();
      showToast("Supplier berhasil dihapus.", "success");
    },
    school: (id) => {
      saveToLocalStorage(
        "sppg_schools",
        (mockSchools = mockSchools.filter((s) => s.id !== id))
      );
      renderMasterDataSchoolsTable();
      showToast("Sekolah berhasil dihapus.", "success");
    },
    user: (id) => {
      saveToLocalStorage(
        "sppg_users",
        (mockUsers = mockUsers.filter((u) => u.id !== id))
      );
      renderMasterDataUsersTable();
      showToast("Pengguna berhasil dihapus.", "success");
    },
  };

  window.openDeleteModal = function (type, id, name) {
    document.getElementById(
      "deleteConfirmMessage"
    ).textContent = `Apakah Anda yakin ingin menghapus data "${name}"?`;
    const handler = deleteHandlers[type];
    if (handler) {
      document.getElementById("confirmDeleteButton").onclick = () => {
        handler(id);
        Alpine.store("modals").deleteConfirm = false;
      };
      Alpine.store("modals").deleteConfirm = true;
    } else {
      console.error(`Delete handler for type "${type}" not found.`);
    }
  };

  // --- 7.3: Form Submission Logic ---

  function handlePOSubmit(e) {
    e.preventDefault();
    const poId = document.getElementById("poId").value;
    const items = [];
    let totalAmount = 0;
    document.querySelectorAll("#itemLines .item-line").forEach((line) => {
      const itemId = parseInt(line.querySelector(".item-select").value);
      const quantity = parseInt(line.querySelector(".quantity-input").value);
      const item = mockItems.find((i) => i.id === itemId);
      if (item && quantity > 0) {
        items.push({
          item_id: itemId,
          quantity: quantity,
          price: item.price,
          received_qty: 0,
        });
        totalAmount += item.price * quantity;
      }
    });
    if (items.length === 0) {
      showToast("Harap tambahkan minimal satu item.", "error");
      return;
    }

    const poData = {
      supplier_id: parseInt(document.getElementById("supplier").value),
      order_date: document.getElementById("orderDate").value,
      items: items,
      total_amount: totalAmount,
    };

    if (poId) {
      const poIndex = purchaseOrders.findIndex((p) => p.id == poId);
      if (poIndex > -1) {
        const existingPo = purchaseOrders[poIndex];
        const updatedItems = poData.items.map((newItem) => {
          const oldItem = existingPo.items.find(
            (i) => i.item_id === newItem.item_id
          );
          return {
            ...newItem,
            received_qty: oldItem ? oldItem.received_qty : 0,
          };
        });
        purchaseOrders[poIndex] = {
          ...existingPo,
          ...poData,
          items: updatedItems,
        };
      }
    } else {
      const newId =
        purchaseOrders.length > 0
          ? Math.max(...purchaseOrders.map((p) => p.id)) + 1
          : 1;
      const today = new Date(poData.order_date);
      const poNumber = `PO-${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(newId).padStart(3, "0")}`;
      const newPO = {
        ...poData,
        id: newId,
        po_number: poNumber,
        expected_delivery_date: new Date(
          today.getTime() + 5 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        status: "Draft",
      };
      purchaseOrders.push(newPO);
    }
    saveToLocalStorage("sppg_purchaseOrders", purchaseOrders);
    showToast("Pesanan Pembelian berhasil disimpan.", "success");
    Alpine.store("modals").po = false;
    renderPOTable();
  }

  function handleReceiptSubmit(e) {
    e.preventDefault();
    const poId = parseInt(document.getElementById("receiptPoId").value);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    const receiptDate = new Date().toISOString().split("T")[0];
    let itemsReceived = 0;
    document.querySelectorAll(".receipt-item-row").forEach((row) => {
      const receivedQty = parseInt(
        row.querySelector(".received-qty-input").value || "0"
      );
      if (receivedQty > 0) {
        itemsReceived++;
        const itemId = parseInt(
          row.querySelector(".received-qty-input").dataset.itemId
        );
        const poItem = po.items.find((i) => i.item_id === itemId);
        if (poItem)
          poItem.received_qty = (poItem.received_qty || 0) + receivedQty;

        const newLot = {
          id: Date.now() + Math.random(),
          item_id: itemId,
          quantity: receivedQty,
          lot_number:
            row.querySelector(".lot-number-input").value || `LOT-${Date.now()}`,
          receipt_date: receiptDate,
          expiry_date:
            row.querySelector(".expiry-date-input").value ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
        };
        inventoryLots.push(newLot);
      }
    });

    if (itemsReceived === 0) {
      showToast("Tidak ada item yang diterima.", "error");
      return;
    }

    po.status = po.items.every((i) => (i.received_qty || 0) >= i.quantity)
      ? "Diterima Penuh"
      : "Diterima Sebagian";

    saveToLocalStorage("sppg_inventoryLots", inventoryLots);
    saveToLocalStorage("sppg_purchaseOrders", purchaseOrders);
    showToast("Penerimaan barang berhasil disimpan.", "success");
    Alpine.store("modals").receipt = false;
    renderReceiptPOTable();
    if (appState.currentPage === "stok") renderStockTable();
  }

  function handleWorkOrderFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("workOrderId").value;
    const woData = {
      recipe_id: parseInt(document.getElementById("woRecipeId").value),
      target_quantity: parseInt(
        document.getElementById("woTargetQuantity").value
      ),
      production_date: document.getElementById("woProductionDate").value,
    };
    if (
      !woData.recipe_id ||
      !woData.target_quantity ||
      !woData.production_date
    ) {
      showToast("Semua field harus diisi.", "error");
      return;
    }
    if (id) {
      const index = workOrders.findIndex((wo) => wo.id == id);
      workOrders[index] = { ...workOrders[index], ...woData };
      showToast("Perintah Kerja berhasil diperbarui.", "success");
    } else {
      const newId =
        workOrders.length > 0
          ? Math.max(...workOrders.map((wo) => wo.id)) + 1
          : 201;
      const woCountForDate =
        workOrders.filter((wo) => wo.production_date === woData.production_date)
          .length + 1;
      const dateStr = woData.production_date.replace(/-/g, "");
      const newWO = {
        ...woData,
        id: newId,
        wo_number: `WO-${dateStr}-${String(woCountForDate).padStart(2, "0")}`,
        status: "Direncanakan",
      };
      workOrders.push(newWO);
      showToast("Perintah Kerja berhasil dibuat.", "success");
    }
    saveToLocalStorage("sppg_workOrders", workOrders);
    Alpine.store("modals").workOrder = false;
    renderWorkOrderList();
  }

  function handleShipmentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("shipmentId").value;
    const delivery_lines = [];
    document.querySelectorAll(".delivery-line").forEach((line) => {
      const school_id = parseInt(line.querySelector(".school-select").value);
      const quantity = parseInt(line.querySelector(".quantity-input").value);
      if (school_id && quantity > 0)
        delivery_lines.push({ school_id, quantity, status: "Pending" });
    });
    if (delivery_lines.length === 0) {
      showToast("Harap tambahkan minimal satu tujuan pengiriman.", "error");
      return;
    }
    const shipmentData = {
      driver_id: parseInt(document.getElementById("shipmentDriverId").value),
      vehicle_id: parseInt(document.getElementById("shipmentVehicleId").value),
      recipe_id: parseInt(document.getElementById("shipmentRecipeId").value),
      delivery_lines,
    };

    if (id) {
      const index = shipments.findIndex((s) => s.id == id);
      shipments[index] = { ...shipments[index], ...shipmentData };
      showToast("Jadwal pengiriman berhasil diperbarui.", "success");
    } else {
      const newId =
        shipments.length > 0
          ? Math.max(...shipments.map((s) => s.id)) + 1
          : 601;
      const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const shipmentCountForDate =
        shipments.filter((s) => s.shipment_number.includes(dateStr)).length + 1;
      const newShipment = {
        ...shipmentData,
        id: newId,
        shipment_number: `SHP-${dateStr}-${String(
          shipmentCountForDate
        ).padStart(2, "0")}`,
        departure_time: null,
        status: "Direncanakan",
      };
      shipments.push(newShipment);
      showToast("Jadwal pengiriman berhasil dibuat.", "success");
    }
    saveToLocalStorage("sppg_shipments", shipments);
    Alpine.store("modals").shipment = false;
    renderShipmentList();
  }

  function handleRecipeFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("recipeId").value;
    const bom = [];
    document
      .querySelectorAll("#recipeIngredients .ingredient-line")
      .forEach((line) => {
        const itemId = parseInt(line.querySelector(".item-select").value);
        const qty = parseFloat(line.querySelector(".quantity-input").value);
        if (itemId && qty > 0)
          bom.push({ item_id: itemId, quantity_per_portion: qty });
      });
    const recipeName = document.getElementById("recipeName").value;
    if (!recipeName || bom.length === 0) {
      showToast("Nama resep dan minimal satu bahan harus diisi.", "error");
      return;
    }
    const recipeData = {
      name: recipeName,
      bom,
      nutrition: {
        kalori: "Auto",
        protein: "Auto",
        lemak: "Auto",
        karbohidrat: "Auto",
      },
    };
    if (id) {
      const index = mockRecipes.findIndex((r) => r.id == id);
      mockRecipes[index] = { ...mockRecipes[index], ...recipeData };
    } else {
      recipeData.id =
        mockRecipes.length > 0
          ? Math.max(...mockRecipes.map((r) => r.id)) + 1
          : 101;
      mockRecipes.push(recipeData);
    }
    saveToLocalStorage("sppg_recipes", mockRecipes);
    Alpine.store("modals").recipeForm = false;
    renderRecipeList();
    showToast("Resep berhasil disimpan.", "success");
  }

  function handleSiklusMenuFormSubmit(e) {
    e.preventDefault();
    const day = parseInt(document.getElementById("siklusDay").value);
    const recipeId = document.getElementById("siklusRecipeId").value;
    const siklusIndex = mockSiklusMenu.findIndex((s) => s.day === day);
    if (siklusIndex > -1)
      mockSiklusMenu[siklusIndex].recipe_id = recipeId
        ? parseInt(recipeId)
        : null;
    Alpine.store("modals").siklusMenu = false;
    renderSiklusMenuGrid();
  }

  function handleKaryawanFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("karyawanId").value;
    const karyawanData = {
      nama: document.getElementById("karyawanNama").value,
      posisi: document.getElementById("karyawanPosisi").value,
      tgl_bergabung: document.getElementById("karyawanTglBergabung").value,
      status: document.getElementById("karyawanStatus").value,
    };
    if (
      !karyawanData.nama ||
      !karyawanData.posisi ||
      !karyawanData.tgl_bergabung
    ) {
      showToast("Nama, posisi, dan tanggal bergabung harus diisi.", "error");
      return;
    }
    if (id) {
      const index = mockKaryawan.findIndex((k) => k.id == id);
      mockKaryawan[index] = { ...mockKaryawan[index], ...karyawanData };
    } else {
      karyawanData.id =
        mockKaryawan.length > 0
          ? Math.max(...mockKaryawan.map((k) => k.id)) + 1
          : 1001;
      mockKaryawan.push(karyawanData);
    }
    saveToLocalStorage("sppg_karyawan", mockKaryawan);
    Alpine.store("modals").karyawan = false;
    renderKaryawanTable();
    showToast("Data karyawan berhasil disimpan.", "success");
  }

  function handleGajiFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("gajiId").value;
    const gajiData = {
      karyawan_id: parseInt(document.getElementById("gajiKaryawanId").value),
      periode: document.getElementById("gajiPeriode").value,
      gaji_pokok: parseInt(document.getElementById("gajiPokok").value || 0),
      tunjangan: parseInt(document.getElementById("gajiTunjangan").value || 0),
      potongan: parseInt(document.getElementById("gajiPotongan").value || 0),
    };
    if (!gajiData.karyawan_id || !gajiData.periode) {
      showToast("Karyawan dan periode harus diisi.", "error");
      return;
    }
    if (id) {
      const index = mockGaji.findIndex((g) => g.id == id);
      mockGaji[index] = { ...mockGaji[index], ...gajiData };
    } else {
      gajiData.id =
        mockGaji.length > 0 ? Math.max(...mockGaji.map((g) => g.id)) + 1 : 2001;
      mockGaji.push(gajiData);
    }
    saveToLocalStorage("sppg_gaji", mockGaji);
    Alpine.store("modals").gaji = false;
    renderGajiTable();
    showToast("Data gaji berhasil disimpan.", "success");
  }

  function handleSaveAbsensi() {
    const tanggal = document.getElementById("absensiDate").value;
    mockAbsensi[tanggal] = [];
    document.querySelectorAll(".absensi-status-select").forEach((select) => {
      mockAbsensi[tanggal].push({
        karyawan_id: parseInt(select.dataset.karyawanId),
        status: select.value,
      });
    });
    saveToLocalStorage("sppg_absensi", mockAbsensi);
    showToast(
      `Absensi untuk tanggal ${formatDate(tanggal)} berhasil disimpan.`,
      "success"
    );
  }

  function handleSupplierFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("supplierId").value;
    const name = document.getElementById("supplierName").value.trim();

    if (!name) {
      showToast("Nama supplier tidak boleh kosong.", "error");
      return;
    }

    if (id) {
      // Update
      const index = mockSuppliers.findIndex((s) => s.id == id);
      mockSuppliers[index].name = name;
      showToast("Data supplier berhasil diperbarui.", "success");
    } else {
      // Create
      const newId =
        mockSuppliers.length > 0
          ? Math.max(...mockSuppliers.map((s) => s.id)) + 1
          : 1;
      mockSuppliers.push({ id: newId, name: name });
      showToast("Supplier baru berhasil ditambahkan.", "success");
    }

    saveToLocalStorage("sppg_suppliers", mockSuppliers);
    Alpine.store("modals").supplier = false;
    renderMasterDataSuppliersTable();
  }

  const formHandlers = {
    poForm: handlePOSubmit,
    receiptForm: handleReceiptSubmit,
    workOrderForm: handleWorkOrderFormSubmit,
    shipmentForm: handleShipmentSubmit,
    recipeForm: handleRecipeFormSubmit,
    siklusMenuForm: handleSiklusMenuFormSubmit,
    karyawanForm: handleKaryawanFormSubmit,
    gajiForm: handleGajiFormSubmit,
    itemForm: handleItemFormSubmit,
    supplierForm: handleSupplierFormSubmit,
    schoolForm: handleSchoolFormSubmit,
    userForm: handleUserFormSubmit,
  };

  // ===================================================================================
  // SECTION 8: APPLICATION INITIALIZATION & NAVIGATION
  // - Sets up modals, primary event listeners, and starts the initial navigation.
  // ===================================================================================
  function initializeApp() {
    modalsContainer.innerHTML = modalsTemplate;

    document.addEventListener("submit", function (e) {
      if (formHandlers[e.target.id]) formHandlers[e.target.id](e);
    });

    document
      .getElementById("addIngredientButton")
      .addEventListener("click", () => addIngredientLine());
    document
      .getElementById("addItemButton")
      .addEventListener("click", () => addPOItemLine());
    document
      .getElementById("addDeliveryLineButton")
      .addEventListener("click", () => addDeliveryLine());

    userInfo.textContent = `${appState.currentUser.type}: ${appState.currentUser.name}`;
    mainNav.addEventListener("click", (e) => {
      const link = e.target.closest(".nav-link");
      if (link) {
        e.preventDefault();
        navigate(link.dataset.page);
        if (Alpine.store("app")) Alpine.store("app").sidebarOpen = false;
      }
    });

    navigate(appState.currentPage);
  }

  // --- Helper functions for dynamic form lines ---
  function addPOItemLine(item = {}) {
    const container = document.getElementById("itemLines");
    const newLine = document.createElement("div");
    newLine.className = "item-line grid grid-cols-12 gap-4 items-center";
    newLine.innerHTML = `<div class="col-span-6"><select class="item-select bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" onchange="updatePOTotalAmount()">${generateSelectOptions(
      mockItems,
      "id",
      "name"
    )}</select></div><div class="col-span-3"><input type="number" min="1" value="${
      item.quantity || 1
    }" class="quantity-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" oninput="updatePOTotalAmount()"></div><div class="col-span-3 flex justify-end"><button type="button" class="remove-item-btn text-red-500 hover:text-red-700 font-medium" onclick="this.closest('.item-line').remove(); updatePOTotalAmount();">Hapus</button></div>`;
    container.appendChild(newLine);
    if (item.item_id)
      newLine.querySelector(".item-select").value = item.item_id;
  }
  function addIngredientLine(ingredient = {}) {
    const container = document.getElementById("recipeIngredients");
    const newLine = document.createElement("div");
    newLine.className = "ingredient-line grid grid-cols-12 gap-4 items-center";
    newLine.innerHTML = `<div class="col-span-6"><select class="item-select bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">${generateSelectOptions(
      mockItems,
      "id",
      "name"
    )}</select></div><div class="col-span-4"><input type="number" min="0.01" step="0.01" placeholder="e.g., 0.15" value="${
      ingredient.quantity_per_portion || ""
    }" class="quantity-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"></div><div class="col-span-2 flex justify-end"><button type="button" class="text-red-500 hover:text-red-700 font-medium" onclick="this.closest('.ingredient-line').remove()">Hapus</button></div>`;
    container.appendChild(newLine);
    if (ingredient.item_id)
      newLine.querySelector(".item-select").value = ingredient.item_id;
  }
  function addDeliveryLine(line = {}) {
    const container = document.getElementById("deliveryLines");
    const newLine = document.createElement("div");
    newLine.className = "delivery-line grid grid-cols-12 gap-4 items-center";
    newLine.innerHTML = `<div class="col-span-7"><select class="school-select bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">${generateSelectOptions(
      mockSchools,
      "id",
      "name"
    )}</select></div><div class="col-span-3"><input type="number" min="1" placeholder="Porsi" value="${
      line.quantity || ""
    }" class="quantity-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"></div><div class="col-span-2 flex justify-end"><button type="button" class="text-red-500 hover:text-red-700 font-medium" onclick="this.closest('.delivery-line').remove()">Hapus</button></div>`;
    container.appendChild(newLine);
    if (line.school_id)
      newLine.querySelector(".school-select").value = line.school_id;
  }
  window.updatePOTotalAmount = function () {
    let total = 0;
    document.querySelectorAll("#itemLines .item-line").forEach((line) => {
      const item = mockItems.find(
        (i) => i.id == line.querySelector(".item-select").value
      );
      const quantity = line.querySelector(".quantity-input").value;
      if (item && quantity > 0) total += item.price * quantity;
    });
    document.getElementById("totalAmount").textContent = formatCurrency(total);
  };

  // --- Navigation Core ---
  function navigate(pageId) {
    appState.currentPage = pageId;
    const pageMap = {
      resep: {
        title: "Manajemen Resep",
        template: resepContentTemplate,
        setup: setupResepPage,
      },
      siklus_menu: {
        title: "Siklus Menu",
        template: siklusMenuContentTemplate,
        setup: setupSiklusMenuPage,
      },
      pengadaan: {
        title: "Pengadaan",
        template: pengadaanPageTemplate,
        setup: setupPengadaanPage,
      },
      penerimaan: {
        title: "Penerimaan Barang",
        template: penerimaanContentTemplate,
        setup: setupPenerimaanPage,
      },
      stok: {
        title: "Manajemen Stok",
        template: stokContentTemplate,
        setup: setupStokPage,
      },
      produksi: {
        title: "Produksi",
        template: produksiPageTemplate,
        setup: setupProduksiPage,
      },
      distribusi: {
        title: "Distribusi",
        template: distribusiPageTemplate,
        setup: setupDistribusiPage,
      },
      keuangan: {
        title: "Keuangan",
        template: keuanganPageTemplate,
        setup: setupKeuanganPage,
      },
      pelaporan: {
        title: "Dashboard & Pelaporan",
        template: pelaporanPageTemplate,
        setup: setupPelaporanPage,
      },
      karyawan: {
        title: "Data Karyawan",
        template: karyawanContentTemplate,
        setup: setupKaryawanPage,
      },
      gaji: {
        title: "Manajemen Gaji",
        template: gajiContentTemplate,
        setup: setupGajiPage,
      },
      absensi: {
        title: "Absensi",
        template: absensiContentTemplate,
        setup: setupAbsensiPage,
      },
      profil_yayasan: {
        title: "Profil Yayasan",
        template: profilYayasanTemplate,
        setup: setupProfilYayasanPage,
      },
      profil_sppg: {
        title: "Profil SPPG",
        template: profilSppgTemplate,
        setup: setupProfilSppgPage,
      },
      master_items: {
        title: "Master Data: Item",
        template: masterDataItemsTemplate,
        setup: setupMasterDataItemsPage,
      },
      master_suppliers: {
        title: "Master Data: Supplier",
        template: masterDataSuppliersTemplate,
        setup: setupMasterDataSuppliersPage,
      },
      master_schools: {
        title: "Master Data: Sekolah",
        template: masterDataSchoolsTemplate,
        setup: setupMasterDataSchoolsPage,
      },
      master_users: {
        title: "Master Data: Pengguna",
        template: masterDataUsersTemplate,
        setup: setupMasterDataUsersPage,
      },
    };
    const page = pageMap[pageId];
    if (page) {
      pageTitle.textContent = page.title;
      pageContent.innerHTML = page.template;
      page.setup();
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("bg-gray-200", link.dataset.page === pageId);
      });
    }
  }

  initializeApp();
});
