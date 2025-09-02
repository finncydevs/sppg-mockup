// js/handlers/laporan.js
import * as Data from "../data.js";
import {
  showToast,
  formatDate,
  formatInputDate,
  formatCurrency,
} from "../main.js";
// ===================================================================================
// BAGIAN A: DASHBOARD / PELAPORAN
// ===================================================================================
// Ganti seluruh fungsi setupPelaporanPage Anda dengan ini:
export function setupPelaporanPage() {
  const today = new Date();
  const todayStr = formatInputDate(today);
  const currentMonth = todayStr.substring(0, 7);

  // KPI 1: Porsi Terdistribusi Hari Ini
  const totalPortions = Data.shipments
    .filter(
      (s) => s.status === "Selesai" && s.departure_time?.startsWith(todayStr)
    )
    .flatMap((s) => s.delivery_lines)
    .filter((l) => l.status === "Terkirim")
    .reduce((sum, l) => sum + l.quantity, 0);
  
  const kpiPorsiElement = document.getElementById("kpi-total-porsi");
  if (kpiPorsiElement) {
    kpiPorsiElement.textContent = totalPortions.toLocaleString("id-ID");
  }

  // KPI 2: Kehadiran Karyawan Hari Ini
  const attendedKaryawan = (Data.mockAbsensi[todayStr] || []).filter(
    (a) => a.status === "Hadir"
  ).length;
  const totalKaryawan = Data.mockKaryawan.filter(
    (k) => k.status === "Aktif"
  ).length;
  const attendanceRate =
    totalKaryawan > 0
      ? ((attendedKaryawan / totalKaryawan) * 100).toFixed(0)
      : 0;

  const kpiAttendanceRate = document.getElementById("kpi-attendance-rate");
  if (kpiAttendanceRate) {
    kpiAttendanceRate.textContent = `${attendanceRate}%`;
  }

  const kpiAttendanceDetail = document.getElementById("kpi-attendance-detail");
  if (kpiAttendanceDetail) {
    kpiAttendanceDetail.textContent = `${attendedKaryawan} dari ${totalKaryawan} karyawan`;
  }


  // KPI 3: Total Pengadaan Bulan Ini
  const totalProcurement = Data.purchaseOrders
    .filter(
      (p) => p.status !== "Dibatalkan" && p.order_date.startsWith(currentMonth)
    )
    .reduce((sum, p) => sum + p.total_amount, 0);

  const kpiProcurement = document.getElementById("kpi-total-procurement");
  if (kpiProcurement) {
    kpiProcurement.textContent = formatCurrency(totalProcurement);
  }

  // KPI 4: Total Pengeluaran Bulan Ini (Pengadaan + Manual)
  const otherExpenses = Data.mockKeuangan
    .filter((t) => t.type === "Pengeluaran" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const kpiExpense = document.getElementById("kpi-total-expense");
  if (kpiExpense) {
    kpiExpense.textContent = formatCurrency(totalProcurement + otherExpenses);
  }
}

// ===================================================================================
// BAGIAN B: LAPORAN PENGANTARAN
// ===================================================================================
export function setupLaporanPengantaranPage() {
  const dateInput = document.getElementById("laporan-tanggal");
  dateInput.value = formatInputDate(new Date());
  dateInput.addEventListener("change", generateLaporanPengantaran);
  document.getElementById("printLaporanBtn").addEventListener("click", () => {
    const content = document.getElementById("laporan-content").innerHTML;
    if (content.includes("Tidak ada pengantaran")) {
      showToast("Tidak ada data untuk dicetak.", "error");
      return;
    }
    window.print();
  });
  generateLaporanPengantaran();
}

function generateLaporanPengantaran() {
  const date = document.getElementById("laporan-tanggal").value;
  const shipmentsToday = Data.shipments.filter(
    (s) =>
      s.departure_time &&
      s.departure_time.startsWith(date) &&
      s.status === "Selesai"
  );
  const contentEl = document.getElementById("laporan-content");

  if (shipmentsToday.length === 0) {
    contentEl.innerHTML = `<div class="text-center text-gray-500 mt-8 p-4 border rounded-lg">Tidak ada data pengantaran pada tanggal ${formatDate(
      date
    )}.</div>`;
    return;
  }

  let html = `
    <div id="print-area">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold">${Data.mockProfilSPPG.nama}</h2>
        <p class="text-sm">${Data.mockProfilSPPG.alamat}</p>
        <h3 class="text-xl font-semibold mt-4">Laporan Pengantaran Harian</h3>
        <p>Tanggal: ${formatDate(date)}</p>
      </div>
  `;

  // Group deliveries by school
  const deliveriesBySchool = {};
  shipmentsToday.forEach((shipment) => {
    shipment.delivery_lines.forEach((line) => {
      if (!deliveriesBySchool[line.school_id]) {
        deliveriesBySchool[line.school_id] = {
          school: Data.mockSchools.find((s) => s.id == line.school_id),
          deliveries: [],
        };
      }
      deliveriesBySchool[line.school_id].deliveries.push({
        shipment,
        line,
      });
    });
  });

  // Generate documents for each school
  for (const schoolId in deliveriesBySchool) {
    const { school, deliveries } = deliveriesBySchool[schoolId];
    const totalQuantity = deliveries.reduce(
      (sum, d) => sum + d.line.quantity,
      0
    );

    // Pengiriman MBG Document
    html += generateDeliveryDocument(
      "Serah Terima Paket Makanan", // Judul bisa lebih umum
      school,
      deliveries[0].shipment.departure_time,
      totalQuantity
    );
  }

  html += `</div>`;
  contentEl.innerHTML = html;
}

function generateDeliveryDocument(type, school, departureTime, quantity) {
  const date = new Date(departureTime);
  const formattedDate = formatDate(date.toISOString().split("T")[0]);
  const formattedTime = date.toTimeString().substring(0, 5);

  return `
    <div class="document-container mb-8 page-break">
      <div class="border-2 border-black p-6">
        <h3 class="text-center text-lg font-bold mb-2">BERITA ACARA PENGERIMAAN PAKET MAKANAN</h3>
        <h3 class="text-center text-lg font-bold mb-4">PROGRAM MAKAN BERGIZI</h3>
        
        <div class="flex justify-between mb-6">
          <div class="w-1/2">
            <h4 class="text-center font-semibold border-b-2 border-black pb-1">${type}</h4>
          </div>
          <div class="w-1/2">
            <div class="flex justify-between">
              <span>Tanggal:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="flex justify-between">
              <span>Waktu:</span>
              <span>${formattedTime}</span>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <div class="flex justify-between mb-2">
            <span>Jumlah Paket Makanan:</span>
            <span class="font-semibold">${quantity.toLocaleString(
              "id-ID"
            )}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span>Dikirim dari:</span>
            <span>${Data.mockProfilSPPG.nama}</span>
          </div>
          <div class="flex justify-between">
            <span>Diterima oleh:</span>
            <span>${school.contact_person || school.name}</span>
          </div>
        </div>
        
        <div class="flex justify-between mt-8">
          <div class="text-center w-1/2">
            <p>Dikirim oleh,</p>
            <div class="h-16 border-b border-black my-2"></div>
            <p>${Data.mockProfilSPPG.nama}</p>
          </div>
          <div class="text-center w-1/2">
            <p>Diterima oleh,</p>
            <div class="h-16 border-b border-black my-2"></div>
            <p>${school.contact_person || school.name}</p>
          </div>
        </div>
        
        <div class="mt-6 text-right">
          <p>Hubungi: ${Data.mockProfilSPPG.telepon || "-"}</p>
        </div>
        
        <div class="mt-4 text-center text-gray-500">
          <p>(Stempel)</p>
        </div>
      </div>
    </div>
  `;
}
