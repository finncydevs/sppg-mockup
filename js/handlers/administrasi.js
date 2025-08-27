// js/handlers/administrasi.js

import * as Data from "../data.js";
import {
  showToast,
  generateSelectOptions,
  formatDate,
  formatInputDate,
  formatCurrency,
  getStatusBadge,
} from "../main.js";

// ===================================================================================
// BAGIAN A: KEUANGAN
// ===================================================================================

export function setupKeuanganPage() {
  renderKeuanganPage();
}

function renderKeuanganPage() {
  let allTransactions = [...Data.mockKeuangan];
  Data.purchaseOrders
    .filter(
      (p) => p.status === "Diterima Penuh" || p.status === "Diterima Sebagian"
    )
    .forEach((po) => {
      allTransactions.push({
        id: `po-${po.id}`,
        date: po.order_date,
        description: `Pembelian PO ${po.po_number}`,
        type: "Pengeluaran",
        amount: po.total_amount,
      });
    });

  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  let totalPemasukan = 0,
    totalPengeluaran = 0;
  const tableBody = document.getElementById("finance-transactions-table");
  tableBody.innerHTML = allTransactions
    .map((t) => {
      if (t.type === "Pemasukan") {
        totalPemasukan += t.amount;
      } else {
        totalPengeluaran += t.amount;
      }
      return `
            <tr class="bg-white border-b">
                <td class="px-6 py-4">${formatDate(t.date)}</td>
                <td class="px-6 py-4">${t.description}</td>
                <td class="px-6 py-4 text-right text-green-600">${
                  t.type === "Pemasukan" ? formatCurrency(t.amount) : "-"
                }</td>
                <td class="px-6 py-4 text-right text-red-600">${
                  t.type === "Pengeluaran" ? formatCurrency(t.amount) : "-"
                }</td>
            </tr>`;
    })
    .join("");

  const saldoAkhir = totalPemasukan - totalPengeluaran;
  document.getElementById("total-pemasukan").textContent =
    formatCurrency(totalPemasukan);
  document.getElementById("total-pengeluaran").textContent =
    formatCurrency(totalPengeluaran);
  document.getElementById("saldo-akhir").textContent =
    formatCurrency(saldoAkhir);
  document
    .getElementById("saldo-akhir")
    .classList.toggle("text-red-600", saldoAkhir < 0);
  document
    .getElementById("saldo-akhir")
    .classList.toggle("text-green-600", saldoAkhir >= 0);
}

export function openKeuanganModal(id = null) {
  document.getElementById("keuanganForm").reset();
  document.getElementById("keuanganId").value = "";
  if (id) {
    const trx = Data.mockKeuangan.find((t) => t.id === id);
    document.getElementById("modalTitleKeuangan").textContent =
      "Edit Transaksi";
    document.getElementById("keuanganId").value = trx.id;
    document.getElementById("keuanganDate").value = trx.date;
    document.getElementById("keuanganDescription").value = trx.description;
    document.getElementById("keuanganType").value = trx.type;
    document.getElementById("keuanganAmount").value = trx.amount;
  } else {
    document.getElementById("modalTitleKeuangan").textContent =
      "Tambah Transaksi Baru";
    document.getElementById("keuanganDate").value = formatInputDate(new Date());
  }
  Alpine.store("modals").keuangan = true;
}

function handleKeuanganFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("keuanganId").value;
  const trxData = {
    date: document.getElementById("keuanganDate").value,
    description: document.getElementById("keuanganDescription").value.trim(),
    type: document.getElementById("keuanganType").value,
    amount: parseInt(document.getElementById("keuanganAmount").value),
  };

  if (
    !trxData.date ||
    !trxData.description ||
    isNaN(trxData.amount) ||
    trxData.amount <= 0
  ) {
    showToast("Semua field harus diisi dengan benar.", "error");
    return;
  }

  if (id) {
    const index = Data.mockKeuangan.findIndex((t) => t.id == id);
    Data.mockKeuangan[index] = { ...Data.mockKeuangan[index], ...trxData };
    showToast("Transaksi berhasil diperbarui.", "success");
  } else {
    const newId =
      Data.mockKeuangan.length > 0
        ? Math.max(...Data.mockKeuangan.map((t) => t.id)) + 1
        : 1;
    Data.mockKeuangan.push({ id: newId, ...trxData });
    showToast("Transaksi baru berhasil ditambahkan.", "success");
  }

  Data.saveToLocalStorage("sppg_keuangan", Data.mockKeuangan);
  Alpine.store("modals").keuangan = false;
  renderKeuanganPage();
}

