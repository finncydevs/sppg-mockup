// js/handlers/perencanaan.js

import * as Data from "../data.js";
import * as UI from "../ui.js";
import {
  showToast,
  generateSelectOptions,
  formatDate,
  formatInputDate,
  formatShortDate,
} from "../main.js";

// ===================================================================================
// PERENCANAAN MENU (RESEP & SIKLUS)
// ===================================================================================

// --- FUNGSI SETUP UTAMA ---

export function setupPerencanaanMenuPage() {
  const content = document.getElementById("planning-content");
  const tabs = document.querySelectorAll("#planning-tabs .tab-button");

  const renderTabContent = (tabId) => {
    tabs.forEach((t) => {
      t.classList.remove("tab-active");
      t.classList.add("border-transparent", "text-gray-500");
    });
    const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
    activeTab.classList.add("tab-active");
    activeTab.classList.remove("border-transparent", "text-gray-500");

    if (tabId === "resep") {
      content.innerHTML = UI.resepTabContent;
      renderRecipeList();
    } else if (tabId === "siklus") {
      content.innerHTML = UI.siklusMenuTabContent;
      // Event listener untuk tombol bulan
      document.getElementById("prevMonthBtn").addEventListener("click", () => {
        Data.appState.siklusMenu.currentDate.setMonth(
          Data.appState.siklusMenu.currentDate.getMonth() - 1
        );
        renderSiklusMenuCardList();
      });
      document.getElementById("nextMonthBtn").addEventListener("click", () => {
        Data.appState.siklusMenu.currentDate.setMonth(
          Data.appState.siklusMenu.currentDate.getMonth() + 1
        );
        renderSiklusMenuCardList();
      });
      document
        .getElementById("saveSiklusButton")
        .addEventListener("click", handleSiklusMenuSave);
      renderSiklusMenuCardList();
    }
  };

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => renderTabContent(tab.dataset.tab))
  );
  renderTabContent("resep"); // Default tab
}

// --- LOGIKA UNTUK RESEP ---

function renderRecipeList() {
  const listContainer = document.getElementById("recipeList");
  listContainer.innerHTML = Data.mockRecipes
    .map(
      (recipe) =>
        `<div class="bg-gray-50 border rounded-lg p-4 flex justify-between items-center"><div><p class="font-semibold text-gray-800">${
          recipe.name
        }</p><p class="text-sm text-gray-500">${
          recipe.bom.length
        } bahan</p></div><div class="space-x-4"><button onclick="openRecipeDetailModal(${
          recipe.id
        })" class="text-blue-600 hover:underline text-sm">Detail</button><button onclick="openRecipeModal(${
          recipe.id
        })" class="text-blue-600 hover:underline text-sm">Edit</button><button onclick="openDeleteModal('resep', ${
          recipe.id
        }, '${recipe.name.replace(
          /'/g,
          "\\'"
        )}')" class="text-red-600 hover:underline text-sm">Hapus</button></div></div>`
    )
    .join("");
}
export function openRecipeDetailModal(recipeId) {
  const recipe = Data.mockRecipes.find((r) => r.id === recipeId);
  if (!recipe) return;
  document.getElementById(
    "recipeDetailModalTitle"
  ).textContent = `Detail Resep: ${recipe.name}`;
  document.getElementById("recipeBomList").innerHTML = recipe.bom
    .map((ing) => {
      const item = Data.mockItems.find((i) => i.id === ing.item_id);
      return `<li>${item.name}: ${ing.quantity_per_portion} ${item.unit}</li>`;
    })
    .join("");
  document.getElementById("recipeNutritionInfo").innerHTML = Object.entries(
    recipe.nutrition
  )
    .map(
      ([key, value]) =>
        `<div class="flex justify-between border-b py-1"><span class="text-gray-500 capitalize">${key}</span><span class="font-medium text-gray-800">${value}</span></div>`
    )
    .join("");
  Alpine.store("modals").recipeDetail = true;
}
function addIngredientLine(ingredient = {}) {
  const container = document.getElementById("recipeIngredients");
  const newLine = document.createElement("div");
  newLine.className = "ingredient-line grid grid-cols-12 gap-4 items-center";
  newLine.innerHTML = `<div class="col-span-6"><select class="item-select bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5">${generateSelectOptions(
    Data.mockItems,
    "id",
    "name"
  )}</select></div><div class="col-span-4"><input type="number" min="0.01" step="0.01" placeholder="e.g., 0.15" value="${
    ingredient.quantity_per_portion || ""
  }" class="quantity-input bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"></div><div class="col-span-2 flex justify-end"><button type="button" class="text-red-500 hover:text-red-700 font-medium" onclick="this.closest('.ingredient-line').remove()">Hapus</button></div>`;
  container.appendChild(newLine);
  if (ingredient.item_id)
    newLine.querySelector(".item-select").value = ingredient.item_id;
}
export function openRecipeModal(recipeId = null) {
  document.getElementById("recipeForm").reset();
  document.getElementById("recipeId").value = "";
  document.getElementById("recipeIngredients").innerHTML = "";
  if (recipeId) {
    const recipe = Data.mockRecipes.find((r) => r.id === recipeId);
    document.getElementById(
      "modalTitleRecipe"
    ).textContent = `Edit Resep: ${recipe.name}`;
    document.getElementById("recipeId").value = recipe.id;
    document.getElementById("recipeName").value = recipe.name;
    recipe.bom.forEach((ing) => addIngredientLine(ing));
  } else {
    document.getElementById("modalTitleRecipe").textContent =
      "Tambah Resep Baru";
    addIngredientLine();
  }
  Alpine.store("modals").recipeForm = true;
}
function handleRecipeFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("recipeId").value;
  const bom = [];
  document
    .querySelectorAll("#recipeIngredients .ingredient-line")
    .forEach((line) => {
      const itemId = parseInt(line.querySelector(".item-select").value);
      const qty = parseFloat(line.querySelector(".quantity-input").value);
      if (itemId && qty > 0)
        bom.push({ item_id: itemId, quantity_per_portion: qty });
    });
  const recipeName = document.getElementById("recipeName").value;
  if (!recipeName || bom.length === 0) {
    showToast("Nama resep dan minimal satu bahan harus diisi.", "error");
    return;
  }
  const recipeData = {
    name: recipeName,
    bom,
    nutrition: {
      kalori: "Auto",
      protein: "Auto",
      lemak: "Auto",
      karbohidrat: "Auto",
    },
  };
  if (id) {
    const index = Data.mockRecipes.findIndex((r) => r.id == id);
    Data.mockRecipes[index] = { ...Data.mockRecipes[index], ...recipeData };
  } else {
    recipeData.id =
      Data.mockRecipes.length > 0
        ? Math.max(...Data.mockRecipes.map((r) => r.id)) + 1
        : 101;
    Data.mockRecipes.push(recipeData);
  }
  Data.saveToLocalStorage("sppg_recipes", Data.mockRecipes);
  Alpine.store("modals").recipeForm = false;
  renderRecipeList();
  showToast("Resep berhasil disimpan.", "success");
}

