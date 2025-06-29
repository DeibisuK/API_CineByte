import db from '../config/db.js';

export const findAll = async () => {
     const result = await db.query('SELECT g.id_idioma, g.nombre, COUNT(pg.id_pelicula) AS total_peliculas FROM idiomas g LEFT JOIN pelicula_idiomas pg ON g.id_idioma = pg.id_idioma GROUP BY g.id_idioma ORDER BY g.id_idioma');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM idiomas WHERE id_idioma = $1', [id]);
    return result.rows[0];
};

export const insert = async ({ nombre }) => {
    const result = await db.query('INSERT INTO idiomas (nombre) VALUES ($1) RETURNING *'
        , [nombre]);
    return result.rows[0];
};

export const update = async (id, { nombre }) => {
    const result = await db.query(
        'UPDATE idiomas SET nombre = $1 WHERE id_idioma = $2 RETURNING *',
        [nombre, id]
    );
    return result.rows[0];
}

export const remove = async (id) => {
    const result = await db.query('DELETE FROM idiomas WHERE id_idioma = $1 RETURNING *', [id]);

    return result.rowCount > 0 ? result.rows[0] : null;
}

export const tienePeliculasAsociadas = async (id_idioma) => {
    const result = await db.query(
        'SELECT COUNT(*) FROM pelicula_idiomas WHERE id_idioma = $1',
        [id_idioma]
    );
    return parseInt(result.rows[0].count) > 0;
}