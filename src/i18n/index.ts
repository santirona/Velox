import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "scan_button": "Scan   𝄃𝄂𝄀𝄁𝄃𝄂𝄂𝄃",
      "checkout_button": "Checkout     🛒",
      "prepare_reader": "Prepare the scanner...",
      "scanning": "Scanning...",
      "camera_permission": "We need your permission to show the camera",
      "grant_permission": "Grant Permission",
      "cancel": "Cancel",
      "code": "Code",
      "change_lang": "🇦🇷 Cambiar a Español",
      "menu": "Menu",
      "close": "Close"
    }
  },
  es: {
    translation: {
      "scan_button": "Escanear   𝄃𝄂𝄀𝄁𝄃𝄂𝄂𝄃",
      "checkout_button": "Pasar por Caja      🛒",
      "prepare_reader": "Prepara el lector...",
      "scanning": "Escaneando...",
      "camera_permission": "Necesitamos permiso para usar la cámara",
      "grant_permission": "Dar Permiso",
      "cancel": "Volver",
      "code": "Cód",
      "change_lang": "🇺🇸 Change to English",
      "menu": "Menú",
      "close": "Cerrar"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;