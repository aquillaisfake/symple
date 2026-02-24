"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const PROFILE_KEY = "symple_user_profile";

interface UserProfile {
  name: string;
  age: string;
  avatarUrl: string | null;
}

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return { name: "", age: "", avatarUrl: null };
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? (JSON.parse(stored) as UserProfile) : { name: "", age: "", avatarUrl: null };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>(profile);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    setProfile(form);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(form));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setForm((f) => ({ ...f, avatarUrl: url }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors text-lg"
          aria-label="Kembali"
        >
          ‹
        </button>
        <div>
          <h1 className="text-xl font-bold text-pink-700">Profil Saya</h1>
          <p className="text-xs text-pink-400">SYMPLE Menstrual Tracker</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-4 mb-6 px-5">
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full border-4 border-pink-300 overflow-hidden bg-pink-100 flex items-center justify-center shadow-lg shadow-pink-200 cursor-pointer"
            onClick={() => editing && fileInputRef.current?.click()}
          >
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt="Foto profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl select-none">👤</span>
            )}
          </div>
          {editing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md hover:bg-pink-600 transition-colors text-sm"
              aria-label="Ganti foto"
            >
              📷
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {!editing && (
          <div className="mt-4 text-center">
            <p className="text-xl font-bold text-pink-700">
              {profile.name || "Nama belum diisi"}
            </p>
            {profile.age && (
              <p className="text-sm text-pink-400 mt-1">{profile.age} tahun</p>
            )}
          </div>
        )}
      </div>

      {/* Form / Info Card */}
      <div className="mx-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm shadow-pink-100 p-5 space-y-4">
        {editing ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-pink-500 mb-1 uppercase tracking-wide">
                Nama
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Masukkan namamu"
                className="w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-pink-500 mb-1 uppercase tracking-wide">
                Umur
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                placeholder="Masukkan umurmu"
                className="w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setForm(profile); setEditing(false); }}
                className="flex-1 py-3 rounded-xl border-2 border-pink-200 text-pink-500 font-semibold text-sm hover:bg-pink-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-md shadow-pink-200 hover:opacity-90 transition-opacity"
              >
                Simpan
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between py-2 border-b border-pink-100">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">Nama</span>
              <span className="text-sm font-medium text-pink-700">
                {profile.name || <span className="text-pink-300 italic">Belum diisi</span>}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">Umur</span>
              <span className="text-sm font-medium text-pink-700">
                {profile.age ? `${profile.age} tahun` : <span className="text-pink-300 italic">Belum diisi</span>}
              </span>
            </div>
            <button
              onClick={() => { setForm(profile); setEditing(true); }}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-sm shadow-md shadow-pink-200 hover:opacity-90 transition-opacity"
            >
              ✏️ Edit Profil
            </button>
          </>
        )}
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rose-400 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          ✅ Profil berhasil disimpan!
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
