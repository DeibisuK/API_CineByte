import * as service from '../services/contacto.service.js';

export const enviarContacto = async (req, res) => {
  try {
    await service.enviarCorreo(req.body);
    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
  }
};