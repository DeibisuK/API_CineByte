import db from '../config/db.js';

export const findAll = async () => {
  const result = await db.query('SELECT * FROM obtener_todas_las_peliculas_completas()');
  return result.rows;
};

export const findById = async (id) => {
  const result = await db.query('SELECT * FROM peliculas WHERE id_pelicula = $1', [id]);
  return result.rows[0];
};
export const insert = async ({
  titulo,
  descripcion,
  duracion_minutos,
  fecha_estreno,
  estado,
  clasificacion,
  imagen,
  id_distribuidor,
  idiomas,
  generos,
  actores,
  etiquetas
}) => {
  await db.query(
    'CALL insertar_pelicula_completa($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [
      titulo,
      descripcion,
      duracion_minutos,
      fecha_estreno,
      estado,
      clasificacion,
      imagen,
      id_distribuidor,
      idiomas,  // array de enteros
      generos,
      actores,
      etiquetas
    ]
  );
};
export const update = async (id, { titulo, descripcion, duracion_minutos, fecha_estreno, estado, clasificacion, imagen }) => {
  const result = await db.query(
    'UPDATE peliculas SET titulo = $1, descripcion = $2, duracion_minutos = $3, fecha_estreno = $4, estado = $5, clasificacion = $6, imagen = $7 WHERE id_pelicula = $8',
    [titulo, descripcion, duracion_minutos, fecha_estreno, estado, clasificacion, imagen, id]
  );
}

export const remove = async (id) => {
  const query = 'SELECT eliminar_pelicula_y_relaciones($1) AS mensaje';
  const { rows } = await db.query(query, [id]);
  return rows[0].mensaje;
};