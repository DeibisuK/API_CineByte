import { pool } from '../db.js';

export const getPeliculas = async (req, res) => {
    const result = await pool.query('SELECT * FROM peliculas');
    const peliculasConImagen = result.rows.map(pelicula => {
        let imagenBase64 = null;

        if (pelicula.imagen) {
            // Asumimos que 'imagen' es un Buffer (PostgreSQL BYTEA)
            imagenBase64 = pelicula.imagen.toString('base64');
        }

        return {
            id_pelicula: pelicula.id_pelicula,
            titulo: pelicula.titulo,
            descripcion: pelicula.descripcion,
            duracion_minutos: pelicula.duracion_minutos,
            fecha_estreno: pelicula.fecha_estreno,
            estado: pelicula.estado,
            clasificacion: pelicula.clasificacion,
            imagen: imagenBase64, // <-- incluimos base64 en el JSON
        };
    });
    res.json(peliculasConImagen);
};

export const getPeliculaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM peliculas WHERE id_pelicula = $1', [id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: "Pelicula not found" });
    }
    res.json(rows);
};

export const createPelicula = async (req, res) => {
    const data = req.body;

    await pool.query('INSERT INTO peliculas (titulo,descripcion,duracion_minutos,fecha_estreno, estado,clasificacion,imagen) VALUES ($1, $2, $3, $4, $5, $6, $7);'
        , [data.titulo, data.descripcion, data.duracion_minutos, data.fecha_estreno, data.estado, data.clasificacion, data.imagen]
    );
    res.json({ message: "Pelicula created successfully!" });
};

export const deletePelicula = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM peliculas WHERE id = $1', [id]);

    if (rowCount === 0) {
        return res.status(404).json({ message: "Pelicula not found" });
    }
    return res.json({ message: "Pelicula deleted successfully!" });
};

export const updatePelicula = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const { rowCount } = await pool.query('UPDATE peliculas SET titulo = $1, descripcion = $2, duracion_minutos = $3, fecha_estreno = $4, estado = $5, clasificacion = $6, imagen = $7 WHERE id = $8',
        [data.titulo, data.descripcion, data.duracion_minutos, data.fecha_estreno, data.estado, data.clasificacion, data.imagen, id]
    )

    if (rowCount === 0) {
        return res.status(404).json({ message: "Pelicula not found" });
    }

    res.send(`Pelicula with ID ${id} updated successfully!`);
};