// File: js/auth.js (Versi Final dengan Perbaikan Timing)

import * as Data from "./data.js";

export function handleLogin(loginData, callback) {
  const user = Data.mockUsers.find(
    (u) => u.name.toLowerCase() === loginData.username.toLowerCase()
  );

  if (user && user.password === loginData.password) {
    Data.appState.isLoggedIn = true;
    Data.appState.currentUser = user;
    Data.saveToLocalStorage("sppg_appState", Data.appState);

    // Beritahu Alpine untuk mengubah tampilan
    Alpine.store("app").isLoggedIn = true;

    // Hilangkan pesan error secepatnya
    callback(null);

    // PENTING: Tunggu Alpine selesai render, BARU jalankan inisialisasi
    Alpine.nextTick(() => {
      window.initializeApp();
    });
  } else {
    callback("Nama pengguna atau password salah.");
  }
}

export function handleLogout() {
  Data.appState.isLoggedIn = false;
  Data.appState.currentUser = null;
  Data.saveToLocalStorage("sppg_appState", Data.appState);
  Alpine.store("app").isLoggedIn = false;
  window.location.reload();
}

export function checkLoginStatus() {
  const storedState = localStorage.getItem("sppg_appState");
  if (storedState) {
    const state = JSON.parse(storedState);
    if (state.isLoggedIn && state.currentUser) {
      Data.appState.isLoggedIn = true;
      Data.appState.currentUser = state.currentUser;

      Alpine.store("app").isLoggedIn = true;

      // PENTING: Tunggu Alpine selesai render, BARU jalankan inisialisasi
      Alpine.nextTick(() => {
        window.initializeApp();
      });
    } else {
      Alpine.store("app").isLoggedIn = false;
    }
  } else {
    Alpine.store("app").isLoggedIn = false;
  }
}
