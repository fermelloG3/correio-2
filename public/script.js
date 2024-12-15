// Obtener referencias a los elementos
const messageForm = document.getElementById('messageForm');
const messagesContainer = document.getElementById('messagesContainer');

// Función para manejar el envío de un mensaje
messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Obtener los datos del formulario
  const formData = new FormData(messageForm);
  const messageData = {
    senderHotel: formData.get('senderHotel'),
    senderName: formData.get('senderName'),
    recipientHotel: formData.get('recipientHotel'),
    recipientName: formData.get('recipientName'),
    customMessage: formData.get('customMessage')
  };

  try {
    // Enviar el mensaje al backend
    const response = await fetch('/save-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    if (response.ok) {
      alert('Mensaje enviado con éxito');
      messageForm.reset();
      loadMessages(); // Recargar los mensajes después de enviar uno nuevo
    } else {
      alert('Error al enviar el mensaje: ' + result.error);
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('Hubo un error al enviar el mensaje.');
  }
});

// Función para cargar los mensajes desde el backend
async function loadMessages() {
  try {
    const response = await fetch('/get-messages');
    const result = await response.json();

    if (response.ok) {
      // Limpiar el contenedor de mensajes antes de agregar los nuevos
      messagesContainer.innerHTML = '';

      result.messages.forEach((message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        messageElement.innerHTML = `
          <strong>De: ${message.sender_name} (${message.sender_hotel})</strong>
          <strong>Para: ${message.recipient_name} (${message.recipient_hotel})</strong>
          <p>${message.custom_message}</p>
          <small>Enviado el: ${new Date(message.created_at).toLocaleString()}</small>
        `;

        messagesContainer.appendChild(messageElement);
      });
    } else {
      console.error('Error al cargar los mensajes:', result.error);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}

// Cargar los mensajes al inicio
loadMessages();
