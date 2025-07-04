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
import userRoutes from './routes/users.routes.js';
import salaRoutes from './routes/sala.routes.js';

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
app.use('/api/users', userRoutes);
app.use('/api/salas', salaRoutes);

export default app;