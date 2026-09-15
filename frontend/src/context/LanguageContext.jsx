import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);
const STORAGE_KEY = "foodmenu_lang"; // "en" | "hi"

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

// Core, high-traffic strings only (nav, header, settings). Any key not present
// falls back to the English string passed in, so the rest of the app keeps
// working untranslated until more keys are added here.
const dict = {
  en: {
    nav_home: "Home",
    nav_explore: "Explore",
    nav_ai: "AI Hub",
    nav_community: "Community",
    nav_saved: "Saved",
    nav_profile: "Profile",
    nav_settings: "Settings",
    nav_logout: "Logout",
    nav_generate: "Generate",
    title_home: "Home",
    title_recipes: "Explore",
    title_ai: "AI Hub",
    title_ai_create: "Generate Recipe",
    title_ai_result: "Your Recipe",
    title_community: "Community",
    title_community_create: "Create Post",
    title_saved: "Saved Recipes",
    title_profile: "Profile",
    title_profile_edit: "Edit Profile",
    title_settings: "Settings",
    title_notifications: "Notifications",
    title_default: "FoodMenu",
    settings_password: "Change Password",
    settings_feedback: "Give Feedback",
    settings_complaint: "Report a Complaint",
    settings_contact: "Contact Developer",
    settings_preferences: "Preferences",
    settings_theme: "Theme",
    settings_language: "Language",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
  },
  hi: {
    nav_home: "होम",
    nav_explore: "एक्सप्लोर",
    nav_ai: "AI हब",
    nav_community: "कम्युनिटी",
    nav_saved: "सेव किए गए",
    nav_profile: "प्रोफ़ाइल",
    nav_settings: "सेटिंग्स",
    nav_logout: "लॉगआउट",
    nav_generate: "जनरेट करें",
    title_home: "होम",
    title_recipes: "एक्सप्लोर",
    title_ai: "AI हब",
    title_ai_create: "रेसिपी जनरेट करें",
    title_ai_result: "आपकी रेसिपी",
    title_community: "कम्युनिटी",
    title_community_create: "पोस्ट बनाएं",
    title_saved: "सेव की गई रेसिपी",
    title_profile: "प्रोफ़ाइल",
    title_profile_edit: "प्रोफ़ाइल संपादित करें",
    title_settings: "सेटिंग्स",
    title_notifications: "सूचनाएं",
    title_default: "FoodMenu",
    settings_password: "पासवर्ड बदलें",
    settings_feedback: "फीडबैक दें",
    settings_complaint: "शिकायत दर्ज करें",
    settings_contact: "डेवलपर से संपर्क करें",
    settings_preferences: "प्राथमिकताएं",
    settings_theme: "थीम",
    settings_language: "भाषा",
    theme_light: "लाइट",
    theme_dark: "डार्क",
    theme_system: "सिस्टम",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  };

  const t = (key, fallback) => dict[language]?.[key] ?? dict.en[key] ?? fallback ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
