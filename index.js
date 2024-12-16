require('dotenv').config(); // Carga variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors'); // Importamos cors
const path = require('path');
const { createClient } = require('@supabase/supabase-js'); // Importamos Supabase

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto definido en .env o 3000 como predeterminado

// Configuración de CORS para orígenes específicos
const corsOptions = {
  origin: [
    'https://www.natalhoteispires.com.br',
    'https://vercel.com/fermellog3s-projects/correio-2/9AN498f1SeoYyEqqRVceFrHkkwq9'
  ], // Lista de dominios permitidos
  methods: 'GET,POST,PUT,DELETE,OPTIONS', // Métodos permitidos
  allowedHeaders: 'Content-Type,Authorization', // Encabezados permitidos
  credentials: true, // Permitir cookies si es necesario
};

// Habilitar CORS para todas las rutas con configuración personalizada
app.use(cors(corsOptions));

// Manejo de solicitudes pre-flight (OPTIONS) globalmente
app.options('*', cors(corsOptions)); // Permite solicitudes OPTIONS pre-flight para todas las rutas

// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;  // Supabase URL desde .env
const supabaseKey = process.env.SUPABASE_KEY;  // Supabase clave pública desde .env

// Verificar si las variables de entorno están definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL o SUPABASE_KEY no están definidas en el archivo .env');
  process.exit(1); // Finaliza el proceso si no se encuentran las variables de entorno
}

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware para conectar a Supabase
app.use((req, res, next) => {
  req.supabase = supabase; // Hacemos disponible el cliente de Supabase en cada solicitud
  next();
});

// Importar rutas desde la carpeta api
const messagesRoute = require('./api/messages');
const saveMessageRoute = require('./api/save-message');

// Usar las rutas con CORS configurado
app.use('/api/messages', messagesRoute);
app.use('/api/save-message', saveMessageRoute);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Exportar la app para que Vercel la use
module.exports = app;
