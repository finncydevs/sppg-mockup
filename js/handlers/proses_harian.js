import * as Data from "../data.js";
import * as UI from "../ui.js";
import {
  showToast,
  generateSelectOptions,
  formatDate,
  formatInputDate,
  formatCurrency,
  getStatusBadge,
} from "../main.js";

// ===================================================================================
// BAGIAN A: PENGADAAN & PENERIMAAN
// ===================================================================================
export function setupPengadaanPage() {
  renderPOTable();
  document
    .getElementById("searchInputPO")
    .addEventListener("input", renderPOTable);
  document
    .getElementById("statusFilterPO")
    .addEventListener("change", renderPOTable);
  document
    .getElementById("createPOButton")
    .addEventListener("click", () => openPOModal());
}

function renderPOTable() {
  const search = document.getElementById("searchInputPO").value.toLowerCase();
  const status = document.getElementById("statusFilterPO").value;
  const filteredPOs = Data.purchaseOrders.filter(
    (po) =>
      (po.po_number.toLowerCase().includes(search) ||
        Data.mockSuppliers
          .find((s) => s.id === po.supplier_id)
          ?.name.toLowerCase()
          .includes(search)) &&
      (status === "all" || po.status === status)
  );
  const tableBody = document.getElementById("poTableBody");
  tableBody.innerHTML = filteredPOs
    .map((po) => {
      const supplier = Data.mockSuppliers.find((s) => s.id === po.supplier_id);
      const canReceive =
        po.status === "Disetujui" || po.status === "Diterima Sebagian";
      return `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${
                  po.po_number
                }</td>
                <td class="px-6 py-4">${supplier?.name || "N/A"}</td>
                <td class="px-6 py-4">${formatDate(po.order_date)}</td>
                <td class="px-6 py-4 text-right font-medium">${formatCurrency(
                  po.total_amount
                )}</td>
                <td class="px-6 py-4 text-center">${getStatusBadge(
                  po.status
                )}</td>
                <td class="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                    ${
                      canReceive
                        ? `<button onclick="openReceiptModal(${po.id})" class="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700">Terima Barang</button>`
                        : ""
                    }
                    <button onclick="openPOModal(${
                      po.id
                    })" class="text-blue-600 hover:underline text-xs">Edit</button>
                    ${
                      po.status === "Draft"
                        ? `<button onclick="openDeleteModal('po', ${po.id}, '${po.po_number}')" class="text-red-600 hover:underline text-xs">Hapus</button>`
                        : ""
                    }
                </td>
            </tr>`;
    })
    .join("");
}

export function addPOItemLine(item = {}) {
  const container = document.getElementById("itemLines");
  const newLine = document.createElement("div");
  newLine.className = "item-line grid grid-cols-12 gap-4 items-center";
  newLine.innerHTML = `<div class="col-span-6"><select class="item-select bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" onchange="updatePOTotalAmount()">${generateSelectOptions(
    Data.mockItems,
    "id",
    "name"
  )}</select></div><div class="col-span-3"><input type="number" min="1" value="${
    item.quantity || 1
  }" class="quantity-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5" oninput="updatePOTotalAmount()"></div><div class="col-span-3 flex justify-end"><button type="button" class="remove-item-btn text-red-500 hover:text-red-700 font-medium" onclick="this.closest('.item-line').remove(); updatePOTotalAmount();">Hapus</button></div>`;
  container.appendChild(newLine);
  if (item.item_id) newLine.querySelector(".item-select").value = item.item_id;
}

export function updatePOTotalAmount() {
  let total = 0;
  document.querySelectorAll("#itemLines .item-line").forEach((line) => {
    const item = Data.mockItems.find(
      (i) => i.id == line.querySelector(".item-select").value
    );
    const quantity = line.querySelector(".quantity-input").value;
    if (item && quantity > 0) total += item.price * quantity;
  });
  document.getElementById("totalAmount").textContent = formatCurrency(total);
}

