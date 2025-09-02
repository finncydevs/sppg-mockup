// File: js/app.js

import { handleLogin, handleLogout } from "./auth.js";

document.addEventListener("alpine:init", () => {
  // State untuk kontrol UI umum
  Alpine.store("app", {
    sidebarOpen: window.innerWidth > 768,
    isLoggedIn: false,
  });

  // State untuk mengontrol semua modal
  Alpine.store("modals", {
    po: false,
    receipt: false,
    lotDetail: false,
    workOrder: false,
    shipment: false,
    recipeDetail: false,
    recipeForm: false,
    karyawan: false,
    gaji: false,
    item: false,
    supplier: false,
    school: false,
    user: false,
    aset: false,
    keuangan: false,
    driverReport: false,
    deleteConfirm: false,
  });

  // Mendaftarkan komponen utama untuk otentikasi
  Alpine.data("appAuth", () => ({
    loginForm: { username: "", password: "" },
    loginError: "",

    handleLogin() {
      handleLogin(this.loginForm, (error) => {
        this.loginError = error ? error : "";
      });
    },

    handleLogout() {
      handleLogout();
    },
  }));
});
