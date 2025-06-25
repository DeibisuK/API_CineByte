import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM distribuidora');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM distribuidora WHERE id_distribuidora = $1', [id]);
    return result.rows[0];
};

export const insert = async({nombre, pais_origen, ano_fundacion, sitio_web, fecha_registro}) => {
    const result = await db.query('INSERT INTO distribuidora (nombre, pais_origen, ano_fundacion, sitio_web, fecha_registro) VALUES ($1,$2,$3,$4,$5) RETURNING *'
        , [nombre, pais_origen, ano_fundacion, sitio_web, fecha_registro]);
    return result.rows[0];
};

export const update = async(id,{nombre, pais_origen, ano_fundacion, sitio_web, fecha_registro}) => {
    const result = await db.query(
        'UPDATE distribuidora SET nombre = $1,pais_origen=$2, ano_fundacion=$3, sitio_web=$4, fecha_registro=$5 WHERE id_distribuidora = $6',
        [nombre, pais_origen, ano_fundacion, sitio_web, fecha_registro,id]
    );
}

export const remove = async(id) => {
    await db.query('DELETE FROM distribuidora WHERE id_distribuidora = $1', [id]);
}