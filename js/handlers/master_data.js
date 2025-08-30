// js/handlers/master_data.js

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
// BAGIAN A: MASTER KARYAWAN (Halaman Master)
// ===================================================================================

export function setupMasterKaryawanPage() {
  renderKaryawanTable();
}

// Fungsi render ini dipanggil juga oleh administrasi.js setelah update, jadi diekspor
export function renderKaryawanTable() {
  const tableBody = document.getElementById("karyawanTableBody");
  tableBody.innerHTML = Data.mockKaryawan
    .map(
      (k) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${k.nama}</td>
            <td class="px-6 py-4">${k.posisi}</td>
            <td class="px-6 py-4">${formatDate(k.tgl_bergabung)}</td>
            <td class="px-6 py-4 text-center">${getStatusBadge(k.status)}</td>
            <td class="px-6 py-4 text-center space-x-4">
                <button onclick="openKaryawanModal(${
                  k.id
                })" class="text-blue-600 hover:underline font-medium">Edit</button>
                <button onclick="openDeleteModal('karyawan', ${
                  k.id
                }, '${k.nama.replace(
        /'/g,
        "\\'"
      )}')" class="text-red-600 hover:underline font-medium">Hapus</button>
            </td>
        </tr>
    `
    )
    .join("");
}

// ===================================================================================
// BAGIAN B: MASTER SUPPLIER
// ===================================================================================

export function setupMasterSupplierPage() {
  renderMasterDataSuppliersTable();
}

function renderMasterDataSuppliersTable() {
  const tableBody = document.getElementById("master-suppliers-table");
  tableBody.innerHTML = Data.mockSuppliers
    .map(
      (s) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${s.name}</td>
            <td class="px-6 py-4">${s.contact_person}</td>
            <td class="px-6 py-4">${s.phone}</td>
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

export function openSupplierModal(id = null) {
  const form = document.getElementById("supplierForm");
  form.reset();
  document.getElementById("supplierId").value = "";
  if (id) {
    const supplier = Data.mockSuppliers.find((s) => s.id === id);
    document.getElementById("modalTitleSupplier").textContent = "Edit Supplier";
    document.getElementById("supplierId").value = supplier.id;
    document.getElementById("supplierName").value = supplier.name;
    document.getElementById("supplierContact").value = supplier.contact_person;
    document.getElementById("supplierPhone").value = supplier.phone;
    document.getElementById("supplierEmail").value = supplier.email;
    document.getElementById("supplierAddress").value = supplier.address;
  } else {
    document.getElementById("modalTitleSupplier").textContent =
      "Tambah Supplier Baru";
  }
  Alpine.store("modals").supplier = true;
}

function handleSupplierFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("supplierId").value;
  const supplierData = {
    name: document.getElementById("supplierName").value.trim(),
    contact_person: document.getElementById("supplierContact").value.trim(),
    phone: document.getElementById("supplierPhone").value.trim(),
    email: document.getElementById("supplierEmail").value.trim(),
    address: document.getElementById("supplierAddress").value.trim(),
  };

  if (!supplierData.name) {
    showToast("Nama Perusahaan tidak boleh kosong.", "error");
    return;
  }

  if (id) {
    const index = Data.mockSuppliers.findIndex((s) => s.id == id);
    Data.mockSuppliers[index] = {
      ...Data.mockSuppliers[index],
      ...supplierData,
    };
    showToast("Data supplier berhasil diperbarui.", "success");
  } else {
    const newId =
      Data.mockSuppliers.length > 0
        ? Math.max(...Data.mockSuppliers.map((s) => s.id)) + 1
        : 1;
    Data.mockSuppliers.push({ id: newId, ...supplierData });
    showToast("Supplier baru berhasil ditambahkan.", "success");
  }

  Data.saveToLocalStorage("sppg_suppliers", Data.mockSuppliers);
  Alpine.store("modals").supplier = false;
  renderMasterDataSuppliersTable();
}

// ===================================================================================
// BAGIAN C: MASTER SEKOLAH
// ===================================================================================

export function setupMasterSekolahPage() {
  renderMasterDataSchoolsTable();
}

function renderMasterDataSchoolsTable() {
  const tableBody = document.getElementById("master-schools-table");
  tableBody.innerHTML = Data.mockSchools
    .map(
      (s) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${s.name}</td>
            <td class="px-6 py-4">${s.principal_name}</td>
            <td class="px-6 py-4">${s.phone}</td>
            <td class="px-6 py-4 text-center space-x-2">
                <button onclick="openSchoolModal(${
                  s.id
                })" class="text-blue-600 hover:underline font-medium text-sm">Edit</button>
                <button onclick="openDeleteModal('school', ${
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

export function openSchoolModal(id = null) {
  document.getElementById("schoolForm").reset();
  document.getElementById("schoolId").value = "";
  if (id) {
    const school = Data.mockSchools.find((s) => s.id === id);
    document.getElementById("modalTitleSchool").textContent = "Edit Sekolah";
    document.getElementById("schoolId").value = school.id;
    document.getElementById("schoolName").value = school.name;
    document.getElementById("schoolPrincipal").value = school.principal_name;
    document.getElementById("schoolPhone").value = school.phone;
    document.getElementById("schoolAddress").value = school.address;
  } else {
    document.getElementById("modalTitleSchool").textContent =
      "Tambah Sekolah Baru";
  }
  Alpine.store("modals").school = true;
}

function handleSchoolFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("schoolId").value;
  const schoolData = {
    name: document.getElementById("schoolName").value.trim(),
    principal_name: document.getElementById("schoolPrincipal").value.trim(),
    phone: document.getElementById("schoolPhone").value.trim(),
    address: document.getElementById("schoolAddress").value.trim(),
  };

  if (!schoolData.name || !schoolData.address) {
    showToast("Nama dan alamat sekolah harus diisi.", "error");
    return;
  }

  if (id) {
    const index = Data.mockSchools.findIndex((s) => s.id == id);
    Data.mockSchools[index] = { ...Data.mockSchools[index], ...schoolData };
    showToast("Data sekolah berhasil diperbarui.", "success");
  } else {
    const newId =
      Data.mockSchools.length > 0
        ? Math.max(...Data.mockSchools.map((s) => s.id)) + 1
        : 501;
    Data.mockSchools.push({ id: newId, ...schoolData });
    showToast("Sekolah baru berhasil ditambahkan.", "success");
  }
  Data.saveToLocalStorage("sppg_schools", Data.mockSchools);
  Alpine.store("modals").school = false;
  renderMasterDataSchoolsTable();
}

// ===================================================================================
// BAGIAN D: MASTER PENGGUNA
// ===================================================================================

export function setupMasterUserPage() {
  renderMasterDataUsersTable();
}

function renderMasterDataUsersTable() {
  const tableBody = document.getElementById("master-users-table");
  tableBody.innerHTML = Data.mockUsers
    .map(
      (u) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${u.name}</td>
            <td class="px-6 py-4">${u.role}</td>
            <td class="px-6 py-4 text-center space-x-2">
                <button onclick="openUserModal(${
                  u.id
                })" class="text-blue-600 hover:underline font-medium text-sm">Edit</button>
                <button onclick="openDeleteModal('user', ${
                  u.id
                }, '${u.name.replace(
        /'/g,
        "\\'"
      )}')" class="text-red-600 hover:underline font-medium text-sm">Hapus</button>
            </td>
        </tr>
    `
    )
    .join("");
}

