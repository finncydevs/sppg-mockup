// js/state.js
document.addEventListener("alpine:init", () => {
  // Store untuk state UI global, seperti sidebar
  Alpine.store("app", {
    sidebarOpen: false,
  });

  // Store terpusat untuk mengontrol visibilitas semua modal di aplikasi
  Alpine.store("modals", {
    // Transaksional
    po: false,
    receipt: false,
    lotDetail: false,
    workOrder: false,
    shipment: false,
    recipeDetail: false,
    recipeForm: false,
    siklusMenu: false,

    // Administrasi & SDM
    karyawan: false,
    gaji: false,
    aset: false,
    keuangan: false,

    // Master Data
    item: false,
    supplier: false,
    school: false,
    user: false,

    // Utility
    deleteConfirm: false,
  });
});
