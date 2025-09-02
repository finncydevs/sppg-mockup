// js/data.js
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Gagal menyimpan ke localStorage", e);
  }
};
export const loadFromLocalStorage = (key, defaultValue) => {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error("Gagal memuat dari localStorage", e);
      return defaultValue;
    }
  }
  saveToLocalStorage(key, defaultValue);
  return defaultValue;
};

// --- Master Data ---
export let mockSuppliers = loadFromLocalStorage("sppg_suppliers", [
  {
    id: 1,
    name: "PT Sinar Pangan Sejahtera",
    contact_person: "Budi Santoso",
    phone: "081234567890",
    email: "sales@sinarpangan.com",
    address: "Jl. Industri Raya No. 12, Jakarta",
  },
  {
    id: 2,
    name: "CV Dapur Nusantara",
    contact_person: "Ani Wijaya",
    phone: "081122334455",
    email: "info@dapur-nusantara.co.id",
    address: "Jl. Logam No. 34, Bandung",
  },
]);
export let mockItems = loadFromLocalStorage("sppg_items", [
  { id: 1, name: "Beras Premium", unit: "kg", price: 12000 },
  { id: 2, name: "Daging Ayam Fillet", unit: "kg", price: 45000 },
  { id: 3, name: "Telur Ayam", unit: "kg", price: 25000 },
  { id: 4, name: "Wortel", unit: "kg", price: 8000 },
  { id: 5, name: "Buncis", unit: "kg", price: 10000 },
  { id: 6, name: "Minyak Goreng", unit: "liter", price: 15000 },
]);
export let mockDrivers = loadFromLocalStorage("sppg_drivers", [
  { id: 301, name: "Budi Santoso" },
  { id: 302, name: "Agus Wijaya" },
]);
export let mockVehicles = loadFromLocalStorage("sppg_vehicles", [
  { id: 401, plate_number: "D 1234 ABC" },
  { id: 402, plate_number: "B 5678 XYZ" },
]);
export let mockSchools = loadFromLocalStorage("sppg_schools", [
  {
    id: 501,
    name: "SDN Merdeka 1",
    address: "Jl. Merdeka No. 10",
    principal_name: "Ibu Dr. Siti Aminah",
    phone: "022123456",
  },
  {
    id: 502,
    name: "SDN Pelita Harapan",
    address: "Jl. Pendidikan No. 5",
    principal_name: "Bapak Drs. Hartono",
    phone: "022654321",
  },
]);
export let mockUsers = loadFromLocalStorage("sppg_users", [
  { id: 901, name: "Bapak Kepala", role: "Manajer SPPG" },
  { id: 905, name: "Admin Utama", role: "Admin" },
]);
export let mockKaryawan = loadFromLocalStorage("sppg_karyawan", [
  {
    id: 1001,
    nama: "Ahmad Subarjo",
    posisi: "Kepala Dapur",
    tgl_bergabung: "2024-01-15",
    status: "Aktif",
  },
]);
export let mockAset = loadFromLocalStorage("sppg_aset", [
  {
    id: 701,
    name: "Kompor Gas Rinnai 2 Tungku",
    category: "Peralatan Dapur",
    purchase_date: "2024-01-10",
    value: 1500000,
    status: "Baik",
  },
]);

// --- Transactional Data ---
export let purchaseOrders = loadFromLocalStorage("sppg_purchaseOrders", [
  {
    id: 1,
    po_number: "PO-2025-08-001",
    supplier_id: 1,
    order_date: "2025-08-20",
    status: "Disetujui",
    items: [{ item_id: 1, quantity: 100, price: 12000, received_qty: 0 }],
    total_amount: 1200000,
  },
]);
export let inventoryLots = loadFromLocalStorage("sppg_inventoryLots", []);
export let mockRecipes = loadFromLocalStorage("sppg_recipes", [
  {
    id: 101,
    name: "Nasi Ayam Goreng & Tumis Buncis",
    bom: [
      { item_id: 1, quantity_per_portion: 0.15 },
      { item_id: 2, quantity_per_portion: 0.1 },
    ],
  },
]);
export let mockSiklusMenu = loadFromLocalStorage("sppg_siklusMenu", {
  "2025-08-27": 101,
}); // Data contoh untuk hari ini
export let workOrders = loadFromLocalStorage("sppg_workOrders", [
  {
    id: 201,
    wo_number: "WO-20250827-01",
    recipe_id: 101,
    target_quantity: 500,
    production_date: "2025-08-27",
    status: "Selesai",
  },
]);
export let shipments = loadFromLocalStorage("sppg_shipments", [
  {
    id: 601,
    shipment_number: "SHP-20250827-01",
    driver_id: 301,
    vehicle_id: 401,
    recipe_id: 101,
    departure_time: "2025-08-27T09:30:00",
    status: "Selesai",
    delivery_lines: [{ school_id: 501, quantity: 500, status: "Terkirim" }],
  },
]);
export let mockGaji = loadFromLocalStorage("sppg_gaji", [
  {
    id: 2001,
    karyawan_id: 1001,
    periode: "2025-07",
    gaji_pokok: 5000000,
    tunjangan: 500000,
    potongan: 100000,
  },
]);
export let mockAbsensi = loadFromLocalStorage("sppg_absensi", {
  "2025-08-27": [{ karyawan_id: 1001, status: "Hadir" }],
});
export let mockKeuangan = loadFromLocalStorage("sppg_keuangan", [
  {
    id: 1,
    date: "2025-08-15",
    description: "Pembelian Gas Elpiji",
    type: "Pengeluaran",
    amount: 150000,
  },
]);

// --- Profile Data ---
export let mockProfilYayasan = loadFromLocalStorage("sppg_profilYayasan", {
  nama: "Yayasan Cerdas Bangsa",
  alamat: "Jl. Pendidikan No. 1, Jakarta",
  telp: "021-1234567",
  email: "info@cerdasbangsa.org",
  pimpinan: "Dr. H. Susilo Bambang",
});

export let mockProfilSPPG = loadFromLocalStorage("sppg_profilSppg", {
  nama: "Dapur Sehat SPPG Jakarta Pusat",
  alamat: "Jl. Kesehatan No. 10, Jakarta",
  telp: "021-7654321",
  email: "sppg.jakpus@cerdasbangsa.org",
  penanggung_jawab: "Ibu Manager",
});

// --- App State ---
export let appState = {
  currentPage: "pelaporan",
  currentUser: { type: "Manajer SPPG", name: "Bapak Kepala" },
  siklusMenu: { currentDate: new Date() },
};