export function openPOModal(poId = null) {
  const form = document.getElementById("poForm");
  form.reset();
  document.getElementById("poId").value = "";
  document.getElementById("itemLines").innerHTML = "";
  document.getElementById("supplier").innerHTML = generateSelectOptions(
    Data.mockSuppliers,
    "id",
    "name"
  );
  if (poId) {
    const po = Data.purchaseOrders.find((p) => p.id === poId);
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
    document.getElementById("orderDate").value = formatInputDate(new Date());
    addPOItemLine();
  }
  updatePOTotalAmount();
  Alpine.store("modals").po = true;
}

function handlePOSubmit(e) {
  e.preventDefault();
  const poId = document.getElementById("poId").value;
  const items = [];
  let totalAmount = 0;
  document.querySelectorAll("#itemLines .item-line").forEach((line) => {
    const itemId = parseInt(line.querySelector(".item-select").value);
    const quantity = parseInt(line.querySelector(".quantity-input").value);
    const item = Data.mockItems.find((i) => i.id === itemId);
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
    const poIndex = Data.purchaseOrders.findIndex((p) => p.id == poId);
    if (poIndex > -1) {
      const existingPo = Data.purchaseOrders[poIndex];
      const updatedItems = poData.items.map((newItem) => {
        const oldItem = existingPo.items.find(
          (i) => i.item_id === newItem.item_id
        );
        return { ...newItem, received_qty: oldItem ? oldItem.received_qty : 0 };
      });
      Data.purchaseOrders[poIndex] = {
        ...existingPo,
        ...poData,
        items: updatedItems,
      };
      showToast("PO berhasil diperbarui.", "success");
    }
  } else {
    const newId =
      Data.purchaseOrders.length > 0
        ? Math.max(...Data.purchaseOrders.map((p) => p.id)) + 1
        : 1;
    const today = new Date(poData.order_date);
    const poNumber = `PO-${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(newId).padStart(3, "0")}`;
    const newPO = {
      ...poData,
      id: newId,
      po_number: poNumber,
      expected_delivery_date: formatInputDate(
        new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
      ),
      status: "Draft",
    };
    Data.purchaseOrders.push(newPO);
    showToast("PO baru berhasil dibuat.", "success");
  }
  Data.saveToLocalStorage("sppg_purchaseOrders", Data.purchaseOrders);
  Alpine.store("modals").po = false;
  renderPOTable();
}

export function openReceiptModal(poId) {
  const po = Data.purchaseOrders.find((p) => p.id === poId);
  if (!po) return;
  document.getElementById("receiptPoId").value = poId;
  document.getElementById(
    "receiptModalTitle"
  ).textContent = `Penerimaan Barang untuk PO: ${po.po_number}`;
  const container = document.getElementById("receiptItemLines");
  container.innerHTML = po.items
    .map((item) => {
      const masterItem = Data.mockItems.find((i) => i.id === item.item_id);
      const remainingQty = item.quantity - (item.received_qty || 0);
      if (remainingQty <= 0) return "";
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
}

function handleReceiptSubmit(e) {
  e.preventDefault();
  const poId = parseInt(document.getElementById("receiptPoId").value);
  const po = Data.purchaseOrders.find((p) => p.id === poId);
  if (!po) return;
  const receiptDate = formatInputDate(new Date());
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
          formatInputDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      };
      Data.inventoryLots.push(newLot);
    }
  });
  if (itemsReceived === 0) {
    showToast("Tidak ada item yang diterima.", "error");
    return;
  }
  po.status = po.items.every((i) => (i.received_qty || 0) >= i.quantity)
    ? "Diterima Penuh"
    : "Diterima Sebagian";
  Data.saveToLocalStorage("sppg_inventoryLots", Data.inventoryLots);
  Data.saveToLocalStorage("sppg_purchaseOrders", Data.purchaseOrders);
  showToast("Penerimaan barang berhasil disimpan.", "success");
  Alpine.store("modals").receipt = false;
  renderPOTable();
}