export function openUserModal(id = null) {
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";
  if (id) {
    const user = Data.mockUsers.find((u) => u.id === id);
    document.getElementById("modalTitleUser").textContent = "Edit Pengguna";
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userRole").value = user.role;
  } else {
    document.getElementById("modalTitleUser").textContent =
      "Tambah Pengguna Baru";
  }
  Alpine.store("modals").user = true;
}

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
    const index = Data.mockUsers.findIndex((u) => u.id == id);
    Data.mockUsers[index] = { ...Data.mockUsers[index], ...userData };
    showToast("Data pengguna berhasil diperbarui.", "success");
  } else {
    const newId =
      Data.mockUsers.length > 0
        ? Math.max(...Data.mockUsers.map((u) => u.id)) + 1
        : 901;
    Data.mockUsers.push({ id: newId, ...userData });
    showToast("Pengguna baru berhasil ditambahkan.", "success");
  }
  Data.saveToLocalStorage("sppg_users", Data.mockUsers);
  Alpine.store("modals").user = false;
  renderMasterDataUsersTable();
}

// ===================================================================================
// BAGIAN E: EKSPOR HANDLER
// ===================================================================================
export const formHandlers = {
  supplierForm: handleSupplierFormSubmit,
  schoolForm: handleSchoolFormSubmit,
  userForm: handleUserFormSubmit,
};

