import nodemailer from 'nodemailer';

export const enviarCorreo = async ({ nombres, apellidos, telefono, email, cine, tipo, comentario }) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'garystevenbarreirozambrano@gmail.com',
      pass: 'hzoi ycly zvix btve'
    }
  });

const mailOptions = {
  from: email,
  to: 'garystevenbarreirozambrano@gmail.com',
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