import db from '../config/db.js';


export const findAll = async () => {
    const result = await db.query('SELECT * FROM anuncios ORDER BY creado_en DESC');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM anuncios WHERE id = $1', [id]);
    return result.rows[0];
};

export const findActive = async () => {
    const result = await db.query(`
      SELECT * FROM anuncios 
      WHERE estado = 'Activo' 
      AND fecha_inicio <= NOW() 
      AND fecha_fin >= NOW() 
      ORDER BY creado_en DESC
    `);
    return result.rows;
};

export const insert = async ({ mensaje, color_inicio, color_fin, fecha_inicio, fecha_fin, estado }) => {
    const result = await db.query(`
      INSERT INTO anuncios 
      (mensaje, color_inicio, color_fin, fecha_inicio, fecha_fin, estado) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [mensaje, color_inicio, color_fin, fecha_inicio, fecha_fin, estado]);
    return result.rows[0];
};

export const update = async (id, { mensaje, color_inicio, color_fin, fecha_inicio, fecha_fin, estado }) => {
    const result = await db.query(`
      UPDATE anuncios 
      SET mensaje = $1, color_inicio = $2, color_fin = $3, 
          fecha_inicio = $4, fecha_fin = $5, estado = $6
      WHERE id = $7
      RETURNING *
    `, [mensaje, color_inicio, color_fin, fecha_inicio, fecha_fin, estado, id]);
    return result.rows[0];
};

export const updateEstado = async (id, estado) => {
    const result = await db.query(`
      UPDATE anuncios 
      SET estado = $1
      WHERE id = $2
      RETURNING *
    `, [estado, id]);
    return result.rows[0];
};

export const remove = async (id) => {
    await db.query('DELETE FROM anuncios WHERE id = $1', [id]);
};