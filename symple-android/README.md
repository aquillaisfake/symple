# SYMPLE — Android App (Expo React Native)

SYMPLE Menstrual Tracker for Android, built with **Expo** and **React Native**.

---

## Building an APK

There are two ways to build an APK: using **EAS Build** (cloud, recommended) or **locally** with Android Studio.

---

### Option A: EAS Build (Cloud — No Android Studio needed)

This builds the APK on Expo's servers and gives you a download link.

**Step 1 — Install EAS CLI**
```bash
npm install -g eas-cli
```

**Step 2 — Log in to Expo**
```bash
eas login
```
(Create a free account at [expo.dev](https://expo.dev) if you don't have one)

**Step 3 — Install dependencies**
```bash
cd symple-android
npm install
```

**Step 4 — Build the APK**
```bash
npm run build:apk
```
or directly:
```bash
eas build --platform android --profile preview
```

**Step 5 — Download the APK**

When the build finishes, EAS will give you a download link. Install the `.apk` file on your Android device.

> **Note:** First build may take 10–15 minutes on EAS servers.

---

### Option B: Local Build (Requires Android Studio + JDK)

**Prerequisites:**
- [Android Studio](https://developer.android.com/studio) installed
- JDK 17 installed
- Android SDK configured

**Steps:**
```bash
cd symple-android
npm install
npx expo run:android
```

This will build and install the app directly on a connected device or emulator.

---

### Option C: Run with Expo Go (No build needed — for testing)

1. Install **Expo Go** from Google Play Store on your Android phone
2. Run:
   ```bash
   cd symple-android
   npm install
   npx expo start
   ```
3. Scan the QR code with your phone camera or Expo Go app
4. Make sure your phone and computer are on the same WiFi

---

## Project Structure

```
symple-android/
├── app/
│   ├── _layout.tsx     # Root layout + navigation
│   ├── index.tsx       # Main screen (Menstrual Tracker)
│   └── profile.tsx     # Profile screen
├── assets/             # App icons and splash screen
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration (APK profiles)
├── package.json        # Dependencies + build scripts
└── tsconfig.json       # TypeScript config
```

## Features

- 🌸 Log menstrual days
- 📅 Calendar with period markers
- 🔔 Cycle reminder notifications
- 👤 User profile with photo upload
- 💾 Data stored on device (AsyncStorage)

## Build Scripts

| Script | Description |
|--------|-------------|
| `npm run android` | Run on Android emulator/device via Expo |
| `npm run build:apk` | Build APK via EAS (preview profile) |
| `npm run build:apk:prod` | Build APK via EAS (production profile) |
| `npm run build:local` | Build locally with Android Studio |
