const { MongoClient } = require('mongodb');

const allowCors = (fn) => async (req, res) => {
  const allowedOrigins = ['https://correio-de-natal.vercel.app', 'http://localhost:3000']; // Dominios permitidos
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
    res.status(200).end(); // Responde directamente a las solicitudes preflight
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  const uri = process.env.MONGODB_URI; // Configura correctamente tu URI
  const client = new MongoClient(uri);

  if (req.method === 'GET') {
    try {
      await client.connect();
      const db = client.db('correiodenatal'); // Reemplaza con el nombre de tu base de datos
      const collection = db.collection('suporte');
      const rows = await collection.find().toArray();
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener los mensajes', details: err.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};

module.exports = allowCors(handler);