// --- LOGIKA UNTUK SIKLUS MENU (Tampilan Kartu Bulanan) ---
function renderSiklusMenuCardList() {
  const listContainer = document.getElementById("siklusMenuGrid");
  const monthYearDisplay = document.getElementById("monthYearDisplay");
  listContainer.innerHTML = "";

  if (!Data.appState.siklusMenu) {
    Data.appState.siklusMenu = { currentDate: new Date() };
  }
  const currentDate = Data.appState.siklusMenu.currentDate;
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  monthYearDisplay.textContent = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Adjusted to match Indonesian standard (Minggu=0, Senin=1, ..., Sabtu=6)
  // The provided HTML headers already start with 'Min', so this is correct.
  const startDayOfWeek = firstDayOfMonth.getDay();

  // Tambahkan sel kosong untuk hari sebelum tanggal 1
  for (let i = 0; i < startDayOfWeek; i++) {
    listContainer.innerHTML += `<div class="bg-gray-50 border-t border-l border-gray-200"></div>`;
  }

  // Generate options string once to reuse
  const recipeOptionsHtml = Data.mockRecipes
    .map((recipe) => `<option value="${recipe.id}">${recipe.name}</option>`)
    .join("");

  // Tambahkan sel untuk setiap tanggal di bulan ini
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const fullDate = new Date(year, month, day);
    const dateKey = formatInputDate(fullDate); // e.g., "2025-08-30"
    const selectedRecipeId = Data.mockSiklusMenu[dateKey];

    // Build the HTML for each calendar day cell
    listContainer.innerHTML += `
        <div class="h-36 p-2 bg-white border-t border-l border-gray-200 flex flex-col justify-between">
            <div class="font-semibold text-sm text-gray-700 text-right">${day}</div>
            
            <div class="mt-1">
                <select data-datekey="${dateKey}" class="siklus-menu-select bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5">
                    <option value="">-- Pilih Menu --</option>
                    ${Data.mockRecipes
                      .map(
                        (recipe) =>
                          `<option value="${recipe.id}" ${
                            recipe.id === selectedRecipeId ? "selected" : ""
                          }>${recipe.name}</option>`
                      )
                      .join("")}
                </select>
            </div>
        </div>`;
  }
}
function handleSiklusMenuSave() {
  const newSiklusMenu = {};
  document.querySelectorAll(".siklus-menu-select").forEach((select) => {
    const dateKey = select.dataset.datekey;
    const recipeId = select.value;
    if (recipeId) {
      newSiklusMenu[dateKey] = parseInt(recipeId);
    }
  });

  Object.keys(Data.mockSiklusMenu).forEach(
    (key) => delete Data.mockSiklusMenu[key]
  );
  Object.assign(Data.mockSiklusMenu, newSiklusMenu);

  Data.saveToLocalStorage("sppg_siklusMenu", Data.mockSiklusMenu);
  showToast("Jadwal menu berhasil disimpan.", "success");
}

// --- EKSPOR HANDLER ---
export const formHandlers = {
  recipeForm: handleRecipeFormSubmit,
};

export const deleteHandlers = {
  resep: (id) => {
    const index = Data.mockRecipes.findIndex((r) => r.id === id);
    if (index > -1) {
      Data.mockRecipes.splice(index, 1);
      Data.saveToLocalStorage("sppg_recipes", Data.mockRecipes);
      renderRecipeList();
      showToast("Data resep berhasil dihapus.", "success");
    }
  },
};
