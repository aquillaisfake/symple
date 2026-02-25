import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PeriodEntry {
  startDate: string;
  endDate: string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: "reminder" | "success" | "info";
}

const STORAGE_KEY = "symple_period_entries";
const CYCLE_LENGTH = 28;
const PERIOD_DURATION = 7;
const REMINDER_THRESHOLD = 5;

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

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function HomeScreen() {
  const router = useRouter();
  const today = toDateStr(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<PeriodEntry[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "info",
  });
  const [justLogged, setJustLogged] = useState(false);
  const notifOpacity = useState(new Animated.Value(0))[0];

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setEntries(JSON.parse(stored) as PeriodEntry[]);
    });
  }, []);

  // Save to AsyncStorage whenever entries change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const showNotification = useCallback(
    (message: string, type: NotificationState["type"]) => {
      setNotification({ show: true, message, type });
      Animated.sequence([
        Animated.timing(notifOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(notifOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setNotification((n) => ({ ...n, show: false })));
    },
    [notifOpacity]
  );

  const checkNotification = useCallback(() => {
    if (entries.length === 0) return;
    const lastEntry = entries[entries.length - 1];
    const daysSinceStart = daysBetween(lastEntry.startDate, today);
    if (daysSinceStart >= 0 && daysSinceStart < PERIOD_DURATION) return;
    const nextPeriodDate = addDays(lastEntry.startDate, CYCLE_LENGTH);
    const daysUntilNext = daysBetween(today, nextPeriodDate);
    if (daysUntilNext <= 0 && Math.abs(daysUntilNext) <= REMINDER_THRESHOLD) {
      showNotification(
        "🌸 Hei! Siklus menstruasimu mungkin sudah dimulai. Jangan lupa catat hari ini!",
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

  // Log period starting from a specific date (manual)
  function logPeriodOnDate(dateStr: string) {
    // Check if this date is already inside an existing period entry
    const existingIdx = entries.findIndex(
      (e) => dateStr >= e.startDate && dateStr <= e.endDate
    );

    if (existingIdx !== -1) {
      // Remove this entry (toggle off)
      setEntries((prev) => prev.filter((_, i) => i !== existingIdx));
      showNotification("🗑️ Catatan menstruasi dihapus.", "info");
      return;
    }

    // Add new entry starting on this date
    const newEntry: PeriodEntry = {
      startDate: dateStr,
      endDate: addDays(dateStr, PERIOD_DURATION - 1),
    };

    setEntries((prev) => {
      const updated = [...prev, newEntry];
      // Sort by startDate
      updated.sort((a, b) => a.startDate.localeCompare(b.startDate));
      return updated;
    });

    if (dateStr === today) {
      setJustLogged(true);
      setTimeout(() => setJustLogged(false), 3000);
      showNotification("🌸 Berhasil dicatat! Semangat ya, jaga kesehatan selalu 💕", "success");
    } else {
      const d = new Date(dateStr);
      const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
      showNotification(`🌸 Menstruasi tanggal ${label} berhasil dicatat!`, "success");
    }
  }

  function handleSignIn() {
    logPeriodOnDate(today);
  }

  function isPeriodDay(dateStr: string): boolean {
    return entries.some((e) => dateStr >= e.startDate && dateStr <= e.endDate);
  }
  function isPeriodStart(dateStr: string): boolean {
    return entries.some((e) => e.startDate === dateStr);
  }
  function isPeriodEnd(dateStr: string): boolean {
    return entries.some((e) => e.endDate === dateStr);
  }
  function isInCurrentPeriod(): boolean {
    return entries.some((e) => today >= e.startDate && today <= e.endDate);
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
    if (daysSinceStart >= 0 && daysSinceStart < PERIOD_DURATION) return daysSinceStart + 1;
    return null;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const nextPeriod = getNextPeriodInfo();
  const cycleDay = getCurrentCycleDay();
  const inPeriod = isInCurrentPeriod();

  const notifBg = {
    reminder: "#ec4899",
    success: "#fb7185",
    info: "#f9a8d4",
  };
  const notifTextColor = {
    reminder: "#fff",
    success: "#fff",
    info: "#831843",
  };

  // Build calendar grid
  const calendarCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Notification Banner */}
      {notification.show && (
        <Animated.View
          style={[
            styles.notifBanner,
            { backgroundColor: notifBg[notification.type], opacity: notifOpacity },
          ]}
        >
          <Text style={[styles.notifText, { color: notifTextColor[notification.type] }]}>
            {notification.message}
          </Text>
          <TouchableOpacity
            onPress={() => setNotification((n) => ({ ...n, show: false }))}
            style={styles.notifClose}
          >
            <Text style={{ color: notifTextColor[notification.type], fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>🌸 SYMPLE</Text>
            <Text style={styles.appSubtitle}>Menstrual Tracker</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/profile")}
            accessibilityLabel="Profil saya"
          >
            <Text style={{ fontSize: 20 }}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          {inPeriod && cycleDay ? (
            <View>
              <Text style={styles.statusLabel}>Sedang Menstruasi</Text>
              <Text style={styles.statusBig}>Hari ke-{cycleDay}</Text>
              <Text style={styles.statusSub}>dari {PERIOD_DURATION} hari periode</Text>
              <View style={styles.progressRow}>
                {Array.from({ length: PERIOD_DURATION }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressDot,
                      { backgroundColor: i < cycleDay ? "#fff" : "rgba(255,255,255,0.3)" },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : nextPeriod ? (
            <View>
              <Text style={styles.statusLabel}>
                {nextPeriod.daysUntil > 0 ? "Perkiraan Siklus Berikutnya" : "Siklus Mungkin Sudah Dimulai"}
              </Text>
              <Text style={styles.statusBig}>
                {nextPeriod.daysUntil > 0
                  ? `${nextPeriod.daysUntil} hari lagi`
                  : `${Math.abs(nextPeriod.daysUntil)} hari terlambat`}
              </Text>
              <Text style={styles.statusSub}>
                {new Date(nextPeriod.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.statusLabel}>Selamat Datang</Text>
              <Text style={styles.statusBig}>Mulai Catat Siklus</Text>
              <Text style={styles.statusSub}>Ketuk tanggal di kalender untuk mulai</Text>
            </View>
          )}
        </View>

        {/* Sign-In Button */}
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={[
              styles.signInBtn,
              justLogged
                ? styles.signInBtnLogged
                : inPeriod
                ? styles.signInBtnActive
                : styles.signInBtnDefault,
            ]}
            onPress={handleSignIn}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.signInBtnText,
                inPeriod && !justLogged ? { color: "#ec4899" } : { color: "#fff" },
              ]}
            >
              {justLogged
                ? "✅ Tercatat!"
                : inPeriod
                ? "🩸 Menstruasi Sedang Berlangsung"
                : "🩸 Catat Menstruasi Hari Ini"}
            </Text>
          </TouchableOpacity>
          {inPeriod && (
            <Text style={styles.alreadyLoggedText}>Kamu sudah mencatat menstruasi hari ini 💕</Text>
          )}
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={() => setCurrentMonth(new Date(year, month - 1, 1))}
            >
              <Text style={styles.monthNavArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <TouchableOpacity
              style={styles.monthNavBtn}
              onPress={() => setCurrentMonth(new Date(year, month + 1, 1))}
            >
              <Text style={styles.monthNavArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            {DAY_NAMES.map((d) => (
              <View key={d} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.calendarCell} />;
              }
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === today;
              const isPeriod = isPeriodDay(dateStr);
              const isStart = isPeriodStart(dateStr);
              const isEnd = isPeriodEnd(dateStr);

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.calendarCell}
                  onPress={() => logPeriodOnDate(dateStr)}
                  activeOpacity={0.7}
                  accessibilityLabel={`${isPeriod ? "Hapus" : "Catat"} menstruasi ${dateStr}`}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isPeriod && styles.dayCirclePeriod,
                      isToday && !isPeriod && styles.dayCircleToday,
                      isToday && isPeriod && styles.dayCircleTodayPeriod,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isPeriod && styles.dayTextPeriod,
                        isToday && !isPeriod && styles.dayTextToday,
                      ]}
                    >
                      {day}
                    </Text>
                    {isStart && (
                      <Text style={styles.dayBadgeTop}>🌸</Text>
                    )}
                    {isEnd && (
                      <Text style={styles.dayBadgeBottom}>✨</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#f472b6" }]} />
              <Text style={styles.legendText}>Menstruasi</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "transparent", borderWidth: 2, borderColor: "#ec4899" }]} />
              <Text style={styles.legendText}>Hari ini</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={{ fontSize: 12 }}>🌸</Text>
              <Text style={styles.legendText}>Mulai</Text>
            </View>
          </View>

          {/* Tap hint */}
          <Text style={styles.tapHint}>
            💡 Ketuk tanggal untuk mencatat atau menghapus menstruasi
          </Text>
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>📋 Riwayat Siklus</Text>
          {entries.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>Belum ada catatan siklus</Text>
              <Text style={styles.emptyHistorySubText}>Ketuk tanggal di kalender untuk mulai mencatat</Text>
            </View>
          ) : (
            [...entries]
              .reverse()
              .slice(0, 5)
              .map((entry, idx) => {
                const startDate = new Date(entry.startDate);
                const endDate = new Date(entry.endDate);
                return (
                  <View key={idx} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Text style={{ fontSize: 16 }}>🩸</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDateText}>
                        {startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        {" – "}
                        {endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                      <Text style={styles.historySubText}>{PERIOD_DURATION} hari</Text>
                    </View>
                    <View style={styles.historyCycleBadge}>
                      <Text style={styles.historyCycleText}>Siklus #{entries.length - idx}</Text>
                    </View>
                  </View>
                );
              })
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  scroll: {
    paddingBottom: 16,
  },
  notifBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 50,
  },
  notifText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  notifClose: {
    marginLeft: 8,
    padding: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#be185d",
  },
  appSubtitle: {
    fontSize: 12,
    color: "#f9a8d4",
    marginTop: 2,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
  },
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#f472b6",
    padding: 16,
    shadowColor: "#f9a8d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusBig: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  statusSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 12,
  },
  progressDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  btnContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  signInBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  signInBtnDefault: {
    backgroundColor: "#ec4899",
    shadowColor: "#f9a8d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  signInBtnActive: {
    backgroundColor: "#fce7f3",
    borderWidth: 2,
    borderColor: "#f9a8d4",
  },
  signInBtnLogged: {
    backgroundColor: "#fb7185",
  },
  signInBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  alreadyLoggedText: {
    textAlign: "center",
    fontSize: 12,
    color: "#f9a8d4",
    marginTop: 8,
  },
  calendarCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 16,
    shadowColor: "#f9a8d4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavArrow: {
    fontSize: 20,
    color: "#be185d",
    lineHeight: 24,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#be185d",
  },
  dayHeaderRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f9a8d4",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    paddingVertical: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCirclePeriod: {
    backgroundColor: "#f472b6",
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: "#ec4899",
  },
  dayCircleTodayPeriod: {
    backgroundColor: "#f472b6",
    borderWidth: 2,
    borderColor: "#fff",
  },
  dayText: {
    fontSize: 13,
    color: "#4b5563",
  },
  dayTextPeriod: {
    color: "#fff",
    fontWeight: "600",
  },
  dayTextToday: {
    color: "#ec4899",
    fontWeight: "700",
  },
  dayBadgeTop: {
    position: "absolute",
    top: -4,
    right: -4,
    fontSize: 8,
  },
  dayBadgeBottom: {
    position: "absolute",
    bottom: -4,
    right: -4,
    fontSize: 8,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 11,
    color: "#ec4899",
  },
  tapHint: {
    textAlign: "center",
    fontSize: 11,
    color: "#f9a8d4",
    marginTop: 12,
  },
  historySection: {
    marginHorizontal: 16,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#be185d",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyHistory: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 16,
    alignItems: "center",
  },
  emptyHistoryText: {
    fontSize: 13,
    color: "#f9a8d4",
  },
  emptyHistorySubText: {
    fontSize: 11,
    color: "#fbcfe8",
    marginTop: 4,
  },
  historyItem: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#fce7f3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyDateText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#be185d",
  },
  historySubText: {
    fontSize: 11,
    color: "#f9a8d4",
    marginTop: 2,
  },
  historyCycleBadge: {
    backgroundColor: "#fdf2f8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyCycleText: {
    fontSize: 11,
    color: "#f9a8d4",
  },
});
