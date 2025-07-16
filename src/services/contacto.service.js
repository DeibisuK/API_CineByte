import nodemailer from 'nodemailer';

export const enviarCorreo = async ({ nombres, apellidos, telefono, email, cine, tipo, comentario }) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'noreplycinebyte@gmail.com',
      pass: 'ykga uoxf eiyu caic'
    }
  });

  const mailOptions = {
    from: email,
    to: 'noreplycinebyte@gmail.com',
    subject: `Nuevo mensaje de contacto (${tipo})`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; border: 1px solid #444; border-radius: 12px; padding: 28px; background:rgb(35, 35, 35);">
      <div style="text-align:center; margin-bottom: 18px;">
        <h1 style="color: #f7cb5a; margin: 0;">CineByte</h1>
        <h2 style="color: #fff; border-bottom: 1px solid #f7cb5a; padding-bottom: 8px; margin: 0; font-weight: 600;">
          Nuevo mensaje de contacto
        </h2>
      </div>
      <p style="color: #e0e0e0; font-size: 15px; margin-bottom: 18px;">
        Has recibido un nuevo mensaje desde el formulario de contacto de la web. Por favor, responde a la brevedad posible.
      </p>
      <table style="width: 100%; border-collapse: collapse; background:rgb(46, 46, 46); border-radius: 8px;">
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #f7cb5a;">Nombres:</td>
          <td style="padding: 10px; color: #fff;">${nombres}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #f7cb5a;">Apellidos:</td>
          <td style="padding: 10px; color: #fff;">${apellidos}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #f7cb5a;">Teléfono:</td>
          <td style="padding: 10px; color: #fff;">${telefono}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #f7cb5a;">Email:</td>
          <td style="padding: 10px; color: #fff;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #f7cb5a;">Cine:</td>
          <td style="padding: 10px; color: #fff;">${cine}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #f7cb5a;">Tipo:</td>
          <td style="padding: 10px; color: #fff;">${tipo}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #f7cb5a;">Comentario:</td>
          <td style="padding: 10px; color: #fff;">${comentario}</td>
        </tr>
      </table>
      <p style="color: #aaa; font-size: 12px; margin-top: 24px; text-align:center;">
        Este mensaje fue enviado automáticamente desde el formulario de contacto de <span style="color:#f7cb5a;">CineByte</span>.
      </p>
    </div>
  `
  };

  return await transporter.sendMail(mailOptions);
};

export const enviarCorreoConfirmacionCompra = async ({ 
  emailCliente, 
  nombreCliente, 
  pelicula, 
  sala, 
  fechaFuncion, 
  horarioInicio, 
  horarioFin, 
  asientos, 
  total, 
  numeroFactura 
}) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'noreplycinebyte@gmail.com',
      pass: 'ykga uoxf eiyu caic'
    }
  });

  const asientosTexto = asientos.map(a => a.numero_asiento).join(', ');
  const fechaFormateada = new Date(fechaFuncion).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: 'noreplycinebyte@gmail.com',
    to: emailCliente,
    subject: '¡Confirmación de compra - CineByte!',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; border: 1px solid #444; border-radius: 12px; padding: 28px; background:rgb(35, 35, 35);">
      <div style="text-align:center; margin-bottom: 18px;">
        <h1 style="color: #f7cb5a; margin: 0;">CineByte</h1>
        <h2 style="color: #fff; border-bottom: 1px solid #f7cb5a; padding-bottom: 8px; margin: 0; font-weight: 600;">
          ¡Compra Confirmada!
        </h2>
      </div>
      
      <p style="color: #e0e0e0; font-size: 15px; margin-bottom: 18px;">
        Hola <strong style="color: #f7cb5a;">${nombreCliente}</strong>, 
      </p>
      
      <p style="color: #e0e0e0; font-size: 15px; margin-bottom: 18px;">
        ¡Gracias por tu compra! Hemos confirmado tu reserva para la función de cine. 
        A continuación, encontrarás todos los detalles de tu compra:
      </p>

      <div style="background:rgb(46, 46, 46); border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #f7cb5a; margin-top: 0;">Detalles de la Función</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #f7cb5a;">Película:</td>
            <td style="padding: 8px; color: #fff;">${pelicula}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #f7cb5a;">Sala:</td>
            <td style="padding: 8px; color: #fff;">${sala}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #f7cb5a;">Fecha:</td>
            <td style="padding: 8px; color: #fff;">${fechaFormateada}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #f7cb5a;">Horario:</td>
            <td style="padding: 8px; color: #fff;">${horarioInicio} - ${horarioFin}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #f7cb5a;">Asientos:</td>
            <td style="padding: 8px; color: #fff;">${asientosTexto}</td>
          </tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, #f7cb5a, #ffd700); border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #121212; margin-top: 0;">Información de Pago</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #121212;">N° Factura:</td>
            <td style="padding: 8px; color: #121212;">${numeroFactura}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #121212;">Total Pagado:</td>
            <td style="padding: 8px; color: #121212; font-weight: bold; font-size: 18px;">$${total.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="background:rgba(56, 75, 116, 1); border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #fff; margin-top: 0;">📋 Instrucciones Importantes</h4>
        <ul style="color: #fff; margin: 0; padding-left: 20px;">
          <li>Llega al cine 15 minutos antes del inicio de la función</li>
          <li>Presenta tu factura en taquilla para retirar tus boletos</li>
          <li>Conserva este correo como comprobante de compra</li>
          <li>Los asientos están reservados a tu nombre</li>
        </ul>
      </div>

      <p style="color: #e0e0e0; font-size: 14px; text-align: center; margin-top: 24px;">
        ¡Disfruta tu película! 🍿🎬
      </p>
      
      <p style="color: #aaa; font-size: 12px; margin-top: 24px; text-align:center;">
        Este correo fue enviado automáticamente por el sistema de <span style="color:#f7cb5a;">CineByte</span>.
        <br>Si tienes alguna pregunta, contáctanos a noreplycinebyte@gmail.com
      </p>
    </div>
  `
  };

  return await transporter.sendMail(mailOptions);
};