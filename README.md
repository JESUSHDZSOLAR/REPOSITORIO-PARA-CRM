# 🚀 README.md: SOLAREVER CRM - FASE 17 

## 1. 🌟 Resumen del Proyecto y Stack Tecnológico

Este repositorio contiene la versión **Fase 17 (04-11-2025)** del **CRM Solarever**. Es una aplicación monolítica ligera basada en sistemas BPM que está diseñada para la gestión de clientes y asesores, integrando funcionalidades de auditoría, seguimiento de interacciones y un sistema de autenticación de hardware (RFID).

### Stack Tecnológico

| Componente | Tecnología | Notas Clave |
| :--- | :--- | :--- |
| **Backend (API)** | **Node.js + Express** | Gestión de la API REST, seguridad (JWT, Rate Limiting), y conexión a BD. |
| **Base de Datos** | **PostgreSQL** | Fuente única de verdad para clientes, usuarios, asesores y auditoría. |
| **Frontend (UI)** | **HTML/CSS/JS Estático** | Interfaces de usuario para Login, Alta de Clientes y Administración/Edición. |
| **Hardware** | **ESP32 + RFID (MFRC522)** | Módulo para autenticación por tarjeta RFID, comunicándose con la API vía HTTP. |

---

## 2. 📁 Estructura del Proyecto (Archivos Clave)

| Archivo/Directorio | Descripción | Propósito en el Sistema |
| :--- | :--- | :--- |
| **`crm-server-final.js`** | Servidor Principal (Backend) | Expone la API REST, gestiona middleware de seguridad (Helmet, CORS) y sirve archivos estáticos. |
| **`login.html`** | Frontend: Acceso | Página de login con autenticación estándar y mecanismo de **polling** para RFID. |
| **`index.html`** | Frontend: Alta de Clientes | Formulario para registrar clientes y subida directa de documentos a **ImgBB** (punto de seguridad crítico). |
| **`nuevo - copia.html`** | Frontend: Gestión | Panel de administración: listado, edición, reportes PDF (`jspdf`) y visualización de documentos. |
| **`crm_backup_final.sql`** | Esquema PostgreSQL | Dump completo de la base de datos (tablas, relaciones y datos de muestra iniciales). |
| **`EP32_LOGIN1.ino`** | Firmware RFID | Código Arduino para ESP32/MFRC522 que llama al endpoint `/api/auth/rfid`. |
| **`.env.txt` / `.env.production.txt`** | Variables de Entorno | Ejemplos de configuración para desarrollo y producción. Contiene secretos. |
| **`package.json`** | Scripts y Dependencias | Define comandos de inicio (`start`, `dev`) y lista las dependencias Node.js. |

---

## 3. ⚙️ Requisitos del Sistema

Para la ejecución y el desarrollo de la aplicación se necesitan los siguientes componentes:

* **Node.js**: Versión **v18+** (definido en `package.json/engines`).
* **PostgreSQL**: Versión **12+** (recomendado).
* **npm**: Gestor de paquetes.
* **Hardware (Opcional)**: Placa **ESP32** y módulo **MFRC522** (requerido para la funcionalidad RFID).

---

## 4. 🔑 Variables de Entorno y Configuración de PostgreSQL

El servidor Express utiliza el módulo `dotenv` para cargar variables de entorno. Cree un archivo `.env` a partir de `.env.txt` y añádalo a su `.gitignore`.

