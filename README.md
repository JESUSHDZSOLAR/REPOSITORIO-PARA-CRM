# Proyecto SOLAREVER - Panel Administrativo

Resumen
--------
Este repositorio contiene la interfaz frontend del panel administrativo (archivos HTML/JS) y un backend Node/Express de soporte. El frontend incluye formularios para crear y editar clientes, subir documentos de soporte (CFE) a ImgBB y visualizar/editar registros.

Archivos clave
--------------
- `index.html`            : Formulario de creación de cliente y funcionalidad principal de subida a ImgBB.
- `nuevo - copia.html`    : Panel administrativo completo con lista de clientes, edición, reportes y auditoría. (Contiene la lógica de edición y vista previa de documentos).
- `crm-server-final.js`   : Backend Node/Express usado por la aplicación (puerto por defecto 3000 en las referencias del frontend).

Resumen del flujo de subida de documentos (CFE)
----------------------------------------------
1. El usuario selecciona un archivo en el input `#document-upload` (o `#edit-document-upload` en el formulario de edición).
2. El frontend crea un `FormData` y hace POST a `https://api.imgbb.com/1/upload` con la API key.
3. Si la respuesta es exitosa, la URL devuelta se guarda en el campo oculto `#imgbb-url` (o `#edit-imgbb-url`) y en `localStorage` con la clave `ultimoDocumentoCFE`.
4. La UI muestra una vista previa y un enlace al documento (`#document-preview` / `#edit-document-preview`).

Importante: seguridad de la API key
----------------------------------
Actualmente la API key de ImgBB (`IMGBB_API_KEY`) está definida en el código cliente para facilitar pruebas. Esto expone la clave públicamente y no es recomendado para producción.
Recomendaciones:
- Mover la lógica de subida al backend y usar la clave en el servidor.
- Alternativamente, crear un endpoint en el backend que acepte el archivo y lo suba a ImgBB, devolviendo solo la URL al cliente.

Cómo probar localmente (navegador)
----------------------------------
1. Servir los archivos estáticos con un servidor local (no uses `file://` para evitar problemas con algunos APIs y CORS). Por ejemplo, con Python 3:

```powershell
# Desde la raíz del proyecto
python -m http.server 5500
# Luego abre en el navegador:
# http://localhost:5500/index.html
```

O usa `live-server` o cualquier servidor estático de tu preferencia.

2. Inicia el backend (si necesitas funcionalidad de API):

```powershell
# Asumiendo que tienes Node.js instalado
node crm-server-final.js
# Asegúrate que el backend escuche en http://localhost:3000 (según referencias en el frontend)
```

3. Probar upload desde `index.html`:
- Abrir `http://localhost:5500/index.html`.
- Ir a la sección de documento CFE y seleccionar/arrastrar un archivo (PDF o imagen, < 32MB).
- Verificar en la pestaña Network la petición POST a `https://api.imgbb.com/1/upload` y que devuelva 200.
- Verificar que el campo oculto `#imgbb-url` se actualiza y que `localStorage.getItem('ultimoDocumentoCFE')` contiene la URL.

4. Probar edición desde `nuevo - copia.html`:
- Abrir `http://localhost:5500/nuevo%20-%20copia.html` (o el path correcto).
- En la lista de clientes pulsar "Editar" en un cliente que tenga `imgbb_url` guardado en la base de datos.
- Verificar que la sección de edición muestra la vista previa del documento y que `#edit-imgbb-url` contiene la URL.

Checklist de troubleshooting
---------------------------
- Si ves el error `Cannot set properties of null (setting 'value')`:
  - Asegúrate que el DOM contiene el input con id `edit-link-cfe` y `edit-imgbb-url` (ya se añadió en la versión actual).
- Si la petición a ImgBB falla:
  - Revisa la pestaña Network -> la petición POST. Comprueba el body y la URL. Revisa la respuesta JSON.
  - Revisa la consola (F12) para errores JS u otros errores de CORS / CSP.
- Si la subida no inicia:
  - Comprueba que el input file (`#document-upload`) existe y que el event listener está activo.

Notas para el mantenimiento del repositorio
------------------------------------------
- Comentarios: el archivo `nuevo - copia.html` cuenta ahora con comentarios JSDoc en las funciones críticas para ser entendible en un repositorio.
- Testing: añadir tests automáticos o scripts de integración para validar endpoints del backend y el flujo de subida reduciría regresiones.
- Seguridad: mover la subida de ImgBB al servidor y eliminar la clave del frontend.

Contacto
--------
Si quieres, puedo:
- Refactorizar la subida para usar el backend (creo el endpoint y actualizo el frontend).
- Añadir un pequeño script de pruebas (Node.js) que haga upload de ejemplo a ImgBB para validar la API key fuera del navegador.
- Añadir más documentación en otras secciones (reportes, auditoría, etc.).

---
README generado automáticamente por el asistente de desarrollo para facilitar pruebas y revisión del flujo de carga de documentos (CFE).