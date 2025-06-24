import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM peliculas');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM peliculas WHERE id_pelicula = $1', [id]);
    return result.rows[0];
};

export const insert = async({titulo,descripcion,duracion_minutos,fecha_estreno, estado,clasificacion,imagen}) => {
    const result = await db.query('INSERT INTO peliculas (titulo,descripcion,duracion_minutos,fecha_estreno, estado,clasificacion,imagen) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
        , [titulo, descripcion, duracion_minutos, fecha_estreno, estado, clasificacion, imagen]);
    return result.rows[0];
};

export const update = async(id,{titulo,descripcion,duracion_minutos,fecha_estreno, estado,clasificacion,imagen}) => {
    const result = await db.query(
        'UPDATE peliculas SET titulo = $1, descripcion = $2, duracion_minutos = $3, fecha_estreno = $4, estado = $5, clasificacion = $6, imagen = $7 WHERE id = $8',
        [titulo, descripcion, duracion_minutos, fecha_estreno, estado, clasificacion, imagen, id]
    );
}

export const remove = async(id) => {
    await db.query('DELETE FROM peliculas WHERE id = $1', [id]);
}