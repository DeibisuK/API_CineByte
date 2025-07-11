import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM salas ORDER BY nombre');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM salas WHERE id_sala = $1', [id]);
    return result.rows[0];
};

export const insert = async ({ nombre, cantidad_asientos, tipo_sala, espacios }) => {
    const result = await db.query(
        `INSERT INTO salas (nombre, cantidad_asientos, tipo_sala, espacios) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [nombre, cantidad_asientos, tipo_sala, JSON.stringify(espacios)]
    );
    return result.rows[0];
};

export const update = async (id, { nombre, cantidad_asientos, tipo_sala, espacios }) => {
    const result = await db.query(
        `UPDATE salas SET 
            nombre = $1, cantidad_asientos = $2, tipo_sala = $3, espacios = $4
         WHERE id_sala = $5 RETURNING *`,
        [nombre, cantidad_asientos, tipo_sala, JSON.stringify(espacios), id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    await db.query('DELETE FROM salas WHERE id_sala = $1', [id]);
};

export const findByEstado = async (estado) => {
    const result = await db.query('SELECT * FROM salas WHERE estado = $1 ORDER BY nombre', [estado]);
    return result.rows;
};

export const obtenerAsientosPorSala = async (id) => {
    const query = 'SELECT * FROM asientos WHERE id_sala = $1 ORDER BY fila, columna;';
    const result = await db.query(query, [id]);
    return result.rows;
};