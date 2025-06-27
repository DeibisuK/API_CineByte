import nodemailer from 'nodemailer';

export async function enviarContacto(req, res) {
  const { nombres, apellidos, telefono, email, cine, tipo, comentario } = req.body;

  // Configura el transporter (puedes usar Gmail, Outlook, etc.)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'garystevenbarreirozambrano@gmail.com', // Correo que envia los mensajes
      pass: 'hzoi ycly zvix btve' // App password
    }
  });

  const mailOptions = {
    from: email,
    to: 'garystevenbarreirozambrano@gmail.com',
    subject: `Nuevo mensaje de contacto (${tipo})`,
    html: `
      <h3>Nuevo mensaje de contacto</h3>
      <p><b>Nombres:</b> ${nombres}</p>
      <p><b>Apellidos:</b> ${apellidos}</p>
      <p><b>Teléfono:</b> ${telefono}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Cine:</b> ${cine}</p>
      <p><b>Tipo:</b> ${tipo}</p>
      <p><b>Comentario:</b> ${comentario}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el correo', error });
  }
};