// ===================================================================================
// BAGIAN B: MANAJEMEN ASET
// ===================================================================================

export function setupAsetPage() {
  renderAsetTable();
}

function renderAsetTable() {
  const tableBody = document.getElementById("aset-table-body");
  tableBody.innerHTML = Data.mockAset
    .map(
      (aset) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${aset.name}</td>
            <td class="px-6 py-4">${aset.category}</td>
            <td class="px-6 py-4">${formatDate(aset.purchase_date)}</td>
            <td class="px-6 py-4 text-right">${formatCurrency(aset.value)}</td>
            <td class="px-6 py-4 text-center">${getStatusBadge(
              aset.status
            )}</td>
            <td class="px-6 py-4 text-center space-x-2">
                <button onclick="openAsetModal(${
                  aset.id
                })" class="text-blue-600 hover:underline text-sm">Edit</button>
                <button onclick="openDeleteModal('aset', ${
                  aset.id
                }, '${aset.name.replace(
        /'/g,
        "\\'"
      )}')" class="text-red-600 hover:underline text-sm">Hapus</button>
            </td>
        </tr>
    `
    )
    .join("");
}

export function openAsetModal(id = null) {
  document.getElementById("asetForm").reset();
  document.getElementById("asetId").value = "";
  if (id) {
    const aset = Data.mockAset.find((a) => a.id === id);
    document.getElementById("modalTitleAset").textContent = "Edit Aset";
    document.getElementById("asetId").value = aset.id;
    document.getElementById("asetName").value = aset.name;
    document.getElementById("asetCategory").value = aset.category;
    document.getElementById("asetPurchaseDate").value = aset.purchase_date;
    document.getElementById("asetValue").value = aset.value;
    document.getElementById("asetStatus").value = aset.status;
  } else {
    document.getElementById("modalTitleAset").textContent = "Tambah Aset Baru";
  }
  Alpine.store("modals").aset = true;
}

function handleAsetFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("asetId").value;
  const asetData = {
    name: document.getElementById("asetName").value.trim(),
    category: document.getElementById("asetCategory").value.trim(),
    purchase_date: document.getElementById("asetPurchaseDate").value,
    value: parseInt(document.getElementById("asetValue").value),
    status: document.getElementById("asetStatus").value,
  };
  if (
    !asetData.name ||
    !asetData.category ||
    !asetData.purchase_date ||
    isNaN(asetData.value)
  ) {
    showToast("Semua field harus diisi dengan benar.", "error");
    return;
  }
  if (id) {
    const index = Data.mockAset.findIndex((a) => a.id == id);
    Data.mockAset[index] = { ...Data.mockAset[index], ...asetData };
    showToast("Data aset berhasil diperbarui.", "success");
  } else {
    const newId =
      Data.mockAset.length > 0
        ? Math.max(...Data.mockAset.map((a) => a.id)) + 1
        : 701;
    Data.mockAset.push({ id: newId, ...asetData });
    showToast("Aset baru berhasil ditambahkan.", "success");
  }
  Data.saveToLocalStorage("sppg_aset", Data.mockAset);
  Alpine.store("modals").aset = false;
  renderAsetTable();
}

// ===================================================================================
// BAGIAN C: SDM (GAJI & ABSENSI)
// ===================================================================================

export function setupGajiPage() {
  renderGajiTable();
}

export function setupAbsensiPage() {
  const dateInput = document.getElementById("absensiDate");
  dateInput.value = formatInputDate(new Date());
  renderAbsensiList(dateInput.value);
  dateInput.addEventListener("change", (e) =>
    renderAbsensiList(e.target.value)
  );
  document
    .getElementById("saveAbsensiButton")
    .addEventListener("click", handleSaveAbsensi);
}

function renderGajiTable() {
  const tableBody = document.getElementById("gajiTableBody");
  tableBody.innerHTML = Data.mockGaji
    .map((g) => {
      const karyawan = Data.mockKaryawan.find((k) => k.id === g.karyawan_id);
      const gajiBersih = g.gaji_pokok + g.tunjangan - g.potongan;
      const periode = new Date(g.periode + "-02").toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
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

export function openGajiModal(id = null) {
  const form = document.getElementById("gajiForm");
  form.reset();
  document.getElementById("gajiId").value = "";
  const karyawanSelect = document.getElementById("gajiKaryawanId");
  karyawanSelect.innerHTML = generateSelectOptions(
    Data.mockKaryawan.filter((k) => k.status === "Aktif"),
    "id",
    "nama"
  );

  if (id) {
    const gaji = Data.mockGaji.find((g) => g.id === id);
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
    const index = Data.mockGaji.findIndex((g) => g.id == id);
    Data.mockGaji[index] = { ...Data.mockGaji[index], ...gajiData };
  } else {
    gajiData.id =
      Data.mockGaji.length > 0
        ? Math.max(...Data.mockGaji.map((g) => g.id)) + 1
        : 2001;
    Data.mockGaji.push(gajiData);
  }
  Data.saveToLocalStorage("sppg_gaji", Data.mockGaji);
  Alpine.store("modals").gaji = false;
  renderGajiTable();
  showToast("Data gaji berhasil disimpan.", "success");
}

function renderAbsensiList(tanggal) {
  const listContainer = document.getElementById("absensiList");
  const absensiHariIni = Data.mockAbsensi[tanggal] || [];
  const karyawanAktif = Data.mockKaryawan.filter((k) => k.status === "Aktif");
  listContainer.innerHTML = karyawanAktif
    .map((karyawan) => {
      const absensi = absensiHariIni.find((a) => a.karyawan_id === karyawan.id);
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

function handleSaveAbsensi() {
  const tanggal = document.getElementById("absensiDate").value;
  Data.mockAbsensi[tanggal] = [];
  document.querySelectorAll(".absensi-status-select").forEach((select) => {
    Data.mockAbsensi[tanggal].push({
      karyawan_id: parseInt(select.dataset.karyawanId),
      status: select.value,
    });
  });
  Data.saveToLocalStorage("sppg_absensi", Data.mockAbsensi);
  showToast(
    `Absensi untuk tanggal ${formatDate(tanggal)} berhasil disimpan.`,
    "success"
  );
}

// ===================================================================================
// BAGIAN D: PROFIL & PENGATURAN (Bagian Sistem)
// ===================================================================================
export function setupProfilYayasanPage() {
  document.getElementById("yayasan-nama").textContent =
    Data.mockProfilYayasan.nama;
}

export function setupProfilSppgPage() {
  document.getElementById("sppg-nama").textContent = Data.mockProfilSPPG.nama;
}

// ===================================================================================
// BAGIAN E: EKSPOR HANDLER UNTUK main.js
// ===================================================================================

export const formHandlers = {
  keuanganForm: handleKeuanganFormSubmit,
  asetForm: handleAsetFormSubmit,
  gajiForm: handleGajiFormSubmit,
};

export const deleteHandlers = {
  gaji: (id) => {
    const index = Data.mockGaji.findIndex((g) => g.id === id);
    if (index > -1) {
      Data.mockGaji.splice(index, 1);
      Data.saveToLocalStorage("sppg_gaji", Data.mockGaji);
      renderGajiTable();
      showToast("Data gaji berhasil dihapus.", "success");
    }
  },
  aset: (id) => {
    const index = Data.mockAset.findIndex((a) => a.id === id);
    if (index > -1) {
      Data.mockAset.splice(index, 1);
      Data.saveToLocalStorage("sppg_aset", Data.mockAset);
      renderAsetTable();
      showToast("Data aset berhasil dihapus.", "success");
    }
  },
};