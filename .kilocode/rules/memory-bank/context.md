# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Ready for development

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] SYMPLE Menstrual Tracker app — pink soft theme, calendar with 7-day period trace, sign-in button, cycle notifications
- [x] Calendar period days changed to dashed circle outline (numbers now visible)
- [x] Profile page added (/profile) — name, profile picture upload, age; accessible via header icon
- [x] App renamed from "Luna" to "SYMPLE" — updated header, page title, localStorage keys, and profile subtitle

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-24 | Created `symple-android/` — full Expo React Native conversion of SYMPLE app for Android emulator/device. Includes: `app/index.tsx` (MenstrualTracker), `app/profile.tsx` (ProfilePage), `app/_layout.tsx` (Expo Router), `app.json`, `package.json`, `babel.config.js`, `tsconfig.json`, `README.md`. Uses AsyncStorage instead of localStorage, expo-image-picker for avatar, react-native-safe-area-context. Zero TypeScript errors. |
| 2026-02-25 | Ran `expo prebuild --platform android` to generate `symple-android/android/` native folder. Now includes `settings.gradle`, `build.gradle`, `MainActivity.kt`, `MainApplication.kt`, `AndroidManifest.xml`, app icons (webp), splash screens, and all Gradle wrapper files. Fixed invalid PNG assets (replaced with valid 1024×1024 pink PNGs). Committed and pushed as `4adcf013`. |
| 2026-02-25 | Made period logging manual: calendar dates are now tappable in both web (`MenstrualTracker.tsx`) and Android (`symple-android/app/index.tsx`). Tapping a date logs it as period start (7-day duration); tapping again removes the entry. Added "💡 Ketuk tanggal..." hint text. Quick-log button still works for today. |
