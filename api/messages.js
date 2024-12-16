const { MongoClient } = require('mongodb');

const allowCors = (fn) => async (req, res) => {
  const allowedOrigins = ['https://correio-2-fermellog3s-projects.vercel.app', 'http://localhost:3000'];
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

const handler = async (req, res) => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; // URI predeterminada para desarrollo local
  const client = new MongoClient(uri);

  if (req.method === 'GET') {
    try {
      await client.connect();
      const db = client.db('correiodenatal');
      const collection = db.collection('suporte');
      
      const rows = await collection.find().limit(100).toArray(); // Limitar los resultados para no sobrecargar la respuesta
      res.status(200).json(rows);
    } catch (err) {
      console.error('Error al obtener los mensajes:', err.message);
      res.status(500).json({ error: 'Error al obtener los mensajes', details: err.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};

module.exports = allowCors(handler);