// ===================================================================================
// BAGIAN B: PRODUKSI & STOK (TERMASUK MASTER ITEM)
// ===================================================================================
export function setupProduksiStokPage() {
  const content = document.getElementById("production-content");
  const tabs = document.querySelectorAll("#production-tabs .tab-button");
  const renderTabContent = (tabId) => {
    tabs.forEach((t) => {
      t.classList.remove("tab-active", "border-blue-600", "text-blue-600");
      t.classList.add("border-transparent", "text-gray-500");
    });
    const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
    activeTab.classList.add("tab-active", "border-blue-600", "text-blue-600");
    if (tabId === "stok") {
      content.innerHTML = UI.stokTabContent;
      document
        .getElementById("stockSearchInput")
        .addEventListener("input", renderStockTable);
      renderStockTable();
    } else if (tabId === "produksi") {
      content.innerHTML = UI.produksiTabContent;
      renderWorkOrderList();
    } else if (tabId === "item") {
      content.innerHTML = UI.masterItemTabContent;
      renderMasterDataItemsTable();
    }
  };
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => renderTabContent(tab.dataset.tab))
  );
  renderTabContent("stok"); // Default
}

function renderStockTable() {
  const search =
    document.getElementById("stockSearchInput")?.value.toLowerCase() || "";
  const aggregatedStock = Data.mockItems
    .map((item) => {
      const lots = Data.inventoryLots.filter((l) => l.item_id === item.id);
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
        item.totalQuantity > 0 && item.name.toLowerCase().includes(search)
    );
  document.getElementById("stockTableBody").innerHTML = aggregatedStock
    .map(
      (item) =>
        `<tr class="bg-white border-b"><td class="px-6 py-4 font-medium">${
          item.name
        }</td><td class="text-center">${item.totalQuantity.toLocaleString(
          "id-ID"
        )} ${item.unit}</td><td class="px-6 py-4">${
          item.nearestExpiry ? formatDate(item.nearestExpiry) : "N/A"
        }</td><td class="text-center"><button onclick="openLotDetailModal(${
          item.id
        })" class="text-blue-600 hover:underline text-sm">Lihat Lot</button></td></tr>`
    )
    .join("");
}

export function openLotDetailModal(itemId) {
  const item = Data.mockItems.find((i) => i.id === itemId);
  const lots = Data.inventoryLots.filter((l) => l.item_id === itemId);
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
}

function renderWorkOrderList() {
  const listEl = document.getElementById("workOrderList");
  listEl.innerHTML = Data.workOrders
    .map((wo) => {
      const recipe = Data.mockRecipes.find((r) => r.id === wo.recipe_id);
      return `<div class="bg-white border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"><div><div class="flex justify-between items-start"><p class="font-semibold">${
        recipe?.name || "Resep tidak ada"
      }</p>${getStatusBadge(wo.status)}</div><p class="text-sm text-gray-500">${
        wo.wo_number
      } (${formatDate(
        wo.production_date
      )})</p></div><div class="mt-4 flex justify-between items-end"><div><p class="text-xs">Target</p><p class="text-xl font-bold text-blue-600">${wo.target_quantity.toLocaleString(
        "id-ID"
      )} Porsi</p></div><div class="space-x-2"><button onclick="openWorkOrderModal(${
        wo.id
      })" class="text-blue-600 hover:underline text-sm">Edit</button><button onclick="openDeleteModal('produksi', ${
        wo.id
      }, '${
        wo.wo_number
      }')" class="text-red-600 hover:underline text-sm">Hapus</button></div></div></div>`;
    })
    .join("");
}

export function openWorkOrderModal(id = null) {
  const form = document.getElementById("workOrderForm");
  form.reset();
  document.getElementById("workOrderId").value = "";
  document.getElementById("woRecipeId").innerHTML = generateSelectOptions(
    Data.mockRecipes,
    "id",
    "name"
  );
  if (id) {
    const wo = Data.workOrders.find((w) => w.id === id);
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
    document.getElementById("woProductionDate").value = formatInputDate(
      new Date()
    );
  }
  Alpine.store("modals").workOrder = true;
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
  if (!woData.recipe_id || !woData.target_quantity || !woData.production_date) {
    showToast("Semua field harus diisi.", "error");
    return;
  }
  if (id) {
    const index = Data.workOrders.findIndex((wo) => wo.id == id);
    Data.workOrders[index] = { ...Data.workOrders[index], ...woData };
    showToast("Perintah Kerja berhasil diperbarui.", "success");
  } else {
    const newId =
      Data.workOrders.length > 0
        ? Math.max(...Data.workOrders.map((wo) => wo.id)) + 1
        : 201;
    const woCountForDate =
      Data.workOrders.filter(
        (wo) => wo.production_date === woData.production_date
      ).length + 1;
    const dateStr = woData.production_date.replace(/-/g, "");
    const newWO = {
      ...woData,
      id: newId,
      wo_number: `WO-${dateStr}-${String(woCountForDate).padStart(2, "0")}`,
      status: "Direncanakan",
    };
    Data.workOrders.push(newWO);
    showToast("Perintah Kerja berhasil dibuat.", "success");
  }
  Data.saveToLocalStorage("sppg_workOrders", Data.workOrders);
  Alpine.store("modals").workOrder = false;
  renderWorkOrderList();
}

function renderMasterDataItemsTable() {
  const tableBody = document.getElementById("master-items-table");
  tableBody.innerHTML = Data.mockItems
    .map(
      (item) =>
        `<tr class="bg-white border-b hover:bg-gray-50"><td class="px-6 py-4">${
          item.id
        }</td><td class="px-6 py-4 font-medium">${
          item.name
        }</td><td class="px-6 py-4">${
          item.unit
        }</td><td class="px-6 py-4 text-right">${formatCurrency(
          item.price
        )}</td><td class="px-6 py-4 text-center space-x-2"><button onclick="openItemModal(${
          item.id
        })" class="text-blue-600 hover:underline font-medium text-sm">Edit</button><button onclick="openDeleteModal('item', ${
          item.id
        }, '${item.name.replace(
          /'/g,
          "\\'"
        )}')" class="text-red-600 hover:underline font-medium text-sm">Hapus</button></td></tr>`
    )
    .join("");
}

export function openItemModal(id = null) {
  document.getElementById("itemForm").reset();
  document.getElementById("itemId").value = "";
  if (id) {
    const item = Data.mockItems.find((i) => i.id === id);
    document.getElementById("modalTitleItem").textContent = "Edit Item";
    document.getElementById("itemId").value = item.id;
    document.getElementById("itemName").value = item.name;
    document.getElementById("itemUnit").value = item.unit;
    document.getElementById("itemPrice").value = item.price;
  } else {
    document.getElementById("modalTitleItem").textContent = "Tambah Item Baru";
  }
  Alpine.store("modals").item = true;
}

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
    const index = Data.mockItems.findIndex((i) => i.id == id);
    Data.mockItems[index] = { ...Data.mockItems[index], ...itemData };
    showToast("Data item berhasil diperbarui.", "success");
  } else {
    const newId =
      Data.mockItems.length > 0
        ? Math.max(...Data.mockItems.map((i) => i.id)) + 1
        : 1;
    Data.mockItems.push({ id: newId, ...itemData });
    showToast("Item baru berhasil ditambahkan.", "success");
  }
  Data.saveToLocalStorage("sppg_items", Data.mockItems);
  Alpine.store("modals").item = false;
  renderMasterDataItemsTable();
}

