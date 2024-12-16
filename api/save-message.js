const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const app = express();

app.use(express.json()); // Para que Express pueda manejar solicitudes JSON

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

    // Validación de datos
    if (!senderHotel || !senderName || !recipientHotel || !recipientName || !customMessage) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (typeof senderHotel !== 'string' || typeof recipientHotel !== 'string' || typeof senderName !== 'string' || typeof recipientName !== 'string' || typeof customMessage !== 'string') {
      return res.status(400).json({ error: 'Los datos deben ser cadenas de texto válidas' });
    }

    // Insertar mensaje en la tabla 'suporte' de Supabase
    const { data, error } = await supabase
      .from('suporte')  // Nombre de la tabla en Supabase
      .insert([
        {
          senderHotel,
          senderName,
          recipientHotel,
          recipientName,
          customMessage,
          created_at: new Date(),
        }
      ]);

    if (error) {
      console.error('Error al guardar el mensaje:', error.message);
      return res.status(500).json({ error: 'Error al guardar el mensaje', details: error.message });
    }

    res.json({ message: 'Mensaje guardado exitosamente', id: data[0].id });
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
