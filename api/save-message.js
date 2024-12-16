const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();

app.use(express.json()); // Para que Express pueda manejar solicitudes JSON

// Conexión a MongoDB
const client = new MongoClient(process.env.MONGO_URL); // Cambia la URL si es necesario
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
    process.exit(1); // Termina el proceso si no se puede conectar
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

    // Desestructuración de los datos del cuerpo de la solicitud
    const { senderHotel, senderName, recipientHotel, recipientName, customMessage } = req.body;
    
    // Validación de datos
    if (!senderHotel || !senderName || !recipientHotel || !recipientName || !customMessage) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (typeof senderHotel !== 'string' || typeof recipientHotel !== 'string' || typeof senderName !== 'string' || typeof recipientName !== 'string' || typeof customMessage !== 'string') {
      return res.status(400).json({ error: 'Los datos deben ser cadenas de texto válidas' });
    }

    // Verificar si la base de datos está disponible
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }

    // Inserción de mensaje en la base de datos
    const messages = db.collection('messages');

    const newMessage = {
      senderHotel,
      senderName,
      recipientHotel,
      recipientName,
      customMessage,
      created_at: new Date(),
    };

    // Intentar insertar el mensaje en la base de datos
    const result = await messages.insertOne(newMessage); // Inserta el mensaje

    console.log('Mensaje insertado con éxito:', result); // Imprime el resultado de la inserción
    res.json({ message: 'Mensaje guardado exitosamente', id: result.insertedId }); // Responde con éxito

  } catch (error) {
    console.error('Error al guardar el mensaje:', error); // Imprime el error en la consola
    res.status(500).json({ error: 'Error al guardar el mensaje', details: error.message }); // Responde con error
  }
};

// Exportar la función con CORS
module.exports = allowCors(handler);

// Iniciar el servidor de Express
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});