// ===================================================================================
// BAGIAN C: DISTRIBUSI
// ===================================================================================
export function setupDistribusiPage() {
  const today = new Date();
  const startDateInput = document.getElementById("distribusiStartDate");
  const endDateInput = document.getElementById("distribusiEndDate");

  if (startDateInput) {
    startDateInput.value = formatInputDate(today);
    startDateInput.addEventListener("change", renderShipmentList);
  } else {
    console.error("Element with ID 'distribusiStartDate' not found");
  }

  if (endDateInput) {
    endDateInput.value = formatInputDate(today);
    endDateInput.addEventListener("change", renderShipmentList);
  } else {
    console.error("Element with ID 'distribusiEndDate' not found");
  }

  renderShipmentList();
}

function renderShipmentList() {
  const startDate = document.getElementById("distribusiStartDate").value;
  const endDate = document.getElementById("distribusiEndDate").value;

  if (!startDate || !endDate) {
    console.error("Start date or end date is missing");
    return;
  }

  const filtered = Data.shipments.filter((s) => {
    const departureDate = s.departure_time
      ? s.departure_time.split("T")[0]
      : null;
    return (
      departureDate && departureDate >= startDate && departureDate <= endDate
    );
  });

  const listContainer = document.getElementById("shipmentList");
  if (!listContainer) {
    console.error("Element with ID 'shipmentList' not found");
    return;
  }

  if (filtered.length === 0) {
    listContainer.innerHTML = `<div class="text-center py-10 text-gray-500">Tidak ada jadwal pengiriman pada rentang tanggal ini.</div>`;
    return;
  }

  listContainer.innerHTML = filtered
    .map((s) => {
      const driver = Data.mockDrivers.find((d) => d.id === s.driver_id);
      return `<div class="bg-white border rounded-lg p-4 shadow-sm">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold">${s.shipment_number}</p>
                    <p class="text-sm text-gray-500">${
                      s.departure_time
                        ? formatDate(s.departure_time)
                        : "Belum Berangkat"
                    }</p>
                </div>
                ${getStatusBadge(s.status)}
            </div>
            <div class="mt-4 flex justify-between items-center">
                <p class="text-sm">${s.delivery_lines.length} tujuan</p>
                <div class="space-x-2">
                    <button onclick="cetakSuratJalan(${
                      s.id
                    })" class="text-green-600 hover:underline text-sm">Cetak Surat Jalan</button>
                    <button onclick="openShipmentModal(${
                      s.id
                    })" class="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onclick="openDeleteModal('distribusi', ${s.id}, '${
        s.shipment_number
      }')" class="text-red-600 hover:underline text-sm">Hapus</button>
                </div>
            </div>
        </div>`;
    })
    .join("");
}

