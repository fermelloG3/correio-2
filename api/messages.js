const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;  // URL de Supabase desde .env
const supabaseKey = process.env.SUPABASE_KEY;  // Clave de Supabase desde .env

// Verificar si las variables de entorno están definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL o SUPABASE_KEY no están definidas en el archivo .env');
  process.exit(1); // Finaliza el proceso si no se encuentran las variables de entorno
}

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Permitir CORS
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

// Manejador de la solicitud
const handler = async (req, res) => {
  if (req.method === 'GET') {
    try {
      // Hacer la consulta a la tabla 'suporte' de Supabase
      const { data, error } = await supabase
        .from('suporte')  // Nombre de la tabla en Supabase
        .select('*')      // Seleccionar todos los registros
        .limit(100);      // Limitar los resultados a 100 registros

      if (error) {
        console.error('Error al obtener los mensajes:', error.message);
        return res.status(500).json({ error: 'Error al obtener los mensajes', details: error.message });
      }

      res.status(200).json(data);  // Devolver los datos obtenidos de Supabase
    } catch (err) {
      console.error('Error al obtener los mensajes:', err.message);
      res.status(500).json({ error: 'Error al obtener los mensajes', details: err.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};

module.exports = allowCors(handler);
