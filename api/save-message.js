const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();

// Middleware para manejar solicitudes JSON
app.use(express.json());

// Conexión a MongoDB
const client = new MongoClient('mongodb://localhost:27017'); // Cambia la URL si es necesario
let db;

// Conectar a MongoDB
client.connect()
  .then(() => {
    db = client.db('correiodenatal'); // Cambia por el nombre correcto de tu base de datos
    app.locals.db = db; // Asignamos la base de datos a app.locals
    console.log('Conexión exitosa a la base de datos');
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
  });

// Función para permitir CORS
const allowCors = (req, res, next) => {
  const allowedOrigins = ['https://correio-2.vercel.app', 'http://localhost:3000'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
};

// Aplicar middleware de CORS
app.use(allowCors);

// Ruta para guardar el mensaje
app.post('/api/save-message', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const { senderHotel, senderName, recipientHotel, recipientName, customMessage } = req.body;

    // Validación de datos
    if (!senderHotel || !senderName || !recipientHotel || !recipientName || !customMessage) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (
      typeof senderHotel !== 'string' ||
      typeof recipientHotel !== 'string' ||
      typeof senderName !== 'string' ||
      typeof recipientName !== 'string' ||
      typeof customMessage !== 'string'
    ) {
      return res.status(400).json({ error: 'Los datos deben ser cadenas de texto válidas' });
    }

    // Verificar si la base de datos está disponible
    if (!db) {
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }

    // Inserción de mensaje en la base de datos
    const messages = db.collection('suporte');

    const newMessage = {
      senderHotel,
      senderName,
      recipientHotel,
      recipientName,
      customMessage,
      created_at: new Date(),
    };

    const result = await messages.insertOne(newMessage);

    res.json({ message: 'Mensaje guardado exitosamente', id: result.insertedId });
  } catch (err) {
    console.error('Error al guardar el mensaje:', err);
    res.status(500).json({ error: 'Error al guardar el mensaje', details: err.message });
  }
});

// Iniciar el servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
