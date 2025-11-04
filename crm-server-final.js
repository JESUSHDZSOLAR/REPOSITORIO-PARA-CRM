const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ========================================
// CARGA MANUAL DE VARIABLES DE ENTORNO
// ========================================

// Cargar dotenv con debug
require('dotenv').config({ debug: true });

// Si dotenv no funciona, definir manualmente
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || '2011.susej',
  DB_USER: process.env.DB_USER || 'crm_user',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'crm', 
  DB_PASSWORD: process.env.DB_PASSWORD || '12345',
  DB_PORT: process.env.DB_PORT || 5432
};

console.log('🔧 Configuración cargada:', config);

const app = express();
const PORT = config.PORT;
const JWT_SECRET = config.JWT_SECRET;

// ========================================
// CONEXIÓN A POSTGRESQL CON CONFIG MANUAL
// ========================================

const client = new Client({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
});

client.connect()
  .then(() => console.log('✅ Conectado a la base de datos de PostgreSQL'))
  .catch(err => {
    console.error('❌ Error de conexión a la base de datos:', err.message);
    console.log('🔧 Configuración usada:', {
      user: config.DB_USER,
      host: config.DB_HOST,
      database: config.DB_NAME,
      password: config.DB_PASSWORD ? '***' : 'UNDEFINED',
      port: config.DB_PORT
    });
  });

// ========================================
// CONFIGURACIÓN DE MIDDLEWARES ESENCIALES
// ========================================

// Configurar Helmet con CSP permisivo para desarrollo
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://apis.google.com",
        "https://accounts.google.com", // ✅ AGREGAR GIS
        "'unsafe-inline'",
        "'unsafe-eval'"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.tailwindcss.com",
        "https://fonts.googleapis.com",
        "'unsafe-inline'"
      ],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'", 
        "http://localhost:3000", 
        "https://cdn.jsdelivr.net", 
        "https://cdnjs.cloudflare.com",
        "https://www.googleapis.com",
        "https://apis.google.com",
        "https://accounts.google.com",// ✅ AGREGAR GIS
        "https://accounts.google.com", // ✅ AGREGAR GIS
        "https://api.imgbb.com" // 🌟 ESTA ES LA CORRECCIÓN
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://content.googleapis.com", 
        "https://drive.google.com",
        "https://www.google.com" // ✅ AGREGAR
        
      ],
      childSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://content.googleapis.com",
        "https://www.google.com" // ✅ AGREGAR
      ]
    }
  },
  crossOriginEmbedderPolicy: false
}));


// Habilitar CORS para todas las solicitudes
app.use(cors());

// Middleware para parsear el body
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ========================================
// SERVIR ARCHIVOS ESTÁTICOS (CONFIGURACIÓN CORREGIDA)
// ========================================

// Servir TODOS los archivos estáticos desde el directorio actual
app.use(express.static(__dirname, {
  index: false, // No servir index.html automáticamente
  extensions: ['html', 'htm'] // Permitir extensiones HTML
}));

// Servir específicamente la carpeta img
app.use( express.static(path.join(__dirname, )));

// Middleware para logging de archivos estáticos
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|html|htm)$/)) {
    console.log(`📁 Sirviendo archivo estático: ${req.url}`);
  }
  next();
});

// Ruta explícita para el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta explícita para login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta explícita para dashboard.html (o como se llame tu tercer archivo)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'nuevo - copia.html'));
});

// ========================================
// CONFIGURACIÓN AVANZADA DE TRUST PROXY
// ========================================

app.set('trust proxy', false);

// Middleware de logging para cada petición
app.use((req, res, next) => {
  const ipReal = obtenerIPReal(req);
  const userAgent = req.headers['user-agent'] || 'Desconocido';
  
  console.log(`🌐 ${new Date().toISOString()} | IP: ${ipReal} | ${req.method} ${req.url} | User-Agent: ${userAgent.substring(0, 50)}...`);
  
  next();
});

// ========================================
// CONFIGURACIÓN AVANZADA DE RATE LIMITING
// ========================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Función para crear límites personalizados
const createRateLimit = (max, windowMinutes = 15, message = null) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: max,
    message: message || {
      success: false,
      message: `Límite de ${max} solicitudes cada ${windowMinutes} minutos excedido.`
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // No contar solicitudes de health check
      if (req.url === '/health' || req.url === '/api/health') return true;
      
      // En desarrollo, ser más permisivo con archivos estáticos
      if (isDevelopment && req.method === 'GET' && 
          (req.url.includes('.') || req.url === '/')) {
        return true;
      }
      return false;
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: `Demasiadas solicitudes. Límite: ${max} cada ${windowMinutes} minutos.`,
        resetTime: new Date(Date.now() + (windowMinutes * 60 * 1000)).toISOString()
      });
    }
  });
};

