import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM paises');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM paises WHERE id_pais = $1', [id]);
    return result.rows[0];
};

export const insert = async ({ nombre, estado }) => {
    const result = await db.query('INSERT INTO paises (nombre, estado) VALUES ($1,$2) RETURNING *'
        , [nombre, estado]);
    return result.rows[0];
};

export const update = async (id, { nombre, estado }) => {
    const result = await db.query(
        'UPDATE paises SET nombre = $1,estado=$2 WHERE id_pais = $3 RETURNING *',
        [nombre, estado, id]
    );
    return result.rows[0];

}

export const remove = async (id) => {
    await db.query('DELETE FROM paises WHERE id_pais = $1 RETURNING *', [id]);
    return result.rowCount > 0 ? result.rows[0] : null;
}

export const estaAsociado = async (idPais) => {
    const result = await db.query(
        `
        SELECT 
            (SELECT COUNT(*) FROM actores WHERE id_nacionalidad = $1) AS actores_count,
            (SELECT COUNT(*) FROM distribuidora WHERE id_pais_origen = $1) AS distribuidores_count
        `,
        [idPais]
    );

    const { actores_count, distribuidores_count } = result.rows[0];

    return parseInt(actores_count) > 0 || parseInt(distribuidores_count) > 0;
};