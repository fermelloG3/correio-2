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

// Función principal (handler) que maneja las solicitudes
const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      // Conexión a la base de datos
      const { db } = await connectToDatabase();
      const collection = db.collection('suporte');

      // Consulta: ordenar por fecha descendente y limitar el número de resultados
      const rows = await collection
        .find()
        .sort({ fecha: -1 }) // Ordenar por "fecha" descendente
        .limit(500) // Limitar a 500 registros
        .toArray();

      // Respuesta al cliente con los registros obtenidos
      res.status(200).json(rows);
    } catch (err) {
      // Manejo de errores en la base de datos o consulta
      console.error('Erro ao obter as mensagens:', err.message);
      res.status(500).json({ error: 'Erro ao obter as mensagens', details: err.message });
    }
  } else {
    // Respuesta para métodos no permitidos
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Método não permitido' });
  }
};

// Habilitar CORS (asegúrate de tener la función allowCors definida previamente)
module.exports = allowCors(handler);

