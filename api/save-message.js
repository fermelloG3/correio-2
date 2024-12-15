const allowCors = (fn) => async (req, res) => {
  // Define los orígenes permitidos
  const allowedOrigins = ['https://correio-de-natal.vercel.app', 'http://localhost:3000'];

  // Asignar el encabezado Access-Control-Allow-Origin a los orígenes permitidos
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins.join(', '));  // Permite múltiples orígenes
  
  // Otros encabezados CORS que puedes necesitar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Si la solicitud es de tipo OPTIONS (preflight), responder con status 200
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Continuar con la función principal si no es OPTIONS
  return await fn(req, res);
};

const handler = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { senderHotel, senderName, recipientHotel, recipientName, customMessage } = req.body;

    if (!senderHotel || !senderName || !recipientHotel || !recipientName || !customMessage) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const newMessage = {
      senderHotel,
      senderName,
      recipientHotel,
      recipientName,
      customMessage,
      created_at: new Date(),
    };

    const db = req.app.locals.db; // Obtener la base de datos desde app.locals
    const messages = db.collection('suporte');

    const result = await messages.insertOne(newMessage); // Insertar el mensaje en la base de datos

    res.json({ message: 'Mensaje guardado exitosamente', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar el mensaje', details: err.message });
  }
};

// Exporta el handler con CORS habilitado
module.exports = allowCors(handler);
