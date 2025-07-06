import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM obtener_funciones_list();');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM funciones WHERE id_funcion = $1', [id]);
    return result.rows[0];
};

export const insert = async ({ id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin }) => {

    /*
    INSERT INTO public.funciones(
	id_funcion, id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    */
    const result = await db.query('INSERT INTO funciones (id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
        , [id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin]);
    return result.rows[0];
};

export const update = async (id, { id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin }) => {
    const result = await db.query(
        'UPDATE funciones SET id_pelicula = $1, id_sala = $2, fecha_hora_inicio = $3, precio_funcion = $4, id_idioma = $5, trailer_url = $6, estado = $7, fecha_hora_fin = $8 WHERE id_funcion = $9 RETURNING *',
        [id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin, id]
    );
    return result.rows[0];
}

export const remove = async (id) => {
    const result = await db.query(
        'DELETE FROM funciones WHERE id_funcion = $1 RETURNING *;',
        [id]
    );
    return result.rowCount > 0 ? result.rows[0] : null;
}