// PERBAIKAN: Seluruh delete handler diubah menggunakan findIndex dan splice
export const deleteHandlers = {
  karyawan: (id) => {
    const index = Data.mockKaryawan.findIndex((k) => k.id === id);
    if (index > -1) {
      Data.mockKaryawan.splice(index, 1);
      Data.saveToLocalStorage("sppg_karyawan", Data.mockKaryawan);
      renderKaryawanTable();
      showToast("Data karyawan berhasil dihapus.", "success");
    }
  },
  supplier: (id) => {
    const index = Data.mockSuppliers.findIndex((s) => s.id === id);
    if (index > -1) {
      Data.mockSuppliers.splice(index, 1);
      Data.saveToLocalStorage("sppg_suppliers", Data.mockSuppliers);
      renderMasterDataSuppliersTable();
      showToast("Supplier berhasil dihapus.", "success");
    }
  },
  school: (id) => {
    const index = Data.mockSchools.findIndex((s) => s.id === id);
    if (index > -1) {
      Data.mockSchools.splice(index, 1);
      Data.saveToLocalStorage("sppg_schools", Data.mockSchools);
      renderMasterDataSchoolsTable();
      showToast("Sekolah berhasil dihapus.", "success");
    }
  },
  user: (id) => {
    const index = Data.mockUsers.findIndex((u) => u.id === id);
    if (index > -1) {
      Data.mockUsers.splice(index, 1);
      Data.saveToLocalStorage("sppg_users", Data.mockUsers);
      renderMasterDataUsersTable();
      showToast("Pengguna berhasil dihapus.", "success");
    }
  },
};
/**
 * Renders the profile view (read-only mode).
 * @param {string} type - 'yayasan' or 'sppg'.
 */