export function addDeliveryLine(line = {}) {
  const container = document.getElementById("deliveryLines");
  if (!container) {
    console.error("Element with ID 'deliveryLines' not found");
    return;
  }

  const newLine = document.createElement("div");
  newLine.className = "delivery-line grid grid-cols-12 gap-4 items-center";
  newLine.innerHTML = `
        <div class="col-span-7">
            <select class="school-select bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">
                ${generateSelectOptions(Data.mockSchools, "id", "name")}
            </select>
        </div>
        <div class="col-span-3">
            <input type="number" min="1" placeholder="Porsi" value="${
              line.quantity || ""
            }" class="quantity-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">
        </div>
        <div class="col-span-2 flex justify-end">
            <button type="button" class="text-red-500 hover:text-red-700 font-medium" onclick="this.closest('.delivery-line').remove()">Hapus</button>
        </div>`;
  container.appendChild(newLine);
  if (line.school_id) {
    newLine.querySelector(".school-select").value = line.school_id;
  }
}

export function openShipmentModal(id = null) {
  const form = document.getElementById("shipmentForm");
  if (!form) {
    console.error("Element with ID 'shipmentForm' not found");
    return;
  }

  form.reset();
  document.getElementById("shipmentId").value = "";
  document.getElementById("deliveryLines").innerHTML = "";
  document.getElementById("shipmentDriverId").innerHTML = generateSelectOptions(
    Data.mockDrivers,
    "id",
    "name"
  );
  document.getElementById("shipmentVehicleId").innerHTML =
    generateSelectOptions(Data.mockVehicles, "id", "plate_number");
  document.getElementById("shipmentRecipeId").innerHTML = generateSelectOptions(
    Data.mockRecipes,
    "id",
    "name"
  );

  if (id) {
    const shipment = Data.shipments.find((s) => s.id === id);
    if (!shipment) {
      console.error(`Shipment with ID ${id} not found`);
      return;
    }

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
}
export function cetakSuratJalan(shipmentId) {
  const s = Data.shipments.find((sh) => sh.id === shipmentId);
  if (!s) {
    console.error(`Shipment with ID ${shipmentId} not found`);
    return;
  }
  const driver = Data.mockDrivers.find((d) => d.id === s.driver_id);
  const vehicle = Data.mockVehicles.find((v) => v.id === s.vehicle_id);
  const recipe = Data.mockRecipes.find((r) => r.id === s.recipe_id);
  if (!driver || !vehicle || !recipe) {
    console.error("Missing driver, vehicle, or recipe data");
    return;
  }

  // Format tanggal dan waktu
  const departureDate = new Date(s.departure_time);
  const formattedDate = formatDate(departureDate.toISOString().split("T")[0]);
  const formattedTime = departureDate.toTimeString().substring(0, 5);

  // Hitung total porsi
  const totalPortions = s.delivery_lines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );

  // Generate daftar sekolah tujuan
  const schoolsList = s.delivery_lines
    .map((line) => {
      const school = Data.mockSchools.find((sc) => sc.id === line.school_id);
      if (!school) {
        console.error(`School with ID ${line.school_id} not found`);
        return "";
      }
      return `<div class="mb-2">
        <strong>${school.name}</strong><br>
        <small>${school.address}</small><br>
        <span>Jumlah: ${line.quantity} Porsi</span>
      </div>`;
    })
    .join("");

  const content = `<html>
    <head>
      <title>Surat Jalan - ${s.shipment_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 14px;
        }
        .document-container {
          max-width: 800px;
          margin: 0 auto;
          border: 2px solid black;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h3 {
          margin: 5px 0;
        }
        .document-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .document-details .left {
          width: 50%;
        }
        .document-details .right {
          width: 50%;
          text-align: right;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .schools-list {
          margin: 20px 0;
          border: 1px solid #ddd;
          padding: 10px;
        }
        .signatures {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 30%;
          text-align: center;
        }
        .signature-line {
          height: 40px;
          border-bottom: 1px solid black;
          margin: 10px 0;
        }
        .stamp-placeholder {
          text-align: center;
          margin-top: 20px;
          color: #777;
        }
        @media print {
          body {
            padding: 0;
          }
          .document-container {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="document-container">
        <div class="header">
          <h3>BERITA ACARA PENGERIMAAN PAKET MAKANAN</h3>
          <h3>PROGRAM MAKAN BERGIZI</h3>
        </div>
        
        <div class="document-details">
          <div class="left">
            <h4 style="border-bottom: 2px solid black; padding-bottom: 5px; display: inline-block;">Pengiriman MBG</h4>
          </div>
          <div class="right">
            <div class="info-row">
              <span>Tanggal:</span>
              <span>${formattedDate}</span>
            </div>
            <div class="info-row">
              <span>Waktu:</span>
              <span>${formattedTime}</span>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span>No. Surat Jalan:</span>
            <span>${s.shipment_number}</span>
          </div>
          <div class="info-row">
            <span>Jumlah Paket Makanan:</span>
            <span>${totalPortions.toLocaleString("id-ID")} Porsi</span>
          </div>
          <div class="info-row">
            <span>Menu yang Dikirim:</span>
            <span>${recipe.name}</span>
          </div>
          <div class="info-row">
            <span>Dikirim dari:</span>
            <span>${Data.mockProfilSPPG.nama}</span>
          </div>
          <div class="info-row">
            <span>Driver:</span>
            <span>${driver.name}</span>
          </div>
          <div class="info-row">
            <span>Kendaraan:</span>
            <span>${vehicle.plate_number}</span>
          </div>
        </div>
        
        <div class="schools-list">
          <h4 style="margin-top: 0;">Daftar Sekolah Tujuan:</h4>
          ${schoolsList}
        </div>
        
        <div class="signatures">
          <div class="signature-box">
            <p>Dikirim oleh,</p>
            <div class="signature-line"></div>
            <p>${driver.name}</p>
            <p>Driver</p>
          </div>
          <div class="signature-box">
            <p>Diterima oleh,</p>
            <div class="signature-line"></div>
            <p>(___________________)</p>
            <p>Penerima</p>
          </div>
          <div class="signature-box">
            <p>Mengetahui,</p>
            <div class="signature-line"></div>
            <p>(___________________)</p>
            <p>Manajer SPPG</p>
          </div>
        </div>
        
        <div class="stamp-placeholder">
          <p>(Stempel)</p>
        </div>
        
        <div class="mt-4 text-right">
          <p>Hubungi: ${Data.mockProfilSPPG.telepon || "-"}</p>
        </div>
      </div>
    </body>
  </html>`;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
}

function handleShipmentSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("shipmentId").value;
  const delivery_lines = [];

  document.querySelectorAll(".delivery-line").forEach((line) => {
    const schoolSelect = line.querySelector(".school-select");
    const quantityInput = line.querySelector(".quantity-input");

    if (!schoolSelect || !quantityInput) return;

    const school_id = parseInt(schoolSelect.value);
    const quantity = parseInt(quantityInput.value);

    if (school_id && quantity > 0) {
      delivery_lines.push({ school_id, quantity, status: "Pending" });
    }
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
    const index = Data.shipments.findIndex((s) => s.id == id);
    if (index !== -1) {
      Data.shipments[index] = { ...Data.shipments[index], ...shipmentData };
      showToast("Jadwal pengiriman berhasil diperbarui.");
    }
  } else {
    const newId =
      Data.shipments.length > 0
        ? Math.max(...Data.shipments.map((s) => s.id)) + 1
        : 601;
    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const shipmentCountForDate =
      Data.shipments.filter((s) => s.shipment_number.includes(dateStr)).length +
      1;
    const newShipment = {
      ...shipmentData,
      id: newId,
      shipment_number: `SHP-${dateStr}-${String(shipmentCountForDate).padStart(
        2,
        "0"
      )}`,
      departure_time: new Date().toISOString(),
      status: "Direncanakan",
    };
    Data.shipments.push(newShipment);
    showToast("Jadwal pengiriman berhasil dibuat.");
  }

  Data.saveToLocalStorage("sppg_shipments", Data.shipments);
  Alpine.store("modals").shipment = false;
  renderShipmentList();
}