// ========================================
// LÍMITES ESPECÍFICOS POR TIPO DE RUTA
// ========================================

// 🔒 Límites estrictos para autenticación
const authLimiter = createRateLimit(
  isDevelopment ? 100 : 50,
  15,
  'Demasiados intentos de autenticación.'
);

// 📊 Límites normales para API
const apiLimiter = createRateLimit(
  isDevelopment ? 1000 : 500,
  15
);

// 📁 Límites generosos para archivos estáticos
const staticLimiter = createRateLimit(
  isDevelopment ? 5000 : 2000,
  15
);

// 🔐 Límite específico para RFID (más restrictivo)
const rfidLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 5,
  message: 'Demasiadas solicitudes RFID. Espera 15 segundos.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.uid ? `rfid:${req.body.uid}` : 'rfid:unknown';
  }
});

// ========================================
// APLICAR LÍMITES A RUTAS ESPECÍFICAS (DESPUÉS DE STATIC)
// ========================================

// Archivos estáticos - límites generosos (AHORA SÍ funciona correctamente)
app.use(staticLimiter);

// Autenticación - límites estrictos
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/registro', authLimiter);
app.use('/api/auth/rfid', rfidLimiter);

// API routes - límites normales
app.use('/api/asesores', apiLimiter);
app.use('/api/clientes', apiLimiter);
app.use('/api/interacciones', apiLimiter);
app.use('/api/reportes', apiLimiter);
app.use('/api/auditoria', apiLimiter);

// Límite global de respaldo (más permisivo)
app.use(createRateLimit(
  isDevelopment ? 2000 : 1000,
  15
));

console.log(`✅ Rate limiting configurado para entorno: ${process.env.NODE_ENV}`);


// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Asesor no encontrado' });
  }

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.user = decodificado;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token no válido.' });
  }
};

// ========================================
// RUTAS DE AUTENTICACIÓN Y USUARIOS
// ========================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userQuery = 'SELECT id, username, password, role FROM usuarios WHERE username = $1';
    const { rows } = await client.query(userQuery, [username]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, message: 'Login exitoso.', token, user: { id: user.id, username: user.username, role: user.role } });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// POST /api/auth/registro - Crear un nuevo usuario (solo para admins)
