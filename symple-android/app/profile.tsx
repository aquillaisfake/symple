import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const PROFILE_KEY = "symple_user_profile";

interface UserProfile {
  name: string;
  age: string;
  avatarUri: string | null;
}

const DEFAULT_PROFILE: UserProfile = { name: "", age: "", avatarUri: null };

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savedOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((stored) => {
      if (stored) {
        const p = JSON.parse(stored) as UserProfile;
        setProfile(p);
        setForm(p);
      }
    });
  }, []);

  function handleSave() {
    setProfile(form);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(form));
    setEditing(false);
    Animated.sequence([
      Animated.timing(savedOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(savedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Diperlukan", "Izinkan akses galeri untuk mengganti foto profil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setForm((f) => ({ ...f, avatarUri: result.assets[0].uri }));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Kembali"
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Profil Saya</Text>
            <Text style={styles.headerSubtitle}>SYMPLE Menstrual Tracker</Text>
          </View>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={editing ? handlePickImage : undefined}
              activeOpacity={editing ? 0.7 : 1}
            >
              {form.avatarUri ? (
                <Image source={{ uri: form.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={{ fontSize: 52 }}>👤</Text>
              )}
            </TouchableOpacity>
            {editing && (
              <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
                <Text style={{ fontSize: 14 }}>📷</Text>
              </TouchableOpacity>
            )}
          </View>

          {!editing && (
            <View style={styles.profileNameSection}>
              <Text style={styles.profileName}>{profile.name || "Nama belum diisi"}</Text>
              {profile.age ? (
                <Text style={styles.profileAge}>{profile.age} tahun</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Form / Info Card */}
        <View style={styles.card}>
          {editing ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>NAMA</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="Masukkan namamu"
                  placeholderTextColor="#f9a8d4"
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>UMUR</Text>
                <TextInput
                  style={styles.input}
                  value={form.age}
                  onChangeText={(v) => setForm((f) => ({ ...f, age: v }))}
                  placeholder="Masukkan umurmu"
                  placeholderTextColor="#f9a8d4"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setForm(profile); setEditing(false); }}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NAMA</Text>
                <Text style={styles.infoValue}>
                  {profile.name || <Text style={styles.infoEmpty}>Belum diisi</Text>}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>UMUR</Text>
                <Text style={styles.infoValue}>
                  {profile.age ? `${profile.age} tahun` : <Text style={styles.infoEmpty}>Belum diisi</Text>}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => { setForm(profile); setEditing(true); }}
              >
                <Text style={styles.editBtnText}>✏️ Edit Profil</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Saved Toast */}
      <Animated.View style={[styles.savedToast, { opacity: savedOpacity }]}>
        <Text style={styles.savedToastText}>✅ Profil berhasil disimpan!</Text>
      </Animated.View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 22,
    color: "#be185d",
    lineHeight: 26,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#be185d",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#f9a8d4",
    marginTop: 2,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#f9a8d4",
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#f9a8d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ec4899",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  profileNameSection: {
    marginTop: 16,
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#be185d",
  },
  profileAge: {
    fontSize: 13,
    color: "#f9a8d4",
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 20,
    shadowColor: "#f9a8d4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ec4899",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fbcfe8",
    borderRadius: 14,
    backgroundColor: "#fdf2f8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#831843",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fbcfe8",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ec4899",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#ec4899",
    alignItems: "center",
    shadowColor: "#f9a8d4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fce7f3",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f9a8d4",
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#be185d",
  },
  infoEmpty: {
    fontStyle: "italic",
    color: "#f9a8d4",
  },
  editBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#ec4899",
    alignItems: "center",
    shadowColor: "#f9a8d4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  savedToast: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: "#fb7185",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  savedToastText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});
