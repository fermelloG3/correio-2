const { MongoClient } = require('mongodb');

const allowCors = (fn) => async (req, res) => {
  const allowedOrigins = ['https://correio-2.vercel.app', 'http://localhost:3000'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

// Instancia persistente de la conexión
let cachedClient = null;
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) return { client: cachedClient, db: cachedDb };

  const uri = process.env.MONGO_URL || 'mongodb://localhost:27017'; // URI para producción o desarrollo local
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db('correiodenatal'); // Cambia por el nombre de tu base de datos
  cachedClient = client;
  cachedDb = db;

  return { client, db };
};

const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('suporte');

      // Obtener los primeros 100 registros
      const rows = await collection.find().limit(100).toArray();
      res.status(200).json(rows);
    } catch (err) {
      console.error('Error al obtener los mensajes:', err.message);
      res.status(500).json({ error: 'Error al obtener los mensajes', details: err.message });
    }
  } else {
    res.setHeader('Allow', 'GET'); // Especificar los métodos permitidos
    res.status(405).json({ error: 'Método no permitido' });
  }
};

module.exports = allowCors(handler);
