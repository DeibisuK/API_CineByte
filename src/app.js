import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import peliculasRoutes from './routes/peliculas.routes.js';
import etiquetasRoutes from './routes/etiquetas.routes.js';
import generosRoutes from './routes/generos.routes.js';
import actoresRoutes from './routes/actores.routes.js';
import distribuidorRoutes from './routes/distribuidor.routes.js';
import idiomasRoutes from './routes/idiomas.routes.js';
import contactoRoutes from './routes/contacto.routes.js';
import sedeRoute from './routes/sede.routes.js';
import ciudadRoutes from './routes/ciudades.routes.js'; 
import paisesRoutes from './routes/paises.routes.js';
import promocionesRoutes from './routes/promocion.routes.js';
import anuncioRoutes from './routes/anuncio.routes.js';
import sedeSalasRoutes from './routes/sede_salas.routes.js';
import salasRoutes from './routes/sala.routes.js';
import usersRoutes from './routes/users.routes.js';
import metodoPagoRoutes from './routes/metodo_pago.routes.js';
import funcionesRoutes from './routes/funciones.routes.js';
import exportRoutes from './routes/export.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import tokenValidationRoutes from './routes/token-validation.routes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/peliculas', peliculasRoutes);
app.use('/api/etiquetas', etiquetasRoutes);
app.use('/api/generos', generosRoutes);
app.use('/api/actores', actoresRoutes);
app.use('/api/distribuidor', distribuidorRoutes);
app.use('/api/idiomas', idiomasRoutes);
app.use('/api/sedes', sedeRoute);
app.use('/api/contacto', contactoRoutes);
app.use('/api/ciudades', ciudadRoutes);
app.use('/api/paises', paisesRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/anuncios', anuncioRoutes);
app.use('/api/sede-salas', sedeSalasRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/metodos-pago', metodoPagoRoutes);
app.use('/api/funciones', funcionesRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', tokenValidationRoutes);


export default app;