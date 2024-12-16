require('dotenv').config(); // Carga variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors'); // Importamos cors
const path = require('path');
const { MongoClient } = require('mongodb');

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

// Conexión a MongoDB
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL no está definida en el archivo .env');
  process.exit(1); // Finaliza el proceso si no se encuentra la URL de MongoDB
}

const client = new MongoClient(process.env.MONGO_URL); // URL de MongoDB desde .env

// Middleware para conectar a MongoDB dinámicamente
app.use(async (req, res, next) => {
  try {
    // Intentamos conectar solo una vez, sin usar isConnected()
    await client.connect();
    console.log('Conexión a MongoDB establecida');
    req.db = client.db('correiodenatal'); // Reemplaza con el nombre de tu base de datos
    next();
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
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