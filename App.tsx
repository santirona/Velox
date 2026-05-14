import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import Slider from '@react-native-community/slider';

import i18nInstance from './src/i18n';
import { useTranslation } from 'react-i18next';
import { CartState } from './src/types';

export default function App() {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  const [carrito, setCarrito] = useState<CartState>({});
  const [faseApp, setFaseApp] = useState<number>(0); 
  const [tiempoRestante, setTiempoRestante] = useState<number>(3);
  const [codigoVisible, setCodigoVisible] = useState<string | null>(null);
  const [escaneando, setEscaneando] = useState<boolean>(false);

  // MENU STATES
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [tutorialVisible, setTutorialVisible] = useState<boolean>(true); 
  const [opcionesVisible, setOpcionesVisible] = useState<boolean>(false);
  
  // CONFIG STATES
  const [velocidadFlasheo, setVelocidadFlasheo] = useState<number>(500);

  // Language toggling 
  const toggleLanguage = () => {
    const currentLang = i18nInstance.language;
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    i18nInstance.changeLanguage(nextLang);
    setMenuVisible(false);
  };

  // Scanning logic
  const manejarEscaneo = (codigo: string) => {
    setEscaneando(false);
    
    setCarrito(prev => ({
      ...prev,
      [codigo]: {
        barcode: codigo,
        name: codigo, 
        quantity: (prev[codigo]?.quantity || 0) + 1
      }
    }));
  };

  const modificarCantidad = (codigo: string, delta: number) => {
    setCarrito(prev => {
      const nuevaCantidad = prev[codigo].quantity + delta;
      const nuevoCarrito = { ...prev };
      if (nuevaCantidad <= 0) {
        delete nuevoCarrito[codigo];
      } else {
        nuevoCarrito[codigo].quantity = nuevaCantidad;
      }
      return nuevoCarrito;
    });
  };

  // Flashing logic for checkout phases
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  useEffect(() => {
    let montado = true;
    const ejecutarFlasheo = async () => {
      if (faseApp === 1) {
        for (let i = 3; i > 0; i--) {
          if (!montado) return;
          setTiempoRestante(i);
          await delay(1000);
        }
        if (montado) setFaseApp(2);
      } else if (faseApp === 2) {
        const codigos = Object.keys(carrito);
        for (const codigo of codigos) {
          const cantidad = carrito[codigo].quantity;
          for (let i = 0; i < cantidad; i++) {
            if (!montado) return;
            setCodigoVisible(codigo);
            await delay(velocidadFlasheo); // Usa velocidad variable
            setCodigoVisible(null);
            await delay(400);
          }
        }
        if (montado) {
          setFaseApp(0);
        }
      }
    };
    ejecutarFlasheo();
    return () => { montado = false; };
  }, [faseApp, velocidadFlasheo]);


  // Camera render
  if (escaneando) {
    if (!permission?.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.titulo}>{t('camera_permission', 'Permiso de cámara requerido')}</Text>
          <TouchableOpacity style={styles.btnAccion} onPress={requestPermission}>
            <Text style={styles.btnText}>{t('grant_permission', 'Otorgar permiso')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={({ data }) => manejarEscaneo(data)}
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "qr", "upc_a"] }}
        />
        <View style={styles.mascaraCamara}>
          <View style={styles.huecoCamara} />
        </View>
        <TouchableOpacity style={styles.btnCancelarCamara} onPress={() => setEscaneando(false)}>
          <Text style={styles.btnText}>{t('cancel', 'Cancelar')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main menu render
  return (
    <View style={styles.container}>
      {faseApp === 0 && (
        <View style={styles.content}>
          
          {/* HEADER: Pay button & Burger Menu */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.btnPagar, Object.keys(carrito).length === 0 && styles.btnDeshabilitado]} 
              disabled={Object.keys(carrito).length === 0}
              onPress={() => setFaseApp(1)}
            >
              <Text style={styles.btnText}>{t('checkout_button', 'Pagar')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisible(true)}>
              <Text style={{ fontSize: 28 }}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Product list */}
          <ScrollView style={styles.lista}>
            {Object.values(carrito).map((producto) => (
              <View key={producto.barcode} style={styles.itemFila}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNombre} numberOfLines={1}>{producto.name}</Text>
                  <Text style={styles.itemCodigo} numberOfLines={1}>{t('code', 'Cód')}: {producto.barcode}</Text>
                </View>
                
                <View style={styles.controlesCantidad}>
                  <TouchableOpacity style={[styles.btnCirculo, { backgroundColor: '#F44336' }]} onPress={() => modificarCantidad(producto.barcode, -1)}>
                    <Text style={styles.btnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemCantidad}>{producto.quantity}</Text>
                  <TouchableOpacity style={[styles.btnCirculo, { backgroundColor: '#4CAF50' }]} onPress={() => modificarCantidad(producto.barcode, 1)}>
                    <Text style={styles.btnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* FOOTER: Scan button */}
          <TouchableOpacity style={styles.btnAccion} onPress={() => setEscaneando(true)}>
            <Text style={styles.btnText}>{t('scan_button', 'Escanear Código')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- MODAL: Burger Menu --- */}
      <Modal visible={menuVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalMenu}>
            <Text style={styles.titulo}>{t('menu', 'Menú')}</Text>
            
            <TouchableOpacity style={styles.btnMenuOption} onPress={() => { setMenuVisible(false); setTutorialVisible(true); }}>
              <Text style={styles.menuOptionText}>{t('tutorial', 'Cómo usar')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnMenuOption} onPress={() => { setMenuVisible(false); setOpcionesVisible(true); }}>
              <Text style={styles.menuOptionText}>{t('advanced_options', 'Opciones Avanzadas')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnMenuOption} onPress={toggleLanguage}>
              <Text style={styles.menuOptionText}>{t('change_lang', 'Cambiar Idioma')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnAccion, { backgroundColor: '#666', marginTop: 20 }]} onPress={() => setMenuVisible(false)}>
              <Text style={styles.btnText}>{t('close', 'Cerrar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: Tutorial --- */}
      <Modal visible={tutorialVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.titulo}>{t('tutorial', 'Cómo usar')}</Text>
            <Text style={styles.textoGeneral}>
              1. Usa el botón "Escanear" para agregar productos al carrito.{"\n\n"}
              2. Presiona "Pasar por Caja" para mostrar los codigos de barra rapidamente.{"\n\n"}
              3. Acerca la pantalla de tu celular al lector de códigos de barra del supermercado.
            </Text>
            <TouchableOpacity style={[styles.btnAccion, { marginTop: 30, width: '100%' }]} onPress={() => setTutorialVisible(false)}>
              <Text style={styles.btnText}>{t('got_it', 'Entendido')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: Opciones Avanzadas --- */}
      <Modal visible={opcionesVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.titulo}>{t('advanced_options', 'Opciones Avanzadas')}</Text>
            
            <Text style={[styles.textoGeneral, {marginTop: 20}]}>
              {t('speed_title', 'Velocidad de muestra')}: {velocidadFlasheo}ms
            </Text>
            <Slider
              style={{width: 250, height: 40, marginTop: 10}}
              minimumValue={100}
              maximumValue={1000}
              step={100}
              value={velocidadFlasheo}
              onValueChange={setVelocidadFlasheo}
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#2196F3"
            />
            <Text style={{fontSize: 12, color: '#666', textAlign: 'center'}}>
              {t('speed_desc', 'Ajusta qué tan rápido pasan los códigos frente al lector.')}
            </Text>

            <TouchableOpacity style={[styles.btnAccion, { marginTop: 30, width: '100%' }]} onPress={() => setOpcionesVisible(false)}>
              <Text style={styles.btnText}>{t('close', 'Cerrar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Showing phases */}
      {faseApp === 1 && (
        <View style={styles.center}>
          <Text style={styles.subtitulo}>{t('prepare_reader', 'Prepárate')}</Text>
          <Text style={styles.contadorTexto}>{tiempoRestante}</Text>
        </View>
      )}
      {faseApp === 2 && (
        <View style={styles.center}>
          <Text style={styles.subtitulo}>{t('scanning', 'Escaneando...')}</Text>
          <View style={{ height: 250, justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 10 }}>
            {codigoVisible && (
              <Barcode 
                value={codigoVisible} 
                format="CODE128" 
                height={150} 
                width={2} 
                background="#FFFFFF" 
                lineColor="#000000" 
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, paddingTop: 60, paddingBottom: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Headers
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  menuIcon: { padding: 10, marginLeft: 10 },
  
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  contadorTexto: { fontSize: 100, fontWeight: 'bold', color: 'red' },
  textoGeneral: { fontSize: 16, color: '#333', lineHeight: 24 },
  
  // Buttons
  btnAccion: { backgroundColor: '#2196F3', padding: 18, borderRadius: 10 },
  btnPagar: { backgroundColor: '#FF9800', padding: 18, borderRadius: 10, flex: 1 },
  btnDeshabilitado: { backgroundColor: '#ccc' },
  btnText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  
  // List
  lista: { flex: 1, marginBottom: 20 },
  itemFila: { flexDirection: 'row', backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, marginBottom: 10, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  itemInfo: { flex: 1, paddingRight: 10 },
  itemNombre: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  itemCodigo: { fontSize: 12, color: '#666' },
  controlesCantidad: { flexDirection: 'row', alignItems: 'center' },
  itemCantidad: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15 },
  btnCirculo: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalMenu: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalContent: { width: '90%', backgroundColor: '#fff', padding: 30, borderRadius: 15, alignItems: 'center' },
  btnMenuOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuOptionText: { fontSize: 18, textAlign: 'center', color: '#333' },

  // Camera
  mascaraCamara: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0)', justifyContent: 'center', alignItems: 'center' },
  huecoCamara: { width: 300, height: 150, backgroundColor: 'transparent', borderColor: 'white', borderWidth: 2, borderRadius: 10 },
  btnCancelarCamara: { position: 'absolute', bottom: 50, left: 50, right: 50, backgroundColor: '#F44336', padding: 15, borderRadius: 10 }
});