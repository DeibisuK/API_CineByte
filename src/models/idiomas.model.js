import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM idiomas');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM idiomas WHERE id_idioma = $1', [id]);
    return result.rows[0];
};

export const insert = async({nombre}) => {
    const result = await db.query('INSERT INTO idiomas (nombre) VALUES ($1) RETURNING *'
        , [nombre]);
    return result.rows[0];
};

export const update = async(id,{nombre}) => {
    const result = await db.query(
        'UPDATE idiomas SET nombre = $1 WHERE id_idioma = $2',
        [nombre, id]
    );
}

export const remove = async(id) => {
    await db.query('DELETE FROM idiomas WHERE id_idioma = $1', [id]);
}