function renderProfilView(type) {
  const contentEl = document.getElementById("master-content"); // Assumes this is your main content container
  const isYayasan = type === "yayasan";
  const data = isYayasan ? Data.mockProfilYayasan : Data.mockProfilSPPG;
  const title = isYayasan ? "Profil Yayasan" : "Profil SPPG";
  const fields = isYayasan
    ? {
        "Nama Yayasan": data.nama,
        Alamat: data.alamat,
        Telepon: data.telp,
        Email: data.email,
        Pimpinan: data.pimpinan,
      }
    : {
        "Nama SPPG": data.nama,
        Alamat: data.alamat,
        Telepon: data.telp,
        Email: data.email,
        "Penanggung Jawab": data.penanggung_jawab,
      };

  let fieldsHtml = "";
  for (const [label, value] of Object.entries(fields)) {
    fieldsHtml += `
      <div>
        <label class="text-sm font-medium text-gray-500">${label}</label>
        <p class="text-gray-800 font-semibold mt-1">${value || "-"}</p>
      </div>`;
  }

  contentEl.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6 border-b pb-4">
        <h3 class="text-xl font-semibold text-gray-800">${title}</h3>
        <button id="editProfilBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">
            Edit Profil
        </button>
      </div>
      <div class="space-y-4">
        ${fieldsHtml}
      </div>
    </div>`;

  document
    .getElementById("editProfilBtn")
    .addEventListener("click", () => renderProfilEdit(type));
}

/**
 * Renders the profile edit form.
 * @param {string} type - 'yayasan' or 'sppg'.
 */
function renderProfilEdit(type) {
  const contentEl = document.getElementById("master-content");
  const isYayasan = type === "yayasan";
  const data = isYayasan ? Data.mockProfilYayasan : Data.mockProfilSPPG;
  const title = isYayasan ? "Profil Yayasan" : "Profil SPPG";
  const personFieldLabel = isYayasan ? "Pimpinan" : "Penanggung Jawab";
  const personFieldValue = isYayasan ? data.pimpinan : data.penanggung_jawab;

  contentEl.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <form id="profilForm">
        <div class="flex justify-between items-center mb-6 border-b pb-4">
          <h3 class="text-xl font-semibold text-gray-800">Edit ${title}</h3>
          <div class="space-x-2">
            <button type="button" id="cancelProfilBtn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold text-sm">
                Batal
            </button>
            <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm">
                Simpan Perubahan
            </button>
          </div>
        </div>
        <div class="space-y-4">
          <div>
              <label for="profil-nama" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
              <input type="text" id="profil-nama" value="${data.nama}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required>
          </div>
          <div>
              <label for="profil-alamat" class="block mb-2 text-sm font-medium text-gray-900">Alamat</label>
              <textarea id="profil-alamat" rows="3" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">${data.alamat}</textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="profil-telp" class="block mb-2 text-sm font-medium text-gray-900">Telepon</label>
                <input type="tel" id="profil-telp" value="${data.telp}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            </div>
            <div>
                <label for="profil-email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                <input type="email" id="profil-email" value="${data.email}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            </div>
          </div>
          <div>
              <label for="profil-person" class="block mb-2 text-sm font-medium text-gray-900">${personFieldLabel}</label>
              <input type="text" id="profil-person" value="${personFieldValue}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
          </div>
        </div>
      </form>
    </div>`;

  document
    .getElementById("cancelProfilBtn")
    .addEventListener("click", () => renderProfilView(type));
  document
    .getElementById("profilForm")
    .addEventListener("submit", (e) => handleProfilFormSubmit(e, type));
}

/**
 * Handles the submission of the profile edit form.
 * @param {Event} e - The form submission event.
 * @param {string} type - 'yayasan' or 'sppg'.
 */
function handleProfilFormSubmit(e, type) {
  e.preventDefault();
  const isYayasan = type === "yayasan";

  if (isYayasan) {
    Data.mockProfilYayasan.nama = document.getElementById("profil-nama").value;
    Data.mockProfilYayasan.alamat = document.getElementById("profil-alamat").value;
    Data.mockProfilYayasan.telp = document.getElementById("profil-telp").value;
    Data.mockProfilYayasan.email = document.getElementById("profil-email").value;
    Data.mockProfilYayasan.pimpinan = document.getElementById("profil-person").value;
    Data.saveToLocalStorage("sppg_profilYayasan", Data.mockProfilYayasan);
  } else {
    Data.mockProfilSPPG.nama = document.getElementById("profil-nama").value;
    Data.mockProfilSPPG.alamat = document.getElementById("profil-alamat").value;
    Data.mockProfilSPPG.telp = document.getElementById("profil-telp").value;
    Data.mockProfilSPPG.email = document.getElementById("profil-email").value;
    Data.mockProfilSPPG.penanggung_jawab = document.getElementById("profil-person").value;
    Data.saveToLocalStorage("sppg_profilSppg", Data.mockProfilSPPG);
  }

  showToast("Profil berhasil diperbarui.", "success");
  renderProfilView(type);
}

// Setup functions to be called by the main router/app logic
export function setupProfilYayasanPage() {
  renderProfilView("yayasan");
}

export function setupProfilSppgPage() {
  renderProfilView("sppg");
}