app.post('/api/auth/registro', verificarToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Solo administradores pueden registrar usuarios.' });
  }

  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role';
    const { rows } = await client.query(query, [username, hashedPassword, role]);
    res.status(201).json({ success: true, message: 'Usuario registrado con éxito.', data: rows[0] });

  } catch (error) {
    if (error.code === '23505') { // Código de error para duplicado de unique
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya existe.' });
    }
    console.error('Error en el registro:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ========================================
// RUTAS DE ASESORES
// ========================================

// POST /api/asesores - Crear un nuevo asesor
app.post('/api/asesores', verificarToken, async (req, res) => {
let { nombre, correo, telefono, fecha_ingreso } = req.body;
correo = correo.trim().toLowerCase();

  try {
    const query = `
      INSERT INTO asesores (nombre, correo, telefono, fecha_ingreso)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [nombre, correo, telefono, fecha_ingreso];

    const { rows } = await client.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Asesor agregado exitosamente.',
      data: rows[0]
    });

  } catch (error) {
    console.error('Error al crear asesor:', error);

    // Duplicado de correo (constraint UNIQUE en PostgreSQL)
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado. Usa otro correo.'
      });
    }

    // Formato de fecha incorrecto
    if (error.code === '22007') {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Usa YYYY-MM-DD.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.'
    });
  }
});


// GET /api/asesores - Obtener todos los asesores
// GET /api/asesores - Obtener todos los asesores
app.get('/api/asesores', async (req, res) => {
  try {
    console.log('📋 Solicitando lista de asesores');
    const result = await client.query('SELECT * FROM asesores ORDER BY nombre');
    console.log(`✅ ${result.rows.length} asesores encontrados en la BD`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error al obtener asesores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// GET /api/asesores/:id - Obtener un asesor por su ID
app.get('/api/asesores/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM asesores WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asesor no encontrado.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener asesor:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// PUT /api/asesores/:id - Actualizar un asesor
app.put('/api/asesores/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
let { nombre, correo, telefono, fecha_ingreso } = req.body;
correo = correo.trim().toLowerCase();
  try {
    const query = 'UPDATE asesores SET nombre = $1, correo = $2, telefono = $3, fecha_ingreso = $4 WHERE id = $5 RETURNING *';
    const values = [nombre, correo, telefono, fecha_ingreso, id];
    const { rows } = await client.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asesor no encontrado.' });
    }
    res.json({ success: true, message: 'Asesor actualizado exitosamente.', data: rows[0] });
  } catch (error) {
    console.error('Error al actualizar asesor:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// DELETE /api/asesores/:id - Eliminar asesor
app.delete('/api/asesores/:id', verificarToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Solo administradores pueden eliminar asesores.' });
  }
  const { id } = req.params;
  try {
    // Reasignar clientes del asesor eliminado a null
    await client.query('UPDATE clientes SET asesor_id = NULL WHERE asesor_id = $1', [id]);
    const { rows } = await client.query('DELETE FROM asesores WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Asesor no encontrado.' });
    }
    res.json({ success: true, message: 'Asesor eliminado exitosamente.', data: rows[0] });
  } catch (error) {
    console.error('Error eliminando asesor:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});


// ========================================
// RUTAS DE CLIENTES
// ========================================

// GET /api/clientes - Obtener todos los clientes
app.get('/api/clientes', verificarToken, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM clientes ORDER BY fecha_creacion DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// POST /api/clientes - Crear nuevo cliente
// POST /api/clientes - Crear nuevo cliente (ACTUALIZADO)
app.post('/api/clientes', verificarToken, async (req, res) => {
  const {
    nombre, empresa, telefono, celular, correo, asesor_id,
    domicilio, descripcion_proyecto, tipo_sistema, tipo_proyecto, ubicacion,
    tarifa_cfe, cedis, razon_social, consumo_promedio, porcentaje_ahorro, link_cfe
  } = req.body;

  try {
    const query = `
      INSERT INTO clientes (
        nombre, empresa, telefono, celular, correo, asesor_id,
        domicilio, descripcion_proyecto, tipo_sistema, tipo_proyecto, ubicacion,
        tarifa_cfe, cedis, razon_social, consumo_promedio, porcentaje_ahorro, link_cfe,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'pendiente')
      RETURNING *;
    `;
    
    const values = [
      nombre, empresa, telefono, celular, correo, asesor_id,
      domicilio, descripcion_proyecto, tipo_sistema, tipo_proyecto, ubicacion,
      tarifa_cfe, cedis, razon_social, consumo_promedio, porcentaje_ahorro, link_cfe
    ];

    const { rows } = await client.query(query, values);
    
    // REGISTRAR AUDITORÍA CON IP CORRECTA
    await registrarAuditoria(
      'crear', 
      rows[0].id, 
      req.user.id, 
      { 
        cliente_nuevo: {
          nombre: nombre,
          correo: correo,
          celular: celular,
          asesor_id: asesor_id
        }
      },
      obtenerIPReal(req) // 👈 IP corregida
    );

    res.status(201).json({ success: true, message: 'Cliente agregado exitosamente.', data: rows[0] });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
    }
    
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});


// GET /api/clientes/:id - Obtener un cliente por su ID
app.get('/api/clientes/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// PUT /api/clientes/:id - Actualizar un cliente
// PUT /api/clientes/:id - Actualizar un cliente (CON AUDITORÍA COMPLETA)
app.put('/api/clientes/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  
  console.log('=== INICIO ACTUALIZACIÓN CLIENTE ===');
  console.log('Cliente ID:', id);
  console.log('Usuario:', req.user);
  console.log('Datos recibidos:', req.body);
  
  try {
    // Obtener datos actuales del cliente para comparar
    const clienteExistente = await client.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (clienteExistente.rows.length === 0) {
      console.log('ERROR: Cliente no encontrado');
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    }

    const clienteActual = clienteExistente.rows[0];
    const camposCambiados = {};

    // Construir la consulta UPDATE dinámicamente y detectar cambios
    const camposPermitidos = [
      'nombre', 'empresa', 'telefono', 'celular', 'correo', 'asesor_id',
      'domicilio', 'descripcion_proyecto', 'tipo_sistema', 'tipo_proyecto', 'ubicacion',
      'tarifa_cfe', 'cedis', 'razon_social', 'consumo_promedio', 'porcentaje_ahorro',
      'ahorro_anual', 'documento_cfe', 'link_cfe', 'status'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined && req.body[campo] !== clienteActual[campo]) {
        updates.push(`${campo} = $${paramCount}`);
        values.push(req.body[campo]);
        
        // Registrar campo cambiado para auditoría
        camposCambiados[campo] = {
          anterior: clienteActual[campo],
          nuevo: req.body[campo]
        };
        
        paramCount++;
        console.log(`Campo ${campo} cambiado:`, clienteActual[campo], '→', req.body[campo]);
      }
    });

    // Si no hay campos para actualizar
    if (updates.length === 0) {
      console.log('INFO: No hay cambios detectados');
      return res.status(200).json({ 
        success: true, 
        message: 'No se detectaron cambios para actualizar.', 
        data: clienteActual 
      });
    }

    // Agregar fecha_actualizacion automáticamente
    updates.push('fecha_actualizacion = NOW()');
    
    // Agregar el ID al final de los valores
    values.push(id);

    const query = `
      UPDATE clientes 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    console.log('Query a ejecutar:', query);
    console.log('Valores:', values);
    console.log('Campos cambiados:', camposCambiados);

    const { rows } = await client.query(query, values);
    
    // REGISTRAR AUDITORÍA DE ACTUALIZACIÓN SOLO SI HUBO CAMBIOS
    if (Object.keys(camposCambiados).length > 0) {
     await registrarAuditoria(
  'actualizar', 
  id, 
  req.user.id, 
  camposCambiados,
  obtenerIPReal(req) // 👈 NUEVA FUNCIÓN
);

    }
    
    console.log('=== ACTUALIZACIÓN EXITOSA ===');
    console.log('Cliente actualizado:', rows[0]);
    
    res.json({ 
      success: true, 
      message: 'Cliente actualizado exitosamente.', 
      data: rows[0] 
    });

  } catch (error) {
    console.error('=== ERROR EN ACTUALIZACIÓN ===');
    console.error('Error completo:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo electrónico ya está registrado.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al actualizar cliente.' 
    });
  }
});
// crm-server-final.js: Reemplaza la función app.delete por esta versión:

// DELETE /api/clientes/:id - Eliminar un cliente (CON AUDITORÍA)
app.delete('/api/clientes/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Obtener datos del cliente antes de eliminar para auditoría
    const clienteEliminado = await client.query('SELECT * FROM clientes WHERE id = $1', [id]);
    
    // Ejecutar la eliminación
    const { rows } = await client.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    }

    // Registrar la auditoría con los datos obtenidos antes de la eliminación
    await registrarAuditoria(
      'eliminar', 
      id, 
      req.user.id, 
      { 
        cliente_eliminado: {
          nombre: clienteEliminado.rows[0].nombre,
          correo: clienteEliminado.rows[0].correo,
          empresa: clienteEliminado.rows[0].empresa
        }
      },
      obtenerIPReal(req)
    );
    
    res.json({ 
      success: true, 
      message: 'Cliente eliminado exitosamente.', 
      data: rows[0] 
    });
    
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor.' 
    });
  }
});
// Ruta pública para recibir datos del formulario (sin autenticación)

