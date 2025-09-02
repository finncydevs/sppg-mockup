// js/main.js (Versi Final dengan Perbaikan Timing)

import * as Data from "./data.js";
import * as UI from "./ui.js";
import * as Perencanaan from "./handlers/perencanaan.js";
import * as ProsesHarian from "./handlers/proses_harian.js";
import * as Administrasi from "./handlers/administrasi.js";
import * as Laporan from "./handlers/laporan.js";
import * as MasterData from "./handlers/master_data.js";
import * as Driver from "./handlers/driver.js";
import { checkLoginStatus } from "./auth.js";

// ===================================================================================
// SECTION 1: DEKLARASI VARIABEL GLOBAL (TANPA INISIALISASI)
// ===================================================================================
let pageContent, pageTitle, mainNav, modalsContainer, userInfo;

// ===================================================================================
// SECTION 2: UTILITIES
// ===================================================================================
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
    "Gagal Kirim": "bg-red-100 text-red-800",
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
const formHandlers = {
  ...Perencanaan.formHandlers,
  ...ProsesHarian.formHandlers,
  ...Administrasi.formHandlers,
  ...MasterData.formHandlers,
};
const deleteHandlers = {
  ...Perencanaan.deleteHandlers,
  ...ProsesHarian.deleteHandlers,
  ...Administrasi.deleteHandlers,
  ...MasterData.deleteHandlers,
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

Object.assign(window, {
  openRecipeModal: Perencanaan.openRecipeModal,
  openRecipeDetailModal: Perencanaan.openRecipeDetailModal,
  addIngredientLine: Perencanaan.addIngredientLine,
  openPOModal: ProsesHarian.openPOModal,
  openReceiptModal: ProsesHarian.openReceiptModal,
  openLotDetailModal: ProsesHarian.openLotDetailModal,
  openWorkOrderModal: ProsesHarian.openWorkOrderModal,
  openShipmentModal: ProsesHarian.openShipmentModal,
  cetakSuratJalan: ProsesHarian.cetakSuratJalan,
  addPOItemLine: ProsesHarian.addPOItemLine,
  updatePOTotalAmount: ProsesHarian.updatePOTotalAmount,
  addDeliveryLine: ProsesHarian.addDeliveryLine,
  openItemModal: ProsesHarian.openItemModal,
  openKeuanganModal: Administrasi.openKeuanganModal,
  openAsetModal: Administrasi.openAsetModal,
  openGajiModal: Administrasi.openGajiModal,
  openKaryawanModal: MasterData.openKaryawanModal,
  openSupplierModal: MasterData.openSupplierModal,
  openSchoolModal: MasterData.openSchoolModal,
  openUserModal: MasterData.openUserModal,
  openReportModal: Driver.openReportModal,
});

// ===================================================================================
// SECTION 4: APP INITIALIZATION & NAVIGATION
// ===================================================================================
const pageMap = {
  pelaporan: {
    title: "Dashboard",
    template: UI.pelaporanPageTemplate,
    setup: Laporan.setupPelaporanPage,
  },
  perencanaan_menu: {
    title: "Perencanaan Menu",
    template: UI.perencanaanMenuTemplate,
    setup: Perencanaan.setupPerencanaanMenuPage,
  },
  pengadaan: {
    title: "Pengadaan",
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
  laporan_driver: {
    title: "Laporan Pengiriman",
    template: UI.driverPageTemplate,
    setup: Driver.setupDriverPage,
  },
  keuangan: {
    title: "Keuangan",
    template: UI.keuanganPageTemplate,
    setup: Administrasi.setupKeuanganPage,
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
    title: "Data Karyawan",
    template: UI.masterKaryawanTemplate,
    setup: MasterData.setupMasterKaryawanPage,
  },
  absensi: {
    title: "Absensi Karyawan",
    template: UI.absensiContentTemplate,
    setup: Administrasi.setupAbsensiPage,
  },
  gaji: {
    title: "Gaji Karyawan",
    template: UI.gajiContentTemplate,
    setup: Administrasi.setupGajiPage,
  },
  master_supplier: {
    title: "Data Supplier",
    template: UI.masterSuppliersTemplate,
    setup: MasterData.setupMasterSupplierPage,
  },
  master_sekolah: {
    title: "Data Sekolah",
    template: UI.masterSchoolsTemplate,
    setup: MasterData.setupMasterSekolahPage,
  },
  master_user: {
    title: "Manajemen Pengguna",
    template: UI.masterUsersTemplate,
    setup: MasterData.setupMasterUserPage,
  },
  profil_yayasan: {
    title: "Profil Yayasan",
    template: UI.masterContentTemplate,
    setup: MasterData.setupProfilYayasanPage,
  },
  profil_sppg: {
    title: "Profil SPPG",
    template: UI.masterContentTemplate,
    setup: MasterData.setupProfilSppgPage,
  },
};

function navigate(pageId) {
  if (!pageMap[pageId]) {
    console.error(`Page "${pageId}" not found in pageMap.`);
    pageId = "pelaporan";
  }

  Data.appState.currentPage = pageId;
  Data.saveToLocalStorage("sppg_appState", Data.appState);
  const page = pageMap[pageId];

  if (page) {
    if (pageTitle) pageTitle.textContent = page.title;
    if (pageContent) pageContent.innerHTML = page.template;
    if (page.setup) page.setup();

    const activeClasses = ["bg-blue-100", "text-blue-700", "font-semibold"];
    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove(...activeClasses));
    document
      .querySelectorAll(".menu-group button")
      .forEach((toggle) =>
        toggle.classList.remove("bg-gray-100", "font-semibold")
      );

    const activeLink = document.querySelector(
      `.nav-link[data-page="${pageId}"]`
    );
    if (activeLink) {
      activeLink.classList.add(...activeClasses);
      const parentToggle = activeLink
        .closest(".menu-group")
        ?.querySelector("button");
      if (parentToggle)
        parentToggle.classList.add("bg-gray-100", "font-semibold");
    }
  }
}

// Fungsi inisialisasi aplikasi utama (dipanggil setelah login berhasil)
window.initializeApp = function () {
  // PENTING: Cari elemen DOM di sini, SETELAH aplikasi utama muncul
  pageContent = document.getElementById("page-content");
  pageTitle = document.getElementById("page-title");
  mainNav = document.getElementById("main-nav");
  modalsContainer = document.getElementById("all-modals");
  userInfo = document.getElementById("user-info");

  if (modalsContainer) modalsContainer.innerHTML = UI.modalsTemplate;

  document.addEventListener("submit", (e) => {
    if (formHandlers[e.target.id]) {
      e.preventDefault();
      formHandlers[e.target.id](e);
    }
  });

  if (Data.appState.currentUser && userInfo) {
    userInfo.textContent = `${Data.appState.currentUser.role}: ${Data.appState.currentUser.name}`;
  }

  if (mainNav) {
    mainNav.addEventListener("click", (e) => {
      const link = e.target.closest(".nav-link");
      if (link) {
        e.preventDefault();
        navigate(link.dataset.page);
        if (Alpine.store("app")) Alpine.store("app").sidebarOpen = false;
      }
    });
  }

  if (
    Data.appState.currentUser &&
    Data.appState.currentUser.role === "Driver"
  ) {
    navigate("laporan_driver");
  } else {
    navigate(Data.appState.currentPage || "pelaporan");
  }
};

// --- TITIK AWAL APLIKASI ---
// Memeriksa status login saat halaman pertama kali dimuat.
checkLoginStatus();
