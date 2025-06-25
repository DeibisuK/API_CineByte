import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM actores');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM actores WHERE id_actor = $1', [id]);
    return result.rows[0];
};

export const insert = async({nombre, apellidos, fecha_nacimiento, nacionalidad, fecha_registro}) => {
    const result = await db.query('INSERT INTO actores (nombre, apellidos, fecha_nacimiento, nacionalidad, fecha_registro) VALUES ($1,$2,$3,$4,$5) RETURNING *'
        , [nombre, apellidos, fecha_nacimiento, nacionalidad, fecha_registro]);
    return result.rows[0];
};

export const update = async(id,{nombre, apellidos, fecha_nacimiento, nacionalidad, fecha_registro}) => {
    const result = await db.query(
        'UPDATE actores SET nombre = $1,apellidos=$2, fecha_nacimiento=$3, nacionalidad=$4, fecha_registro=$5 WHERE id_actor = $6',
        [nombre, apellidos, fecha_nacimiento, nacionalidad, fecha_registro,id]
    );
}

export const remove = async(id) => {
    await db.query('DELETE FROM actores WHERE id_actor = $1', [id]);
}