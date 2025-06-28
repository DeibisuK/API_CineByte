import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM generos');
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
        'UPDATE generos SET nombre = $1 WHERE id_genero = $2',
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
export const totalFilmsByGen = async (id) => {
    const query = 'SELECT total_peliculas_por_genero($1) AS total';
    const result = await db.query(query, [id]);
    return result.rows[0].total;
}