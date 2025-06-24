import express from 'express';
import cors from 'cors';
dotenv.config();
import peliculasRoutes from './routes/peliculas.routes.js';
import etiquetasRoutes from './routes/etiquetas.routes.js'
import dotenv from 'dotenv';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/peliculas',peliculasRoutes);
app.use('/api/etiquetas',etiquetasRoutes);

export default app;
