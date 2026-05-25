import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// Dependency-free i18n for YourStrat. Two languages for now (English + Bahasa
// Indonesia), toggled from Profile → Language and persisted to AsyncStorage.
// Usage in a component:  const t = useT();  t("profile.account")
// Outside React (rare):  translate("profile.account")
export type Lang = "en" | "id";

export const LANGUAGES: { code: Lang; native: string; english: string }[] = [
  { code: "en", native: "English", english: "English" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian" },
];

const STORAGE_KEY = "yourstrat_language";

type Dict = Record<string, string>;

const en: Dict = {
  // common
  "common.cancel": "Cancel",
  "common.saveChanges": "Save changes",
  // tabs
  "tabs.today": "Today",
  "tabs.workouts": "Workouts",
  "tabs.nutrition": "Nutrition",
  "tabs.profile": "Profile",
  // profile — hero + trial
  "profile.title": "Profile",
  "profile.burnedAllTime": "calories burned · all-time",
  "profile.burnTallies": "Your all-time burn tallies here.",
  "profile.workoutsOne": "{n} workout",
  "profile.workoutsOther": "{n} workouts",
  "profile.avgEffort": " · avg effort {r}/10",
  "profile.trialAdmin": "Admin · unlimited food scans",
  "profile.trialActiveOne": "{days} day left · {today}/{limit} scans today",
  "profile.trialActiveOther": "{days} days left · {today}/{limit} scans today",
  "profile.trialEnded": "Trial ended · {today}/{limit} scans today",
  // profile — edit form
  "profile.editDetails": "Edit your details",
  "profile.editExpand": "Expand edit details",
  "profile.editCollapse": "Collapse edit details",
  "profile.afterSave": "After save: ~{cal} cal/day · P {p}g",
  "profile.units": "Units",
  "profile.metric": "Metric (kg, cm)",
  "profile.imperial": "Imperial (lb, in)",
  "profile.body": "Body",
  "profile.weight": "Weight ({u})",
  "profile.height": "Height ({u})",
  "profile.age": "Age",
  "profile.sex": "Sex",
  "profile.male": "Male",
  "profile.female": "Female",
  "profile.activity": "Activity",
  "activity.sedentary": "Sedentary",
  "activity.light": "Light",
  "activity.moderate": "Moderate",
  "activity.active": "Active",
  "activity.very_active": "Very active",
  "profile.goal": "Goal",
  "goal.lose": "Lose",
  "goal.maintain": "Maintain",
  "goal.gain": "Gain",
  "profile.updated": "Profile updated. Targets recalculated.",
  // profile — AI & scans
  "profile.aiSection": "AI & food scans",
  "profile.totalScans": "Total scans",
  "profile.thisWeek": "This week",
  "profile.avgConfidence": "Avg confidence",
  "profile.lowConfidence": "Low-confidence scans",
  "profile.howScanning": "How scanning works",
  // profile — account
  "profile.account": "Account",
  "profile.signOut": "Sign out",
  "profile.deleteAccount": "Delete account",
  "profile.deleteTitle": "Delete account?",
  "profile.deleteMessage": "This permanently deletes your profile, meals, and workout history. This cannot be undone.",
  "profile.deleteError": "Couldn't delete your account. Check your connection and try again.",
  // profile — language
  "profile.language": "Language",
};

const id: Dict = {
  // common
  "common.cancel": "Batal",
  "common.saveChanges": "Simpan perubahan",
  // tabs
  "tabs.today": "Hari Ini",
  "tabs.workouts": "Latihan",
  "tabs.nutrition": "Nutrisi",
  "tabs.profile": "Profil",
  // profile — hero + trial
  "profile.title": "Profil",
  "profile.burnedAllTime": "kalori terbakar · sepanjang waktu",
  "profile.burnTallies": "Total pembakaran kalori Anda muncul di sini.",
  "profile.workoutsOne": "{n} latihan",
  "profile.workoutsOther": "{n} latihan",
  "profile.avgEffort": " · rata-rata upaya {r}/10",
  "profile.trialAdmin": "Admin · pindai makanan tanpa batas",
  "profile.trialActiveOne": "{days} hari tersisa · {today}/{limit} pindaian hari ini",
  "profile.trialActiveOther": "{days} hari tersisa · {today}/{limit} pindaian hari ini",
  "profile.trialEnded": "Uji coba berakhir · {today}/{limit} pindaian hari ini",
  // profile — edit form
  "profile.editDetails": "Ubah detail Anda",
  "profile.editExpand": "Buka detail",
  "profile.editCollapse": "Tutup detail",
  "profile.afterSave": "Setelah disimpan: ~{cal} kal/hari · P {p}g",
  "profile.units": "Satuan",
  "profile.metric": "Metrik (kg, cm)",
  "profile.imperial": "Imperial (lb, in)",
  "profile.body": "Tubuh",
  "profile.weight": "Berat ({u})",
  "profile.height": "Tinggi ({u})",
  "profile.age": "Usia",
  "profile.sex": "Jenis kelamin",
  "profile.male": "Pria",
  "profile.female": "Wanita",
  "profile.activity": "Aktivitas",
  "activity.sedentary": "Tidak aktif",
  "activity.light": "Ringan",
  "activity.moderate": "Sedang",
  "activity.active": "Aktif",
  "activity.very_active": "Sangat aktif",
  "profile.goal": "Tujuan",
  "goal.lose": "Turun",
  "goal.maintain": "Pertahankan",
  "goal.gain": "Naik",
  "profile.updated": "Profil diperbarui. Target dihitung ulang.",
  // profile — AI & scans
  "profile.aiSection": "AI & pindai makanan",
  "profile.totalScans": "Total pindaian",
  "profile.thisWeek": "Minggu ini",
  "profile.avgConfidence": "Rata-rata keyakinan",
  "profile.lowConfidence": "Pindaian keyakinan rendah",
  "profile.howScanning": "Cara kerja pemindaian",
  // profile — account
  "profile.account": "Akun",
  "profile.signOut": "Keluar",
  "profile.deleteAccount": "Hapus akun",
  "profile.deleteTitle": "Hapus akun?",
  "profile.deleteMessage": "Ini menghapus permanen profil, makanan, dan riwayat latihan Anda. Tindakan ini tidak dapat dibatalkan.",
  "profile.deleteError": "Tidak dapat menghapus akun Anda. Periksa koneksi Anda lalu coba lagi.",
  // profile — language
  "profile.language": "Bahasa",
};

const DICTS: Record<Lang, Dict> = { en, id };

type Params = Record<string, string | number>;

function format(s: string, params?: Params): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

type I18nState = {
  lang: Lang;
  /** Set + persist. */
  setLang: (l: Lang) => void;
  /** Internal: apply a hydrated value without re-persisting. */
  _hydrate: (l: Lang) => void;
};

export const useI18n = create<I18nState>((set) => ({
  lang: "en",
  setLang: (lang) => {
    set({ lang });
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  },
  _hydrate: (lang) => set({ lang }),
}));

/** Load the saved language once at startup (call from the root layout). */
export async function loadLanguage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === "en" || raw === "id") useI18n.getState()._hydrate(raw);
  } catch {
    /* default to English */
  }
}

function lookup(lang: Lang, key: string, params?: Params): string {
  const dict = DICTS[lang] ?? en;
  return format(dict[key] ?? en[key] ?? key, params);
}

/** Reactive translator — components re-render when the language changes. */
export function useT() {
  const lang = useI18n((s) => s.lang);
  return (key: string, params?: Params) => lookup(lang, key, params);
}

/** Non-reactive translate, for code outside React render. */
export function translate(key: string, params?: Params): string {
  return lookup(useI18n.getState().lang, key, params);
}
