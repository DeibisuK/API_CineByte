import express from 'express';
import { PORT } from './config.js';
import peliculasRoutes from './routes/peliculas.routes.js';
import etiquetasRoutes from './routes/etiquetas.routes.js';
import generosRoutes from './routes/generos.routes.js';
import cors from 'cors';


const app = express();
app.use(cors());
// Aumentar el tamaño permitido para JSON (por ejemplo, hasta 10 MB)
app.use(express.json({ limit: '10mb' }));

// Si estás usando form-urlencoded (formularios clásicos)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api',peliculasRoutes);
app.use('/api',generosRoutes);
app.use('/api',etiquetasRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});