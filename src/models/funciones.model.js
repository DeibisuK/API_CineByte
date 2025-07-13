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
    const fecha_local = new Date(fecha_hora_inicio);
    const fecha_inicio_str = fecha_local.toLocaleString('sv-SE').replace('T', ' '); // Formato seguro: 'YYYY-MM-DD HH:mm:ss'
    const fecha_fin_local = new Date(fecha_hora_fin);
    const fecha_fin_str = fecha_fin_local.toLocaleString('sv-SE').replace('T', ' '); // Formato seguro: 'YYYY-MM-DD HH:mm:ss'

    const result = await db.query('INSERT INTO funciones (id_pelicula, id_sala, fecha_hora_inicio, precio_funcion, id_idioma, trailer_url, estado, fecha_hora_fin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
        , [id_pelicula, id_sala, fecha_inicio_str, precio_funcion, id_idioma, trailer_url, estado, fecha_fin_str]);
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

export const findFuncionesByPeliculaId = async (id) => {
    const query = 'SELECT * FROM obtener_funciones_por_id_pelicula_completo($1) as funciones;';
    const result = await db.query(query, [id]);


    let funciones = result.rows[0].funciones;
    if (typeof funciones === 'string') {
        funciones = JSON.parse(funciones);
    }
    return funciones;
};

export const updateEstadoFuncion = async (id, estado) => {
    const result = await db.query(
        'UPDATE funciones SET estado = $1 WHERE id_funcion = $2 RETURNING *',
        [estado, id]
    );
    return result.rows[0];
};