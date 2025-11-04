#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// ========================================
// ⚙️ CONFIGURACIÓN DE PINES
// ========================================
const int SS_PIN   = 5;
// GPIO5 - SDA del RFID 
const int RST_PIN  = 22;
// GPIO22 - RST del RFID 
const int LED_PIN  = 2;
// GPIO2 - LED interno/ONBOARD de la placa ESP32 (cambiar si usas uno externo)

// Pines SPI por defecto en ESP32:
// SCK = GPIO18, MISO = GPIO19, MOSI = GPIO23 (Usados en SPI.begin)

// ========================================
// 🌐 CONFIGURACIÓN DE CONEXIÓN
// ========================================
const char* WIFI_SSID   = "Jesus";
const char* WIFI_PASS   = "jes200445"; 
const char* SERVER_URL  = "http://10.98.211.79:3000/api/auth/rfid";
// ========================================
// ⏱️ PARÁMETROS DE CONTROL DE ESTADO
// ========================================
const unsigned long WIFI_CHECK_INTERVAL = 10000;
// 10 segundos
const unsigned long READ_DEBOUNCE_MS    = 5000;
// 5 segundos entre lecturas del MISMO UID
const unsigned long MAX_BLOCK_TIME_MS   = 30000;
// 30 segundos máximo de bloqueo para el UID

// ========================================
// 💾 VARIABLES DE ESTADO
// ========================================
MFRC522 mfrc522(SS_PIN, RST_PIN);
unsigned long lastWifiCheck = 0; 
String ultimoUID = ""; 
unsigned long ultimoTiempoLectura = 0;
// Control de flujo para evitar reintentos inmediatos y múltiples solicitudes
bool tarjetaProcesada = false;
// Indica si el UID actual ya fue enviado al servidor
unsigned long tiempoDesbloqueo = 0;
// Tiempo en que la tarjeta fue procesada
volatile bool solicitudEnProceso = false;
// Bandera para evitar solicitudes HTTP simultáneas

// ========================================
// 🛠️ FUNCIONES AUXILIARES
// ========================================

/**
 * @brief Convierte el byte array del UID a una cadena hexadecimal.
 */
String uidToString(MFRC522::Uid *uid) { 
  String s = "";
  for (byte i = 0; i < uid->size; i++) { 
    if (uid->uidByte[i] < 0x10) s += "0";
    s += String(uid->uidByte[i], HEX); 
  }
  s.toUpperCase();
  return s;
}

/**
 * @brief Conecta el ESP32 a la red WiFi.
 */
void connectToWiFi() {
  Serial.println("\nConectando a WiFi...");
  
  WiFi.mode(WIFI_STA); // Modo Estación
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) { // 20 segundos máximo
    delay(500);
    Serial.print("."); 
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado! ✅");
    Serial.print("IP address: "); 
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nError: No se pudo conectar al WiFi ❌");
  }
}

/**
 * @brief Verifica el estado del WiFi y reconecta si es necesario.
 */
void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Reconectando... 🔄");
    connectToWiFi();
  }
}

/**
 * @brief Función para parpadear el LED en caso de acceso denegado.
 */
void blinkDenied() {
  for(int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(300);
    digitalWrite(LED_PIN, LOW);
    delay(300);
  }
}

/**
 * @brief Función para encender el LED en caso de acceso concedido.
 */
void grantAccess() {
  digitalWrite(LED_PIN, HIGH);
  delay(3000); // 3 segundos de acceso
  digitalWrite(LED_PIN, LOW);
}

// ========================================
// 📡 FUNCIÓN PRINCIPAL DE COMUNICACIÓN
// ========================================

/**
 * @brief Envía el UID de la tarjeta al servidor HTTP.
 */
