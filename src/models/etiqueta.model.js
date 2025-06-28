import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT g.id_etiqueta, g.nombre, COUNT(pg.id_pelicula) AS total_peliculas FROM etiquetas g LEFT JOIN etiquetas_pelicula pg ON g.id_etiqueta = pg.id_etiqueta GROUP BY g.id_etiqueta ORDER BY g.id_etiqueta');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM etiquetas WHERE id_etiqueta = $1', [id]);
    return result.rows[0];
};

export const insert = async ({ nombre }) => {
    const result = await db.query('INSERT INTO etiquetas (nombre) VALUES ($1) RETURNING *'
        , [nombre]);
    return result.rows[0];
};

export const update = async (id, { nombre }) => {
    const result = await db.query(
        'UPDATE etiquetas SET nombre = $1 WHERE id_etiqueta = $2 RETURNING *',
        [nombre, id]
    );

    return result.rows[0];
}

export const remove = async (id) => {
    const result = await db.query('DELETE FROM etiquetas WHERE id_etiqueta = $1 RETURNING *', [id]);

    return result.rowCount > 0 ? result.rows[0] : null;
}
export const tienePeliculasAsociadas = async (id_genero) => {
    const result = await db.query(
        'SELECT COUNT(*) FROM etiquetas_pelicula WHERE id_genero = $1',
        [id_genero]
    );
    return parseInt(result.rows[0].count) > 0;
}