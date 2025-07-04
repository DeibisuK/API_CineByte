import db from '../config/db.js';

// Crear sala (inserta y se activa el trigger en PostgreSQL)
export const crearSala = async ({ nombre, tipo_sala, cantidad_asientos, espacios }) => {
  const query = `
    INSERT INTO salas (
      nombre, tipo_sala, cantidad_asientos, espacios
    ) VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [nombre, tipo_sala, cantidad_asientos, JSON.stringify(espacios)];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Obtener todas las salas
export const listarSalas = async () => {
  const query = 'SELECT * FROM salas ORDER BY id_sala';
  const result = await db.query(query);
  return result.rows;
};

// Obtener sala por ID
export const getSalaById = async (id_sala) => {
  const query = 'SELECT * FROM salas WHERE id_sala = $1';
  const result = await db.query(query, [id_sala]);
  return result.rows[0];
};

// Editar sala
export const editarSala = async (id_sala, datos) => {
  const { nombre, tipo_sala, cantidad_asientos, espacios } = datos;
  const query = `
    UPDATE salas SET
      nombre = $1,
      tipo_sala = $2,
      cantidad_asientos = $3,
      espacios = $4
    WHERE id_sala = $5
    RETURNING *;
  `;
  const values = [nombre, tipo_sala, cantidad_asientos, JSON.stringify(espacios), id_sala];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Eliminar sala
export const eliminarSala = async (id_sala) => {
  const query = 'DELETE FROM salas WHERE id_sala = $1 RETURNING *;';
  const result = await db.query(query, [id_sala]);
  return result.rows[0];
};

export const obtenerAsientosPorSala = async (id_sala) => {
  const query = 'SELECT * FROM asientos WHERE id_sala = $1 ORDER BY fila, columna;';
  const result = await db.query(query, [id_sala]);
  return result.rows;
};