void enviarEvento(String uid) {
  if (solicitudEnProceso) {
    Serial.println("⏳ Esperando a que finalice la solicitud anterior..."); 
    return;
  }

  // Verificar conexión WiFi antes de proceder con la solicitud
  if (WiFi.status() != WL_CONNECTED) {
     Serial.println("❌ Sin conexión WiFi. No se pudo enviar evento.");
     blinkDenied();
     return;
  }

  solicitudEnProceso = true; 
  HTTPClient http;

  http.begin(SERVER_URL); 
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 segundos máximo para la respuesta

  String payload = "{\"uid\":\"" + uid + "\"}";
  Serial.println("📤 Enviando UID: " + uid); 
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) { 
    String response = http.getString();
    Serial.println("📥 Respuesta del servidor: " + response);
    
    // Parsear la respuesta JSON buscando "success":true y el rol
    if (response.indexOf("\"success\":true") != -1) {
      Serial.println("🎉 Acceso concedido por RFID");
      
      // Intentar extraer el rol si está disponible en la respuesta
      if (response.indexOf("\"role\":") != -1) {
        int roleStart = response.indexOf("\"role\":\"") + 8;
        int roleEnd = response.indexOf("\"", roleStart);
        String role = response.substring(roleStart, roleEnd);
        Serial.println("👤 Rol: " + role);
      }
      
      grantAccess();
    } else {
      Serial.println("❌ Acceso denegado por servidor - Llave incorrecta");
      blinkDenied();
    }
  } else {
    Serial.println("⚠️ Error HTTP: " + String(httpResponseCode)); 
    blinkDenied();
  }

  http.end();
  solicitudEnProceso = false;
}

// ========================================
// 🚀 SETUP
// ========================================
void setup() {
  Serial.begin(115200);
  Serial.println("\nIniciando Sistema RFID... 🚀"); 

  // Configurar e Inicializar pines
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); 

  // Inicializar SPI 
  // con los pines correctos para ESP32
  // SCK=18, MISO=19, MOSI=23, SS (no usado aquí, pero el hardware lo requiere)
  SPI.begin(18, 19, 23, SS_PIN); 
  mfrc522.PCD_Init(); 
  
  Serial.print("MFRC522 version: ");
  byte v = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
  Serial.println(v, HEX);
  Serial.println("Acercar tarjeta RFID al lector...");
  // Conectar a WiFi
  connectToWiFi();
  
  Serial.println("Sistema RFID listo - Esperando tarjetas... 💳");
}

// ========================================
// 🔄 LOOP PRINCIPAL
// ========================================
void loop() {
  unsigned long currentMillis = millis();
  // 1. Control de Conexión WiFi (No bloqueante)
  if (currentMillis - lastWifiCheck >= WIFI_CHECK_INTERVAL) {
    lastWifiCheck = currentMillis;
    checkWiFi(); 
  }

  // 2. Control de Bloqueo Automático (30 segundos)
  if (tarjetaProcesada && (currentMillis - tiempoDesbloqueo >= MAX_BLOCK_TIME_MS)) {
    tarjetaProcesada = false;
    ultimoUID = "";
    Serial.println("🔄 Bloqueo automático liberado después de 30 segundos");
  }

  // 3. Lectura RFID
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String currentUID = uidToString(&mfrc522.uid);
    mfrc522.PICC_HaltA();
    // Detener la tarjeta de inmediato para evitar relecturas

    // Lógica de Debounce/Bloqueo
    bool isSameUID = (currentUID == ultimoUID);
    bool debouncePassed = (currentMillis - ultimoTiempoLectura >= READ_DEBOUNCE_MS);
    
    // CASO 1: Es la misma tarjeta y ya fue procesada, pero el debounce NO ha pasado.
    // IGNORAR.
    if (isSameUID && tarjetaProcesada && !debouncePassed) {
      Serial.println("⏭️ UID ignorada (debounce activo): " + currentUID);
      return;
    }

    // CASO 2: Es una tarjeta NUEVA O la misma pero el debounce ya pasó (READ_DEBOUNCE_MS)
    //         O la misma tarjeta con bloqueo de 30s VENCIDO (MAX_BLOCK_TIME_MS ya lo manejaría antes).
    if (!tarjetaProcesada || !isSameUID || debouncePassed) {
        
        Serial.println("\n🎫 UID detectada: " + currentUID);
        // Actualizar estado para la solicitud
        tarjetaProcesada = true;
        ultimoUID = currentUID;
        ultimoTiempoLectura = currentMillis;
        tiempoDesbloqueo = currentMillis; 
        
        enviarEvento(currentUID); // Realizar la solicitud HTTP
        
        // Se elimina el delay(3000) al final del loop.
        // Se usa solo dentro de grantAccess.
    }
  }
}