app.post('/api/clientes/public', async (req, res) => {
  const { 
    nombre, empresa, telefono, celular, correo, asesor_id,
    domicilio, descripcion_proyecto, tipo_sistema, tipo_proyecto, ubicacion, 
    tarifa_cfe, cedis, razon_social, consumo_promedio, porcentaje_ahorro,
    imgbb_url, documento_subido  // ✅ NUEVOS CAMPOS DE IMGBB
  } = req.body; 
  
  try {
    const query = `
      INSERT INTO clientes (
        nombre, empresa, telefono, celular, correo, asesor_id,
        domicilio, descripcion_proyecto, tipo_sistema, tipo_proyecto, ubicacion,
        tarifa_cfe, cedis, razon_social, consumo_promedio, porcentaje_ahorro, 
        imgbb_url, documento_subido, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `;
    
    const values = [
      nombre, empresa, telefono, celular, correo, asesor_id,
      domicilio, descripcion_proyecto, tipo_sistema, tipo_proyecto, ubicacion,
      tarifa_cfe, cedis, razon_social, consumo_promedio, porcentaje_ahorro,
      imgbb_url, documento_subido,  // ✅ AGREGAR VALORES
      'pendiente'
    ];
    
    const { rows } = await client.query(query, values);
    
    console.log('📁 Cliente creado con documento ImgBB:', {
      id: rows[0].id,
      documento_url: imgbb_url
    });
    
    res.status(201).json({ success: true, message: 'Cliente y documento agregados exitosamente.', data: rows[0] });

  } catch (error) {
    console.error('Error al crear cliente público:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
    }
    
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ========================================
// RUTAS DE INTERACCIONES
// ========================================

// POST /api/interacciones - Registrar una nueva interacción
app.post('/api/interacciones', verificarToken, async (req, res) => {
  const { cliente_id, tipo, notas, resultado, fecha } = req.body;
  try {
    const query = `
      INSERT INTO interacciones (cliente_id, tipo, notas, resultado, fecha)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [cliente_id, tipo, notas, resultado, fecha || new Date()];
    const { rows } = await client.query(query, values);
    res.status(201).json({ success: true, message: 'Interacción registrada con éxito.', data: rows[0] });
  } catch (error) {
    console.error('Error al registrar interacción:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});
// Mostrar interacciones de los últimos 7 días
app.get('/api/interacciones', verificarToken, async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 15; // Últimos 7 días por defecto
    
    const query = `
      SELECT i.*, c.nombre as cliente_nombre, c.empresa as cliente_empresa
      FROM interacciones i
      LEFT JOIN clientes c ON i.cliente_id = c.id
      WHERE i.fecha >= NOW() - INTERVAL '${dias} days'
      ORDER BY i.fecha DESC
      LIMIT 100
    `;
    
    const { rows } = await client.query(query);
    
    res.json({ 
      success: true, 
      data: rows 
    });
    
  } catch (error) {
    console.error('Error al obtener interacciones recientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor.' 
    });
  }
});
// En crm-server-final.js - RUTA MEJORADA PARA REPORTES
app.get('/api/reportes/clientes', verificarToken, async (req, res) => {
  try {
    const { fechaInicio, fechaFin, estado, asesor, orden } = req.query;
    
    console.log('=== SOLICITUD DE REPORTE ===');
    console.log('Parámetros recibidos:', { fechaInicio, fechaFin, estado, asesor, orden });
    
    // Validar parámetros requeridos
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas de inicio y fin son requeridas'
      });
    }
    
    let query = `
      SELECT 
        c.*,
        COUNT(i.id) as total_interacciones,
        a.nombre as asesor_nombre
      FROM clientes c
      LEFT JOIN interacciones i ON c.id = i.cliente_id
      LEFT JOIN asesores a ON c.asesor_id = a.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    // Filtro por fecha
    query += ` AND c.fecha_creacion BETWEEN $${paramCount} AND $${paramCount + 1}`;
    values.push(fechaInicio, fechaFin + ' 23:59:59');
    paramCount += 2;
    
    // Filtro por estado
    if (estado && estado !== 'todos') {
      query += ` AND c.status = $${paramCount}`;
      values.push(estado);
      paramCount++;
    }
    
    // Filtro por asesor
    if (asesor && asesor !== 'todos') {
      query += ` AND c.asesor_id = $${paramCount}`;
      values.push(parseInt(asesor));
      paramCount++;
    }
    
    // Agrupar
    query += ` GROUP BY c.id, a.nombre`;
    
    // Ordenar
    const ordenMap = {
      'fecha_creacion': 'c.fecha_creacion DESC',
      'nombre': 'c.nombre ASC',
      'estado': 'c.status ASC',
      'asesor': 'a.nombre ASC'
    };
    
    query += ` ORDER BY ${ordenMap[orden] || 'c.fecha_creacion DESC'}`;
    
    console.log('Query ejecutado:', query);
    console.log('Valores:', values);
    
    const { rows } = await client.query(query, values);
    
    console.log(`Reporte generado: ${rows.length} clientes encontrados`);
    
    res.json({
      success: true,
      data: rows,
      metadata: {
        total: rows.length,
        periodo: `${fechaInicio} a ${fechaFin}`,
        fechaGeneracion: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error al generar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar reporte: ' + error.message
    });
  }
});

// GET /api/interacciones/:cliente_id - Obtener interacciones de un cliente
app.get('/api/interacciones/:cliente_id', verificarToken, async (req, res) => {
  const { cliente_id } = req.params;
  try {
    const result = await client.query('SELECT * FROM interacciones WHERE cliente_id = $1 ORDER BY fecha DESC', [cliente_id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener interacciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});
// ========================================
// FUNCIÓN DE AUDITORÍA AUTOMÁTICA
// ========================================

const registrarAuditoria = async (accion, cliente_id, usuario_id, camposCambiados = null, ip_address = null) => {
  try {
    console.log(`📝 Registrando auditoría: ${accion} para cliente ${cliente_id} por usuario ${usuario_id}`);
    console.log(`🌐 IP registrada: ${ip_address}`);
    
    const query = `
      INSERT INTO auditoria_clientes (accion, cliente_id, usuario_id, campos_cambiados, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const valoresCambiados = camposCambiados ? JSON.stringify(camposCambiados) : null;
    
    // Obtener user-agent para más contexto
    const userAgent = 'CRM-Solarever-WebApp'; // Puedes obtenerlo del req si lo pasas
    
    await client.query(query, [accion, cliente_id, usuario_id, valoresCambiados, ip_address, userAgent]);
    console.log('✅ Auditoría registrada exitosamente');
    
  } catch (error) {
    console.error('❌ Error al registrar auditoría:', error);
    console.error('Detalles del error:', error.stack);
  }
};

// ========================================
// FUNCIÓN DEFINITIVA PARA OBTENER IP REAL
// ========================================

// ========================================
// FUNCIÓN MEJORADA PARA OBTENER IP REAL
// ========================================

const obtenerIPReal = (req) => {
  try {
    // 1. Headers de proxies confiables
    let ip = req.headers['x-forwarded-for'];
    if (ip) {
      // Tomar la primera IP de la lista (la del cliente real)
      const ipList = ip.split(',').map(ip => ip.trim());
      return ipList[0];
    }
    
    // 2. Headers de cloud providers
    ip = req.headers['x-real-ip'] || 
         req.headers['x-client-ip'] || 
         req.headers['cf-connecting-ip'];
    
    if (ip) return ip;
    
    // 3. Conexión directa
    ip = req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    // Limpiar y formatear la IP
    if (ip) {
      return ip.toString()
        .replace('::ffff:', '')
        .replace('::1', '127.0.0.1')
        .split(':')[0]; // Remover puerto si existe
    }
    
    return '127.0.0.1';
    
  } catch (error) {
    console.error('Error obteniendo IP real:', error);
    return '127.0.0.1';
  }
};


// Aplicar el rate limiting corregido a la ruta RFID
app.post('/api/auth/rfid', rfidLimiter, async (req, res) => {
  const { uid } = req.body;
  console.log(`🔐 Solicitud RFID UID=${uid}`);

  try {
    const query = 'SELECT id, username, role, rfid_uid FROM usuarios WHERE rfid_uid = $1';
    const result = await client.query(query, [uid]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Token de 30 minutos para RFID
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '30m' }
      );

      // Guardar con UID incluido
      ultimoRFID = {
        token,
        user,
        timestamp: new Date().toISOString(),
        uid: uid // ← AGREGAR ESTO
      };

      // Registrar acceso exitoso
      await client.query(
        `INSERT INTO auditoria_accesos (usuario_id, fecha_acceso, metodo, estado)
         VALUES ($1, NOW(), 'RFID', 'permitido')`,
        [user.id]
      );

      console.log(`✅ Acceso permitido: ${user.username} (Rol: ${user.role})`);
      res.json({
        success: true,
        accessGranted: true, // ← NUEVO CAMPO
        message: `Acceso permitido a ${user.username}`,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token: token,
        rfidUID: uid // ← NUEVO CAMPO
      });

    } else {
      // 🔥 ACCESO DENEGADO - RFID no encontrado
      await client.query(
        `INSERT INTO auditoria_accesos (usuario_id, fecha_acceso, metodo, estado)
         VALUES (NULL, NOW(), 'RFID', 'denegado')`
      );

      console.log(`❌ Acceso denegado UID=${uid}`);
      res.json({
        success: false,
        accessGranted: false,
        message: 'Llave incorrecta: UID no registrado.'
      });
    }

  } catch (error) {
    // 🔥 ERROR DEL SERVIDOR
    console.error('❌ Error crítico en autenticación RFID:', error);
    
    res.status(500).json({ 
      success: false,
      accessGranted: false, // Importante para el cliente
      message: 'Error interno del servidor: ' + error.message
    });
  }
});
// 🔥 MEJORAR RUTA DE RESET - Limpiar más efectivamente
app.post('/api/rfid/reset', (req, res) => {
  console.log('🧹 LIMPIANDO acceso RFID por cierre de sesión');
  ultimoRFID = null;
  
  // Limpiar cualquier token pendiente en la base de datos si es necesario
  // (aquí puedes agregar lógica adicional si usas base de datos para tokens)
  
  res.json({ 
    success: true, 
    message: 'Acceso RFID limpiado completamente' 
  });
});
// ========================================
// MIDDLEWARES DE PERMISOS
// ========================================

// Middleware para verificar si el usuario puede acceder a asesores
const puedeVerAsesores = (req, res, next) => {
  if (req.user.role === 'restricted') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. No tienes permisos para ver asesores.' 
    });
  }
  next();
};

// Middleware para verificar si el usuario puede modificar asesores
const puedeModificarAsesores = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. Solo administradores pueden modificar asesores.' 
    });
  }
  next();
};
// GET /api/usuarios - Obtener lista de usuarios (SOLO ADMIN)
app.get('/api/usuarios', verificarToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado. Solo administradores pueden ver usuarios.' 
        });
    }
    
    try {
        const result = await client.query('SELECT id, username, role FROM usuarios ORDER BY username');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});
// GET /api/auditoria/clientes - Obtener historial de cambios (SOLO ADMIN) - VERSIÓN CORREGIDA Y SIMPLIFICADA
app.get('/api/auditoria/clientes', verificarToken, async (req, res) => {
  // Verificar que solo admins pueden acceder
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. Solo administradores pueden ver la auditoría.' 
    });
  }
  
  try {
    const { 
      fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
      fechaFin = new Date().toISOString().split('T')[0],
      cliente_id, 
      usuario_id, 
      accion, 
      limite = 50, 
      pagina = 1, 
      orden = 'fecha_desc' 
    } = req.query;
    
    console.log('🔍 Parámetros auditoría recibidos:', { 
      fechaInicio, 
      fechaFin, 
      cliente_id, 
      usuario_id, 
      accion, 
      limite, 
      pagina, 
      orden 
    });

    // Construir consulta base
    let query = `
      SELECT 
        ac.id,
        ac.accion,
        ac.fecha,
        ac.cliente_id,
        ac.usuario_id,
        ac.campos_cambiados,
        ac.ip_address,
        ac.user_agent,
        u.username as usuario_nombre,
        u.role as usuario_role,
        c.nombre as cliente_nombre,
        c.empresa as cliente_empresa
      FROM auditoria_clientes ac
      LEFT JOIN usuarios u ON ac.usuario_id = u.id
      LEFT JOIN clientes c ON ac.cliente_id = c.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Filtro por fecha (siempre aplicar)
    query += ` AND ac.fecha >= $${paramCount}::date AND ac.fecha <= $${paramCount + 1}::date + INTERVAL '1 day'`;
    values.push(fechaInicio, fechaFin);
    paramCount += 2;
    
    // Filtro por cliente
    if (cliente_id && cliente_id !== 'todos' && cliente_id !== 'undefined') {
      query += ` AND ac.cliente_id = $${paramCount}`;
      values.push(parseInt(cliente_id));
      paramCount++;
    }
    
    // Filtro por usuario
    if (usuario_id && usuario_id !== 'todos' && usuario_id !== 'undefined') {
      query += ` AND ac.usuario_id = $${paramCount}`;
      values.push(parseInt(usuario_id));
      paramCount++;
    }
    
    // Filtro por acción
    if (accion && accion !== 'todos' && accion !== 'undefined') {
      query += ` AND ac.accion = $${paramCount}`;
      values.push(accion);
      paramCount++;
    }
    
    // Ordenar
    const ordenMap = {
      'fecha_desc': 'ac.fecha DESC',
      'fecha_asc': 'ac.fecha ASC',
      'usuario': 'u.username ASC',
      'cliente': 'c.nombre ASC',
      'accion': 'ac.accion ASC'
    };
    
    query += ` ORDER BY ${ordenMap[orden] || 'ac.fecha DESC'}`;
    
    // Limitar resultados
    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limite), offset);
    
    console.log('📊 Query final auditoría:', query);
    console.log('🔢 Valores query:', values);
    
    const { rows } = await client.query(query, values);
    
    console.log(`✅ ${rows.length} registros de auditoría encontrados`);

    // Consulta para el total (sin paginación)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM auditoria_clientes ac
      WHERE ac.fecha >= $1::date AND ac.fecha <= $2::date + INTERVAL '1 day'
    `;
    let countValues = [fechaInicio, fechaFin];
    let countParam = 3;

    if (cliente_id && cliente_id !== 'todos' && cliente_id !== 'undefined') {
      countQuery += ` AND ac.cliente_id = $${countParam}`;
      countValues.push(parseInt(cliente_id));
      countParam++;
    }
    
    if (usuario_id && usuario_id !== 'todos' && usuario_id !== 'undefined') {
      countQuery += ` AND ac.usuario_id = $${countParam}`;
      countValues.push(parseInt(usuario_id));
      countParam++;
    }
    
    if (accion && accion !== 'todos' && accion !== 'undefined') {
      countQuery += ` AND ac.accion = $${countParam}`;
      countValues.push(accion);
      countParam++;
    }

    const countResult = await client.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: rows,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: total,
        totalPaginas: Math.ceil(total / parseInt(limite)),
        fechaInicio,
        fechaFin
      }
    });
    
  } catch (error) {
    console.error('❌ Error crítico al obtener auditoría:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al obtener auditoría: ' + error.message 
    });
  }
});

// ========================================
// AUTENTICACIÓN POR RFID (ESP32) + TOKEN WEB
// ========================================
let ultimoRFID = null;
app.post('/api/auth/rfid', async (req, res) => {
  const { uid } = req.body;
  console.log(`🔐 Solicitud RFID recibida UID=${uid}`);

  try {
    const query = 'SELECT id, username, role, rfid_uid FROM usuarios WHERE rfid_uid = $1';
    const result = await client.query(query, [uid]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Generar token JWT temporal (1 minuto de validez)
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1m' }
      );

      // Guardar este acceso temporal en memoria
      ultimoRFID = {
        token,
        user,
        timestamp: new Date().toISOString()
      };

      // Registrar evento de acceso
      await client.query(
        `INSERT INTO auditoria_accesos (usuario_id, fecha_acceso, metodo, estado)
         VALUES ($1, NOW(), 'RFID', 'permitido')`,
        [user.id]
      );

      console.log(`✅ Acceso permitido: ${user.username}`);
      res.json({
        success: true,
        message: `Acceso permitido a ${user.username}`,
        user
      });

    } else {
      // Intento fallido
      await client.query(
        `INSERT INTO auditoria_accesos (usuario_id, fecha_acceso, metodo, estado)
         VALUES (NULL, NOW(), 'RFID', 'denegado')`
      );

      console.log(`❌ Acceso denegado UID=${uid}`);
      res.json({
        success: false,
        message: 'Acceso denegado: UID no registrado.'
      });
    }

  } catch (error) {
    console.error('Error en autenticación RFID:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ========================================
// RUTA PARA CONSULTAR ÚLTIMO ACCESO RFID
// ========================================
// En crm-server-final.js - Asegurar que /api/rfid/ultimo no devuelva falso positivo
app.get('/api/rfid/ultimo', (req, res) => {
  // Si no hay registro o ya pasó más de 60 segundos, devolver éxito pero sin datos
  if (
    !ultimoRFID ||
    (Date.now() - new Date(ultimoRFID.timestamp).getTime()) > 60 * 1000
  ) {
    return res.json({ 
      success: true, // 🔥 CAMBIAR a true en lugar de false
      accessGranted: false,
      message: 'No hay tarjetas RFID recientes'
    });
  }

  res.json({
    success: true,
    accessGranted: true,
    token: ultimoRFID.token,
    user: ultimoRFID.user,
    rfidUID: ultimoRFID.uid,
    timestamp: ultimoRFID.timestamp
  });
});
// ========================================
// RUTA PARA RESETEAR ACCESO RFID
// ========================================
app.post('/api/rfid/reset', (req, res) => {
  ultimoRFID = null;
  console.log('🧹 RFID temporal limpiado por cierre de sesión');
  res.json({ success: true });
});
// Ruta de diagnóstico mejorada
app.get('/api/debug/rfid-status', (req, res) => {
  res.json({
    success: true,
    ultimoRFID: ultimoRFID,
    timestamp: new Date().toISOString(),
    message: ultimoRFID ? 
      `Último RFID: ${ultimoRFID.user.username} (${new Date(ultimoRFID.timestamp).toLocaleTimeString()})` : 
      'No hay acceso RFID activo'
  });
});
// ========================================
// ENDPOINTS DE SALUD Y MANTENIMIENTO
// ========================================

// Health check - no cuenta en rate limiting
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await client.query('SELECT 1');
    
    res.json({
      success: true,
      status: 'OK',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'ERROR',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Endpoint para ver estadísticas de rate limiting (solo desarrollo)
if (isDevelopment) {
  app.get('/api/dev/rate-limit-status', (req, res) => {
    const ip = obtenerIPReal(req);
    res.json({
      ip: ip,
      environment: process.env.NODE_ENV,
      message: 'Rate limiting activo con límites de desarrollo'
    });
  });
  
  // Endpoint para simular diferentes IPs en desarrollo
  app.get('/api/dev/test-ip', (req, res) => {
    const realIP = obtenerIPReal(req);
    res.json({
      real_ip: realIP,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'cf-connecting-ip': req.headers['cf-connecting-ip']
      }
    });
  });
}
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});