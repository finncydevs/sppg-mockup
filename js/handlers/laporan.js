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
  document.getElementById("kpi-total-porsi").textContent =
    totalPortions.toLocaleString("id-ID");

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
  document.getElementById(
    "kpi-attendance-rate"
  ).textContent = `${attendanceRate}%`;
  document.getElementById(
    "kpi-attendance-detail"
  ).textContent = `${attendedKaryawan} dari ${totalKaryawan} karyawan`;

  // KPI 3: Total Pengadaan Bulan Ini
  const totalProcurement = Data.purchaseOrders
    .filter(
      (p) => p.status !== "Dibatalkan" && p.order_date.startsWith(currentMonth)
    )
    .reduce((sum, p) => sum + p.total_amount, 0);
  document.getElementById("kpi-total-procurement").textContent =
    formatCurrency(totalProcurement);

  // KPI 4: Total Pengeluaran Bulan Ini (Pengadaan + Manual)
  const otherExpenses = Data.mockKeuangan
    .filter((t) => t.type === "Pengeluaran" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  document.getElementById("kpi-total-expense").textContent = formatCurrency(
    totalProcurement + otherExpenses
  );
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

  const deliveriesBySchool = {};
  shipmentsToday.forEach((shipment) => {
    shipment.delivery_lines.forEach((line) => {
      if (!deliveriesBySchool[line.school_id]) {
        deliveriesBySchool[line.school_id] = { qty: 0, recipes: new Set() };
      }
      deliveriesBySchool[line.school_id].qty += line.quantity;
      const recipe = Data.mockRecipes.find((r) => r.id === shipment.recipe_id);
      if (recipe) {
        deliveriesBySchool[line.school_id].recipes.add(recipe.name);
      }
    });
  });

  html += `<table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th class="px-6 py-3">Sekolah Tujuan</th>
                        <th class="px-6 py-3">Menu Terkirim</th>
                        <th class="px-6 py-3 text-right">Jumlah Porsi</th>
                    </tr>
                </thead>
                <tbody>`;

  for (const schoolId in deliveriesBySchool) {
    const school = Data.mockSchools.find((s) => s.id == schoolId);
    const delivery = deliveriesBySchool[schoolId];
    html += `
            <tr class="bg-white border-b">
                <td class="px-6 py-4 font-medium">${school.name}</td>
                <td class="px-6 py-4">${[...delivery.recipes].join(", ")}</td>
                <td class="px-6 py-4 text-right">${delivery.qty.toLocaleString(
                  "id-ID"
                )}</td>
            </tr>
        `;
  }

  const totalPortions = Object.values(deliveriesBySchool).reduce(
    (sum, d) => sum + d.qty,
    0
  );
  html += `   </tbody>
                <tfoot class="font-semibold bg-gray-50">
                    <tr>
                        <td class="px-6 py-3 text-right" colspan="2">Total Porsi Terdistribusi</td>
                        <td class="px-6 py-3 text-right">${totalPortions.toLocaleString(
                          "id-ID"
                        )}</td>
                    </tr>
                </tfoot>
            </table>
        </div>`;

  contentEl.innerHTML = html;
}
