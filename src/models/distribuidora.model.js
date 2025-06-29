import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM distribuidora');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM distribuidora WHERE id_distribuidora = $1', [id]);
    return result.rows[0];
};

export const insert = async ({ nombre, ano_fundacion, sitio_web, fecha_registro, id_pais_origen }) => {
    const result = await db.query('INSERT INTO distribuidora (nombre, ano_fundacion, sitio_web, fecha_registro,id_pais_origen) VALUES ($1,$2,$3,$4,$5) RETURNING *'
        , [nombre, ano_fundacion, sitio_web, fecha_registro, id_pais_origen]);
    return result.rows[0];
};

export const update = async (id, { nombre, ano_fundacion, sitio_web, fecha_registro, id_pais_origen }) => {
    const result = await db.query(
        'UPDATE distribuidora SET nombre = $1, ano_fundacion=$2, sitio_web=$3, fecha_registro=$4,id_pais_origen=$5 WHERE id_distribuidora = $6 RETURNING *',
        [nombre, ano_fundacion, sitio_web, fecha_registro, id_pais_origen, id]
    );
    return result.rows[0];
}

export const remove = async (id) => {
    const result = await db.query('DELETE FROM distribuidora WHERE id_distribuidora = $1', [id]);
    return result.rowCount > 0 ? result.rows[0] : null;
}