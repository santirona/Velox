import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "scan_button": "📷 Scan Product",
      "checkout_button": "🛒 Checkout",
      "prepare_reader": "Prepare the scanner...",
      "scanning": "Scanning...",
      "camera_permission": "We need your permission to show the camera",
      "grant_permission": "Grant Permission",
      "cancel": "Cancel",
      "code": "Code",
      "change_lang": "🇦🇷 Cambiar a Español",
      "menu": "Menu",
      "about_me": "About Me",
      "close": "Close",
      "about_text": "For me, supermarket lines have always been endless; with Velox, I aim to make them faster. If you liked it and want to donate a little something, you're more than welcome <3",
      "link_mp": "MercadoPago",
      "link_kofi": "Ko-fi"
    }
  },
  es: {
    translation: {
      "scan_button": "📷 Escanear Producto",
      "checkout_button": "🛒 Pasar por Caja",
      "prepare_reader": "Prepara el lector...",
      "scanning": "Escaneando...",
      "camera_permission": "Necesitamos permiso para usar la cámara",
      "grant_permission": "Dar Permiso",
      "cancel": "Volver",
      "code": "Cód",
      "change_lang": "🇺🇸 Change to English",
      "menu": "Menú",
      "about_me": "Acerca de mí",
      "close": "Cerrar",
      "about_text": "Para mi las colas del super siempre fueron eternas, con Velox las pretendo hacer mas rapidas. si te gusto y queres donar alguito sos bienvenido <3",
      "link_mp": "MercadoPago",
      "link_kofi": "Ko-fi"
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