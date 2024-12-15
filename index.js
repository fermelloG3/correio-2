require('dotenv').config(); // Carga variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto definido en .env o 3000 como predeterminado

// Configuración personalizada de CORS
const corsOptions = {
  origin: ['https://correio-2-fermellog3s-projects.vercel.app'], // Lista blanca de dominios permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware para habilitar CORS
app.use(cors(corsOptions));

// Manejar solicitudes preflight
app.options('*', cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Verificar la variable de entorno MONGO_URL
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL no está definida en el archivo .env');
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URL); // URL de MongoDB desde .env

// Importar rutas
const messagesRoute = require('./api/messages');
const saveMessageRoute = require('./api/save-message');

// Usar las rutas
app.use('/api/messages', messagesRoute);
app.use('/api/save-message', saveMessageRoute);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Iniciar el servidor y conectar a MongoDB
async function startServer() {
  try {
    await client.connect(); // Conexión a MongoDB
    console.log('Conectado a MongoDB');
    
    // Compartir la base de datos con las rutas
    const db = client.db('nombre_de_tu_base'); // Reemplaza con el nombre de tu base de datos
    app.locals.db = db;

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error al conectar a MongoDB', err);
    process.exit(1);
  }
}

startServer();
