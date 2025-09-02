import * as Data from "../data.js";
import { showToast, formatDate } from "../main.js";

// Variabel untuk menyimpan ID driver yang aktif di halaman ini
let activeDriverId = null;

// Fungsi utama yang dipanggil saat halaman driver dibuka
export function setupDriverPage() {
  const taskListContainer = document.getElementById("driver-task-list");
  const currentUser = Data.appState.currentUser;

  // 1. Periksa apakah peran pengguna adalah 'Driver'
  if (currentUser.role !== "Driver") {
    taskListContainer.innerHTML = `
      <div class="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 class="font-semibold text-yellow-800">Akses Ditolak</h3>
        <p class="text-sm text-yellow-700 mt-1">Halaman ini hanya bisa diakses oleh pengguna dengan peran 'Driver'.</p>
      </div>`;
    return; // Hentikan eksekusi jika bukan driver
  }

  // 2. Cari profil driver di data karyawan/driver berdasarkan nama pengguna yang login
  // Diasumsikan nama di data user sama dengan nama di data driver
  const driverProfile = Data.mockDrivers.find(
    (d) => d.name === currentUser.name
  );

  if (driverProfile) {
    activeDriverId = driverProfile.id; // Simpan ID driver yang ditemukan
    renderDriverTasks(activeDriverId);
  } else {
    // Jika pengguna punya peran 'Driver' tapi tidak ditemukan di daftar driver
    taskListContainer.innerHTML = `
      <div class="text-center p-8 text-gray-500">
        Profil driver untuk "${currentUser.name}" tidak ditemukan.
      </div>`;
  }

  // Tambahkan event listener ke form report
  document
    .getElementById("driverReportForm")
    .addEventListener("submit", handleReportSubmit);
}

// Menampilkan daftar tugas pengiriman untuk driver
function renderDriverTasks(driverId) {
  const taskListContainer = document.getElementById("driver-task-list");
  const today = new Date().toISOString().split("T")[0];

  const myShipment = Data.shipments.find(
    (s) =>
      s.driver_id === driverId &&
      s.departure_time &&
      s.departure_time.startsWith(today)
  );

  if (!myShipment) {
    taskListContainer.innerHTML = `<div class="text-center p-8 text-gray-500">Tidak ada jadwal pengiriman untuk Anda hari ini.</div>`;
    return;
  }

  const recipe = Data.mockRecipes.find((r) => r.id === myShipment.recipe_id);

  taskListContainer.innerHTML = myShipment.delivery_lines
    .map((line) => {
      const school = Data.mockSchools.find((s) => s.id === line.school_id);
      const isReported =
        line.status === "Terkirim" || line.status === "Gagal Kirim";

      return `
      <div class="bg-white p-4 rounded-lg shadow border-l-4 ${
        isReported
          ? line.status === "Terkirim"
            ? "border-green-500"
            : "border-red-500"
          : "border-gray-300"
      }">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-bold text-lg">${school.name}</p>
            <p class="text-sm text-gray-600">${school.address}</p>
          </div>
          <span class="text-xs font-semibold px-2 py-1 rounded-full ${
            isReported
              ? line.status === "Terkirim"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }">${line.status}</span>
        </div>
        <div class="mt-3 pt-3 border-t">
          <p class="text-sm"><span class="text-gray-500">Menu:</span> ${
            recipe.name
          }</p>
          <p class="text-sm"><span class="text-gray-500">Jumlah:</span> ${
            line.quantity
          } Porsi</p>
          ${
            !isReported
              ? `<button onclick="openReportModal(${myShipment.id}, ${line.school_id})" class="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700">
              Laporkan Pengiriman
            </button>`
              : `<div class="mt-4 p-2 bg-gray-50 rounded-md text-xs text-gray-700">
              <p><strong>Penerima:</strong> ${line.receiver_name || "-"}</p>
              <p><strong>Catatan:</strong> ${line.notes || "-"}</p>
            </div>`
          }
        </div>
      </div>
    `;
    })
    .join("");
}

// Fungsi untuk membuka modal laporan
export function openReportModal(shipmentId, schoolId) {
  document.getElementById("driverReportForm").reset();
  document.getElementById("reportShipmentId").value = shipmentId;
  document.getElementById("reportSchoolId").value = schoolId;

  const school = Data.mockSchools.find((s) => s.id === schoolId);
  document.getElementById(
    "reportModalTitle"
  ).textContent = `Laporan Pengiriman: ${school.name}`;

  Alpine.store("modals").driverReport = true;
}

// Fungsi untuk memproses & menyimpan laporan
function handleReportSubmit(e) {
  e.preventDefault();

  const shipmentId = parseInt(
    document.getElementById("reportShipmentId").value
  );
  const schoolId = parseInt(document.getElementById("reportSchoolId").value);

  const shipment = Data.shipments.find((s) => s.id === shipmentId);
  const deliveryLine = shipment.delivery_lines.find(
    (l) => l.school_id === schoolId
  );

  if (deliveryLine) {
    deliveryLine.status = document.getElementById("reportStatus").value;
    deliveryLine.receiver_name =
      document.getElementById("reportReceiverName").value;
    deliveryLine.notes = document.getElementById("reportNotes").value;
    deliveryLine.report_time = new Date().toISOString();
  }

  Data.saveToLocalStorage("sppg_shipments", Data.shipments);
  Alpine.store("modals").driverReport = false;
  showToast("Laporan berhasil dikirim.", "success");

  // Gunakan ID driver yang sudah disimpan untuk me-refresh daftar
  renderDriverTasks(activeDriverId);
}
