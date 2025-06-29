import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT g.id_genero, g.nombre, COUNT(pg.id_pelicula) AS total_peliculas FROM generos g LEFT JOIN pelicula_generos pg ON g.id_genero = pg.id_genero GROUP BY g.id_genero ORDER BY g.id_genero');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM generos WHERE id_genero = $1', [id]);
    return result.rows[0];
};

export const insert = async ({ nombre }) => {
    const result = await db.query('INSERT INTO generos (nombre) VALUES ($1) RETURNING *'
        , [nombre]);
    return result.rows[0];
};

export const update = async (id, { nombre }) => {
    const result = await db.query(
        'UPDATE generos SET nombre = $1 WHERE id_genero = $2 RETURNING *',
        [nombre, id]
    );
    return result.rows[0];
}

export const remove = async (id) => {
    const result = await db.query(
        'DELETE FROM generos WHERE id_genero = $1 RETURNING *;',
        [id]
    );
    return result.rowCount > 0 ? result.rows[0] : null;
}
export const tienePeliculasAsociadas = async (id_genero) => {
    const result = await db.query(
        'SELECT COUNT(*) FROM pelicula_generos WHERE id_genero = $1',
        [id_genero]
    );
    return parseInt(result.rows[0].count) > 0;
}