| Variable | Descripción | Seguridad |
| :--- | :--- | :--- |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`). | **CRÍTICO:** Usar `production` en despliegues en vivo. |
| `PORT` | Puerto donde escucha el servidor (ej. `3000`). | Asegúrese de mapear este puerto en su *proxy* inverso (ej. Nginx). |
| `JWT_SECRET` | Clave secreta para firmar los Tokens Web JSON (JWT). | **CRÍTICO:** Debe ser una cadena fuerte, rotada y **NUNCA** comiteada con valores reales. |
| `DB_USER`/`DB_HOST`/ etc. | Credenciales de conexión a PostgreSQL. | Utilizar contraseñas fuertes y restringir el acceso a la BD por red. |

---

## 5. 🛠️ Instalación y Ejecución Local

### 5.1. Configuración de la Base de Datos

1.  Asegúrese de que su servidor PostgreSQL esté corriendo.
2.  Cree la base de datos y el usuario definidos en su archivo `.env`.
3.  **Aplique el Esquema:** Restaure el esquema de la base de datos usando el *dump* proporcionado:
    ```bash
    psql -U crm_user -d crm-server-final < crm_backup_final.sql
    ```

### 5.2. Instalación de Dependencias e Inicio del Servidor

1.  Clonar el repositorio y ejecutar:
    ```bash
    npm install
    ```
2.  **Ejecutar el Servidor:**
    * **Desarrollo (Recomendado):** Usa `nodemon`.
        ```bash
        npm run dev
        ```
    * **Producción / Manual:**
        ```bash
        npm run start:prod
        ```

---

## 6. 🌐 API REST - Endpoints del Servidor (`crm-server-final.js`)

El servidor Express expone una API REST bajo el prefijo `/api/`.

| Categoría | Endpoint | Método | Descripción | Autenticación |
| :--- | :--- | :--- | :--- | :--- |
| **Salud** | `/health` | `GET` | **Check de Salud.** Verifica el estado de la aplicación y la conexión a PostgreSQL. | Pública |
| **Autenticación** | `/api/auth/login` | `POST` | Autenticación con `username`/`password`. Retorna token JWT. | Pública (Rate-Limited) |
| **Autenticación** | `/api/auth/rfid` | `POST` | **Autenticación por Hardware.** Recibe un UID de RFID. | Pública (Rate-Limited) |
| **Clientes** | `/api/clientes` | `GET`/`POST` | Listar o Crear un nuevo cliente. | JWT Requerida |
| **Clientes** | `/api/clientes/:id` | `PUT`/`DELETE` | Actualizar o Eliminar un cliente. **Activa auditoría.** | JWT Requerida |
| **Auditoría** | `/api/auditoria/clientes` | `GET` | Historial de auditoría de clientes. | Admin |

---

## 7. 🤖 Integración de Hardware (ESP32/RFID)

El módulo **ESP32/MFRC522** se comunica con el *backend* de forma directa.

* **Firmware (`EP32_LOGIN1.ino`):** Realiza un **HTTP POST** al endpoint `/api/auth/rfid`. La constante `SERVER_URL` debe ser actualizada a la URL de dominio de producción.
* **Control de Estado:** El firmware implementa una lógica de **`debounce` de 5 segundos** entre lecturas del *mismo UID* para evitar sobrecarga del servidor.
* **Polling (Frontend):** La función `iniciarPollingRFIDLogin()` en `login.html` consulta el estado del último UID procesado por el ESP32 cada **2 segundos**.

---

## 8. 💻 Frontend: Puntos Críticos y Funcionalidad

| Archivo | Funcionalidad Clave | Nota de Seguridad Crítica |
| :--- | :--- | :--- |
| **`index.html`** | Formulario de Alta de Cliente. | La clave API de ImgBB está expuesta en el código. **Recomendación:** Migrar la subida de archivos al **Backend** para ocultar la clave. |
| **`login.html`** | Autenticación Estándar y RFID. | Lógica de `polling` y `resetearEstadoRFID()` para la comunicación con el hardware. |
| **`nuevo - copia.html`** | Listado, Edición y Reportes. | Utiliza `jspdf` para generación de documentos y gestión de *modals* de edición. |

---

## 9. 📜 Scripts de Ejecución Disponibles (`package.json`)

| Script | Comando | Propósito |
| :--- | :--- | :--- |
| `npm start` | `node crm-server-final.js` | Inicio simple del servidor. |
| `npm run dev` | `nodemon crm-server-final.js` | Desarrollo: Inicia con recarga automática. |
| `npm run production` | `NODE_ENV=production node ...` | Producción (Estilo POSIX). |
| `npm run start:prod` | `node crm-server-final.js` | Alternativa de producción (asume que `NODE_ENV` está seteado externamente). |

---

## 10. 🛡️ Seguridad, Despliegue y Mantenimiento
* **HTTPS:** El despliegue a producción requiere un **Certificado SSL** y un **Proxy Inverso** (Nginx/Load Balancer).
* **Auditoría de IP:** La función `obtenerIPReal(req)` requiere que el Proxy Inverso envíe la cabecera **`X-Forwarded-For`** para registrar IPs reales en la base de datos.
* **Seguridad:** El proyecto usa **Helmet** para *headers* de seguridad, **express-rate-limit** y **JWT** para autenticación.

Soporte y Contacto
Para reportar issues o solicitar soporte técnico, contactar al equipo de desarrollo.

¡CRM Solarever - Potenciando tu gestión de clientes! 🚀


* **HTTPS:** El despliegue a producción requiere un **Certificado SSL** y un **Proxy Inverso** (Nginx/Load Balancer).
* **Auditoría de IP:** La función `obtenerIPReal(req)` requiere que el Proxy Inverso envíe la cabecera **`X-Forwarded-For`** para registrar IPs reales en la base de datos.
* **Seguridad:** El proyecto usa **Helmet** para *headers* de seguridad, **express-rate-limit** y **JWT** para autenticación.

##Soporte y Contacto
Para reportar issues o solicitar soporte técnico, contactar al equipo de desarrollo.

¡CRM Solar - Potenciando tu gestión de clientes! 🚀