export const formHandlers = {
  poForm: handlePOSubmit,
  receiptForm: handleReceiptSubmit,
  workOrderForm: handleWorkOrderFormSubmit,
  shipmentForm: handleShipmentSubmit,
  itemForm: handleItemFormSubmit,
};

export const deleteHandlers = {
  po: (id) => {
    const index = Data.purchaseOrders.findIndex((p) => p.id === id);
    if (index > -1) {
      Data.purchaseOrders.splice(index, 1);
      Data.saveToLocalStorage("sppg_purchaseOrders", Data.purchaseOrders);
      renderPOTable();
      showToast("PO berhasil dihapus.");
    }
  },
  produksi: (id) => {
    const index = Data.workOrders.findIndex((wo) => wo.id === id);
    if (index > -1) {
      Data.workOrders.splice(index, 1);
      Data.saveToLocalStorage("sppg_workOrders", Data.workOrders);
      renderWorkOrderList();
      showToast("Perintah kerja berhasil dihapus.");
    }
  },
  distribusi: (id) => {
    const index = Data.shipments.findIndex((s) => s.id === id);
    if (index > -1) {
      Data.shipments.splice(index, 1);
      Data.saveToLocalStorage("sppg_shipments", Data.shipments);
      renderShipmentList();
      showToast("Jadwal pengiriman berhasil dihapus.");
    }
  },
  item: (id) => {
    const index = Data.mockItems.findIndex((i) => i.id === id);
    if (index > -1) {
      Data.mockItems.splice(index, 1);
      Data.saveToLocalStorage("sppg_items", Data.mockItems);
      renderMasterDataItemsTable();
      showToast("Item berhasil dihapus.");
    }
  },
};
