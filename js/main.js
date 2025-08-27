// js/main.js

// ===================================================================================
// SECTION 1: IMPORTS
// - Mengimpor semua data, UI, dan fungsi dari file-file terpisah.
// ===================================================================================
import * as Data from "./data.js";
import * as UI from "./ui.js";
import * as Perencanaan from "./handlers/perencanaan.js";
import * as ProsesHarian from "./handlers/proses_harian.js";
import * as Administrasi from "./handlers/administrasi.js";
import * as Laporan from "./handlers/laporan.js";
import * as MasterData from "./handlers/master_data.js";

// ===================================================================================
// SECTION 2: GLOBAL ELEMENTS & UTILITIES
// ===================================================================================
const pageContent = document.getElementById("page-content");
const pageTitle = document.getElementById("page-title");
const mainNav = document.getElementById("main-nav");
const modalsContainer = document.getElementById("all-modals");
const userInfo = document.getElementById("user-info");

// Ekspor utilitas agar bisa diimpor dan digunakan oleh file handler lain
export const formatDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export const formatShortDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
export const formatInputDate = (date) =>
  new Date(date).toISOString().split("T")[0];
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export const showToast = (message, type = "success") => {
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

export const getStatusBadge = (status) => {
  const statuses = {
    Draft: "bg-gray-100 text-gray-800",
    Disetujui: "bg-orange-100 text-orange-800",
    "Diterima Sebagian": "bg-blue-100 text-blue-800",
    "Diterima Penuh": "bg-indigo-100 text-indigo-800",
    Direncanakan: "bg-gray-100 text-gray-800",
    Selesai: "bg-green-100 text-green-800",
    Pending: "bg-gray-100 text-gray-800",
    Terkirim: "bg-green-100 text-green-800",
    Aktif: "bg-green-100 text-green-800",
    "Tidak Aktif": "bg-red-100 text-red-800",
    Baik: "bg-green-100 text-green-800",
    "Perlu Perbaikan": "bg-yellow-100 text-yellow-800",
    Rusak: "bg-red-100 text-red-800",
  };
  return `<span class="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
    statuses[status] || "bg-gray-200"
  }">${status}</span>`;
};

export const generateSelectOptions = (data, valueKey, textKey) =>
  data
    .map(
      (item) => `<option value="${item[valueKey]}">${item[textKey]}</option>`
    )
    .join("");

// ===================================================================================
// SECTION 3: GLOBAL EVENT HANDLERS & WINDOW FUNCTIONS
// ===================================================================================

// Gabungkan semua form handler dari setiap modul
const formHandlers = {
  ...Perencanaan.formHandlers,
  ...ProsesHarian.formHandlers,
  ...Administrasi.formHandlers,
  ...MasterData.formHandlers,
};

// Gabungkan semua delete handler dari setiap modul
const deleteHandlers = {
  ...Perencanaan.deleteHandlers,
  ...ProsesHarian.deleteHandlers,
  ...Administrasi.deleteHandlers,
  ...MasterData.deleteHandlers,
};

// Fungsi ini harus global agar bisa dipanggil dari HTML
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

// Jadikan semua fungsi "openModal" global agar bisa dipanggil dari `onclick` di HTML
Object.assign(window, {
  // Perencanaan
  openRecipeModal: Perencanaan.openRecipeModal,
  openRecipeDetailModal: Perencanaan.openRecipeDetailModal,
  openSiklusMenuModal: Perencanaan.openSiklusMenuModal,
  // Proses Harian
  openPOModal: ProsesHarian.openPOModal,
  openReceiptModal: ProsesHarian.openReceiptModal,
  openLotDetailModal: ProsesHarian.openLotDetailModal,
  openWorkOrderModal: ProsesHarian.openWorkOrderModal,
  openShipmentModal: ProsesHarian.openShipmentModal,
  cetakSuratJalan: ProsesHarian.cetakSuratJalan,
  // Administrasi
  openKeuanganModal: Administrasi.openKeuanganModal,
  openAsetModal: Administrasi.openAsetModal,
  openGajiModal: Administrasi.openGajiModal,
  openKaryawanModal: Administrasi.openKaryawanModal, // Note: Karyawan modal is in Administrasi but page is in Master
  // Master Data
  openSupplierModal: MasterData.openSupplierModal,
  openSchoolModal: MasterData.openSchoolModal,
  openUserModal: MasterData.openUserModal,
  openItemModal: MasterData.openItemModal,
});

// ===================================================================================
// SECTION 4: APP INITIALIZATION & NAVIGATION
// ===================================================================================
const pageMap = {
  pelaporan: {
    title: "Dashboard & KPI",
    template: UI.pelaporanPageTemplate,
    setup: Laporan.setupPelaporanPage,
  },
  perencanaan_menu: {
    title: "Perencanaan Menu",
    template: UI.perencanaanMenuTemplate,
    setup: Perencanaan.setupPerencanaanMenuPage,
  },
  pengadaan: {
    title: "Pengadaan & Penerimaan",
    template: UI.pengadaanPageTemplate,
    setup: ProsesHarian.setupPengadaanPage,
  },
  produksi_stok: {
    title: "Produksi & Stok",
    template: UI.produksiStokTemplate,
    setup: ProsesHarian.setupProduksiStokPage,
  },
  distribusi: {
    title: "Distribusi",
    template: UI.distribusiPageTemplate,
    setup: ProsesHarian.setupDistribusiPage,
  },
  keuangan: {
    title: "Keuangan",
    template: UI.keuanganPageTemplate,
    setup: Administrasi.setupKeuanganPage,
  },
  gaji: {
    title: "Gaji Karyawan",
    template: UI.gajiContentTemplate,
    setup: Administrasi.setupGajiPage,
  },
  absensi: {
    title: "Absensi Karyawan",
    template: UI.absensiContentTemplate,
    setup: Administrasi.setupAbsensiPage,
  },
  aset: {
    title: "Manajemen Aset",
    template: UI.asetPageTemplate,
    setup: Administrasi.setupAsetPage,
  },
  laporan_pengantaran: {
    title: "Laporan Pengantaran",
    template: UI.laporanPengantaranTemplate,
    setup: Laporan.setupLaporanPengantaranPage,
  },
  master_karyawan: {
    title: "Master Data Karyawan",
    template: UI.masterKaryawanTemplate,
    setup: MasterData.setupMasterKaryawanPage,
  },
  master_supplier: {
    title: "Master Data Supplier",
    template: UI.masterSuppliersTemplate,
    setup: MasterData.setupMasterSupplierPage,
  },
  master_sekolah: {
    title: "Master Data Sekolah",
    template: UI.masterSchoolsTemplate,
    setup: MasterData.setupMasterSekolahPage,
  },
  master_user: {
    title: "Master Data Pengguna",
    template: UI.masterUsersTemplate,
    setup: MasterData.setupMasterUserPage,
  },
  profil_yayasan: {
    title: "Profil Yayasan",
    template: UI.profilYayasanTemplate,
    setup: Administrasi.setupProfilYayasanPage,
  },
  profil_sppg: {
    title: "Profil SPPG",
    template: UI.profilSppgTemplate,
    setup: Administrasi.setupProfilSppgPage,
  },
};

function navigate(pageId) {
  Data.appState.currentPage = pageId;
  const page = pageMap[pageId];

  if (page) {
    pageTitle.textContent = page.title;
    pageContent.innerHTML = page.template;
    page.setup();

    // Logika highlight navigasi yang lebih baik
    const activeClasses = ["bg-blue-100", "text-blue-700", "font-semibold"];

    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove(...activeClasses));
    document
      .querySelectorAll(".menu-group button")
      .forEach((toggle) =>
        toggle.classList.remove(...activeClasses, "bg-gray-100")
      );

    const activeLink = document.querySelector(
      `.nav-link[data-page="${pageId}"]`
    );
    if (activeLink) {
      activeLink.classList.add(...activeClasses);

      const parentToggle = activeLink
        .closest(".menu-group")
        ?.querySelector("button");
      if (parentToggle) {
        parentToggle.classList.add("bg-gray-100", "font-semibold");
      }
    }
  }
}

function initializeApp() {
  modalsContainer.innerHTML = UI.modalsTemplate;

  document.addEventListener("submit", (e) => {
    if (formHandlers[e.target.id]) {
      e.preventDefault();
      formHandlers[e.target.id](e);
    }
  });

  userInfo.textContent = `${Data.appState.currentUser.type}: ${Data.appState.currentUser.name}`;

  mainNav.addEventListener("click", (e) => {
    const link = e.target.closest(".nav-link");
    if (link) {
      e.preventDefault();
      navigate(link.dataset.page);
      Alpine.store("app").sidebarOpen = false;
    }
  });

  navigate(Data.appState.currentPage);
}

initializeApp();
