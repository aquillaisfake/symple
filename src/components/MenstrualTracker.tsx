"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface PeriodEntry {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // 7 days after start
}

interface NotificationState {
  show: boolean;
  message: string;
  type: "reminder" | "success" | "info";
}

const STORAGE_KEY = "symple_period_entries";
const CYCLE_LENGTH = 28; // average cycle days
const PERIOD_DURATION = 7; // days period lasts
const REMINDER_THRESHOLD = 5; // days before cycle end to remind

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export default function MenstrualTracker() {
  const today = toDateStr(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<PeriodEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PeriodEntry[]) : [];
  });
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "info",
  });
  const [justLogged, setJustLogged] = useState(false);

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const showNotification = useCallback((message: string, type: NotificationState["type"]) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification((n) => ({ ...n, show: false })), 5000);
  }, []);

  // Check notification logic
  const checkNotification = useCallback(() => {
    if (entries.length === 0) return;

    const lastEntry = entries[entries.length - 1];
    const daysSinceStart = daysBetween(lastEntry.startDate, today);

    // If currently in period (within 7 days), no reminder needed
    if (daysSinceStart >= 0 && daysSinceStart < PERIOD_DURATION) {
      return;
    }

    // Next expected period
    const nextPeriodDate = addDays(lastEntry.startDate, CYCLE_LENGTH);
    const daysUntilNext = daysBetween(today, nextPeriodDate);

    // If cycle hasn't exceeded 5 days past expected start, remind
    if (daysUntilNext <= 0 && Math.abs(daysUntilNext) <= REMINDER_THRESHOLD) {
      showNotification(
        `🌸 Hei! Siklus menstruasimu mungkin sudah dimulai. Jangan lupa catat hari ini!`,
        "reminder"
      );
    } else if (daysUntilNext > 0 && daysUntilNext <= 3) {
      showNotification(
        `🌷 Siklus menstruasimu diperkirakan ${daysUntilNext} hari lagi. Bersiap ya!`,
        "info"
      );
    }
  }, [entries, today, showNotification]);

  useEffect(() => {
    const timer = setTimeout(checkNotification, 1000);
    return () => clearTimeout(timer);
  }, [checkNotification]);

  function handleSignIn() {
    // Check if already logged today
    const alreadyLogged = entries.some(
      (e) => e.startDate === today || (today >= e.startDate && today <= e.endDate)
    );

    if (alreadyLogged) {
      showNotification("✅ Kamu sudah mencatat menstruasi hari ini!", "info");
      return;
    }

    const newEntry: PeriodEntry = {
      startDate: today,
      endDate: addDays(today, PERIOD_DURATION - 1),
    };

    setEntries((prev) => [...prev, newEntry]);
    setJustLogged(true);
    showNotification(
      "🌸 Berhasil dicatat! Semangat ya, jaga kesehatan selalu 💕",
      "success"
    );

    setTimeout(() => setJustLogged(false), 3000);
  }

  function isPeriodDay(dateStr: string): boolean {
    return entries.some(
      (e) => dateStr >= e.startDate && dateStr <= e.endDate
    );
  }

  function isPeriodStart(dateStr: string): boolean {
    return entries.some((e) => e.startDate === dateStr);
  }

  function isPeriodEnd(dateStr: string): boolean {
    return entries.some((e) => e.endDate === dateStr);
  }

  function isInCurrentPeriod(): boolean {
    return entries.some(
      (e) => today >= e.startDate && today <= e.endDate
    );
  }

  function getNextPeriodInfo(): { date: string; daysUntil: number } | null {
    if (entries.length === 0) return null;
    const last = entries[entries.length - 1];
    const nextDate = addDays(last.startDate, CYCLE_LENGTH);
    const daysUntil = daysBetween(today, nextDate);
    return { date: nextDate, daysUntil };
  }

  function getCurrentCycleDay(): number | null {
    if (entries.length === 0) return null;
    const last = entries[entries.length - 1];
    const daysSinceStart = daysBetween(last.startDate, today);
    if (daysSinceStart >= 0 && daysSinceStart < PERIOD_DURATION) {
      return daysSinceStart + 1;
    }
    return null;
  }

  // Calendar generation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  const nextPeriod = getNextPeriodInfo();
  const cycleDay = getCurrentCycleDay();
  const inPeriod = isInCurrentPeriod();

  const notifColors = {
    reminder: "bg-pink-500 text-white",
    success: "bg-rose-400 text-white",
    info: "bg-pink-300 text-pink-900",
  };

  return (
    <div className="app-container">
      {/* Notification Banner */}
      {notification.show && (
        <div
          className={`notification-banner fixed top-0 left-0 right-0 z-50 mx-auto max-w-[430px] px-4 py-3 text-sm font-medium shadow-lg ${notifColors[notification.type]}`}
        >
          <div className="flex items-start gap-2">
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification((n) => ({ ...n, show: false }))}
              className="opacity-70 hover:opacity-100 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-pink-700">🌸 SYMPLE</h1>
            <p className="text-xs text-pink-400">Menstrual Tracker</p>
          </div>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-600 text-lg hover:bg-pink-300 transition-colors"
            aria-label="Profil saya"
          >
            👤
          </Link>
        </div>
      </div>

      {/* Status Card */}
      <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 p-4 text-white shadow-lg shadow-pink-200">
        {inPeriod && cycleDay ? (
          <div>
            <p className="text-pink-100 text-xs font-medium uppercase tracking-wide mb-1">
              Sedang Menstruasi
            </p>
            <p className="text-3xl font-bold">Hari ke-{cycleDay}</p>
            <p className="text-pink-100 text-sm mt-1">
              dari {PERIOD_DURATION} hari periode
            </p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: PERIOD_DURATION }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < cycleDay ? "bg-white" : "bg-pink-300/50"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : nextPeriod ? (
          <div>
            <p className="text-pink-100 text-xs font-medium uppercase tracking-wide mb-1">
              {nextPeriod.daysUntil > 0 ? "Perkiraan Siklus Berikutnya" : "Siklus Mungkin Sudah Dimulai"}
            </p>
            <p className="text-3xl font-bold">
              {nextPeriod.daysUntil > 0
                ? `${nextPeriod.daysUntil} hari lagi`
                : `${Math.abs(nextPeriod.daysUntil)} hari terlambat`}
            </p>
            <p className="text-pink-100 text-sm mt-1">
              {new Date(nextPeriod.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-pink-100 text-xs font-medium uppercase tracking-wide mb-1">
              Selamat Datang
            </p>
            <p className="text-xl font-bold">Mulai Catat Siklus</p>
            <p className="text-pink-100 text-sm mt-1">
              Tekan tombol di bawah untuk mulai
            </p>
          </div>
        )}
      </div>

      {/* Sign-In Button */}
      <div className="mx-4 mb-5">
        <button
          onClick={handleSignIn}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 ${
            justLogged
              ? "bg-rose-300 text-white scale-95"
              : inPeriod
              ? "bg-pink-100 text-pink-500 border-2 border-pink-300"
              : "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200 btn-pulse active:scale-95"
          }`}
        >
          {justLogged
            ? "✅ Tercatat!"
            : inPeriod
            ? "🩸 Menstruasi Sedang Berlangsung"
            : "🩸 Catat Menstruasi Hari Ini"}
        </button>
        {inPeriod && (
          <p className="text-center text-xs text-pink-400 mt-2">
            Kamu sudah mencatat menstruasi hari ini 💕
          </p>
        )}
      </div>

      {/* Calendar */}
      <div className="mx-4 mb-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm shadow-pink-100 p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors"
          >
            ‹
          </button>
          <h2 className="font-semibold text-pink-700 text-base">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors"
          >
            ›
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-pink-400 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Empty cells for first week */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === today;
            const isPeriod = isPeriodDay(dateStr);
            const isStart = isPeriodStart(dateStr);
            const isEnd = isPeriodEnd(dateStr);

            return (
              <div key={day} className="flex items-center justify-center py-0.5">
                <div
                  className={`
                    w-9 h-9 flex items-center justify-center text-sm relative
                    ${isStart ? "day-period-start" : isPeriod ? "day-period" : ""}
                    ${isToday && !isPeriod ? "day-today text-pink-600" : ""}
                    ${isToday && isPeriod ? "day-today" : ""}
                    ${!isPeriod && !isToday ? "text-gray-600" : ""}
                  `}
                >
                  {day}
                  {isStart && (
                    <span className="absolute -top-1 -right-1 text-[8px]">🌸</span>
                  )}
                  {isEnd && (
                    <span className="absolute -bottom-1 -right-1 text-[8px]">✨</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-400" />
            <span className="text-xs text-pink-500">Menstruasi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-pink-500" />
            <span className="text-xs text-pink-500">Hari ini</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🌸</span>
            <span className="text-xs text-pink-500">Mulai</span>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="mx-4 mb-8">
        <h3 className="text-sm font-semibold text-pink-600 mb-3 px-1">
          📋 Riwayat Siklus
        </h3>
        {entries.length === 0 ? (
          <div className="rounded-2xl bg-white/50 p-4 text-center">
            <p className="text-pink-300 text-sm">Belum ada catatan siklus</p>
            <p className="text-pink-200 text-xs mt-1">
              Tekan tombol di atas untuk mulai mencatat
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...entries].reverse().slice(0, 5).map((entry, idx) => {
              const startDate = new Date(entry.startDate);
              const endDate = new Date(entry.endDate);
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white/70 px-4 py-3 flex items-center justify-between shadow-sm shadow-pink-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm">
                      🩸
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pink-700">
                        {startDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        –{" "}
                        {endDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-pink-400">{PERIOD_DURATION} hari</p>
                    </div>
                  </div>
                  <span className="text-xs text-pink-300 bg-pink-50 px-2 py-1 rounded-full">
                    Siklus #{entries.length - idx}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-6" />
    </div>
  );
}
