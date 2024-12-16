const { MongoClient } = require('mongodb');

// Definir la URL de MongoDB y la base de datos
const mongoUrl = 'mongodb://localhost:27017'; // Cambia esto si es necesario
const dbName = 'correiodenatal';  // Cambia el nombre de tu base de datos

let cachedDb = null;

// Función para obtener la conexión a la base de datos
const connectToDatabase = async () => {
  if (cachedDb) {
    console.log("Usando la conexión de caché");
    return cachedDb; // Si ya existe una conexión, la reutilizamos
  }

  const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    cachedDb = client.db(dbName);
    console.log("Conexión exitosa a MongoDB");
    return cachedDb;
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw new Error('No se pudo conectar a la base de datos');
  }
};

// Función que maneja la solicitud POST
const handler = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const { senderHotel, senderName, recipientHotel, recipientName, customMessage } = req.body;

    // Validación de datos
    if (!senderHotel || !senderName || !recipientHotel || !recipientName || !customMessage) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (typeof senderHotel !== 'string' || typeof recipientHotel !== 'string' || typeof senderName !== 'string' || typeof recipientName !== 'string' || typeof customMessage !== 'string') {
      return res.status(400).json({ error: 'Los datos deben ser cadenas de texto válidas' });
    }

    // Conectar a la base de datos
    const db = await connectToDatabase();
    const messages = db.collection('suporte'); // Acceder a la colección

    // Crear el mensaje
    const newMessage = {
      senderHotel,
      senderName,
      recipientHotel,
      recipientName,
      customMessage,
      created_at: new Date(),
    };

    // Insertar el mensaje en la base de datos
    const result = await messages.insertOne(newMessage);

    res.json({ message: 'Mensaje guardado exitosamente', id: result.insertedId });
  } catch (err) {
    console.error('Error al guardar el mensaje:', err);
    res.status(500).json({ error: 'Error al guardar el mensaje', details: err.message });
  }
};

module.exports = handler;
