import express from 'express';
import cors from 'cors';
import peliculasRoutes from './routes/peliculas.routes.js';
import etiquetasRoutes from './routes/etiquetas.routes.js'
import generosRoutes from './routes/generos.routes.js' 
import actoresRoutes from './routes/actores.routes.js' 
import distribuidorRoutes from './routes/distribuidor.routes.js' 
import idiomasRoutes from './routes/idiomas.routes.js' 
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/api/peliculas',peliculasRoutes);
app.use('/api/etiquetas',etiquetasRoutes);
app.use('/api/generos',generosRoutes);   
app.use('/api/actores',actoresRoutes);   
app.use('/api/distribuidor',distribuidorRoutes);   
app.use('/api/idiomas',idiomasRoutes);   

export default app;
