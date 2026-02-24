# SYMPLE — Android App (Expo React Native)

Aplikasi SYMPLE Menstrual Tracker untuk Android, dibangun dengan **Expo** dan **React Native**.

## Cara Menjalankan di Android Emulator / HP Android

### Prasyarat

1. **Node.js** (v18+) — [nodejs.org](https://nodejs.org)
2. **npm** atau **yarn** (sudah termasuk dengan Node.js)
3. **Expo CLI** — install dengan:
   ```bash
   npm install -g expo-cli
   ```
4. **Android Studio** dengan Android Emulator yang sudah dikonfigurasi  
   _atau_ **HP Android** dengan aplikasi **Expo Go** terinstall

---

### Langkah 1 — Install Dependencies

Buka terminal di folder `symple-android`, lalu jalankan:

```bash
npm install
```

---

### Langkah 2 — Jalankan Aplikasi

#### Opsi A: Android Emulator (Android Studio)

1. Buka Android Studio → buka AVD Manager → jalankan emulator
2. Di terminal, jalankan:
   ```bash
   npx expo start --android
   ```
   Aplikasi akan otomatis terbuka di emulator.

#### Opsi B: HP Android Fisik (Expo Go)

1. Install **Expo Go** dari Google Play Store di HP Android kamu
2. Di terminal, jalankan:
   ```bash
   npx expo start
   ```
3. Scan QR code yang muncul di terminal menggunakan kamera HP atau aplikasi Expo Go
4. Pastikan HP dan komputer terhubung ke WiFi yang sama

#### Opsi C: Build APK (untuk distribusi)

```bash
npx expo build:android
# atau dengan EAS Build (direkomendasikan):
npm install -g eas-cli
eas build --platform android
```

---

## Struktur Proyek

```
symple-android/
├── app/
│   ├── _layout.tsx     # Root layout + navigasi
│   ├── index.tsx       # Halaman utama (Menstrual Tracker)
│   └── profile.tsx     # Halaman profil
├── app.json            # Konfigurasi Expo
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## Fitur

- 🌸 Catat hari menstruasi
- 📅 Kalender dengan penanda periode
- 🔔 Notifikasi pengingat siklus
- 👤 Profil pengguna dengan foto
- 💾 Data tersimpan di perangkat (AsyncStorage)
