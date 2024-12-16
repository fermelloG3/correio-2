const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();

app.use(express.json()); // Para que Express pueda manejar solicitudes JSON

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
const allowCors = (fn) => async (req, res) => {
  const allowedOrigins = ['https://correio-2.vercel.app', 'http://localhost:3000'];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

// Handler para guardar el mensaje
const handler = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const { senderHotel, senderName, recipientHotel, recipientName, customMessage } = req.body;



    // Verificar si la base de datos está disponible
    const db = req.app.locals.db;
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
};

// Exportar la función con CORS
module.exports = allowCors(handler);

// Iniciar el servidor de Express
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
