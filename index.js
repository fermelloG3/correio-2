require('dotenv').config(); // Carga variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
const corsOptions = {
  origin: [
    'https://www.natalhoteispires.com.br', 
    'https://vercel.com/fermellog3s-projects/correio-2/9AN498f1SeoYyEqqRVceFrHkkwq9'
  ], 
  methods: 'GET,POST,PUT,DELETE,OPTIONS', 
  allowedHeaders: 'Content-Type,Authorization', 
  credentials: true,
};

app.use(cors(corsOptions)); // Habilitar CORS
app.options('*', cors(corsOptions)); // Manejo de solicitudes pre-flight (OPTIONS)
app.use(express.json()); // Middleware para parsear JSON
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Conexión a MongoDB (solo una vez)
const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    app.locals.db = client.db('correiodenatal'); // Asignar la base de datos a app.locals para acceso en rutas
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Terminar el proceso si la conexión falla
  });

// Rutas de la API
const messagesRoute = require('./api/messages');
const saveMessageRoute = require('./api/save-message');
app.use('/api/messages', messagesRoute);
app.use('/api/save-message', saveMessageRoute);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Ocurrió un error en el servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Exportar la app para que Vercel la use
module.exports = app;
