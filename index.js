require('dotenv').config(); // Carga variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors'); // Importamos cors
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto definido en .env o 3000 como predeterminado

// Configuración básica de CORS para permitir todas las solicitudes
app.use(cors()); // Permitir solicitudes de cualquier origen

// Opcional: Configuración personalizada de CORS
const corsOptions = {
  origin: ['https://correio-de-natal.vercel.app'], // Lista blanca de dominios permitidos
  methods: 'GET,POST,PUT,DELETE', // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  credentials: true, // Permitir cookies/credenciales en solicitudes
  optionsSuccessStatus: 200, // Código de estado para solicitudes preflight
};

// Middleware para solicitudes preflight (opcional)
app.options('*', cors(corsOptions)); // Habilitar preflight para todas las rutas

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Asegúrate de que la variable MONGO_URL esté cargada correctamente
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL no está definida en el archivo .env');
  process.exit(1); // Finaliza el proceso si no se encuentra la URL de MongoDB
}

const client = new MongoClient(process.env.MONGO_URL); // URL de MongoDB desde .env

// Middleware para parsear JSON
app.use(express.json());

// Importar rutas desde la carpeta api
const messagesRoute = require('./api/messages');
const saveMessageRoute = require('./api/save-message');

// Usar las rutas con CORS configurado
app.use('/api/messages', cors(corsOptions), messagesRoute);
app.use('/api/save-message', cors(corsOptions), saveMessageRoute);

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
    app.locals.db = db; // Agrega la base de datos a las variables locales de la app

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error al conectar a MongoDB', err);
    process.exit(1); // Finaliza el proceso si falla la conexión
  }
}

startServer();
