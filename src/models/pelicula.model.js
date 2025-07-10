import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM peliculas');
    return result.rows;
};
export const findAllComplete = async () => {
    const query = 'SELECT * FROM obtener_todas_las_peliculas_completas();';
    const result = await db.query(query);
    return result.rows[0].obtener_todas_las_peliculas_completas;
};
export const findAllActores = async (id) => {
    const result = await db.query('SELECT id_actor FROM pelicula_actores WHERE id_pelicula = $1', [id]);
    const soloActores = result.rows.map(item => item.id_actor);
    return soloActores;
};

export const findAllGeneros = async (id) => {
    const result = await db.query('SELECT id_genero FROM pelicula_generos WHERE id_pelicula = $1', [id]);
    const soloGeneros = result.rows.map(item => item.id_genero);
    return soloGeneros;
};

export const findAllEtiquetas = async (id) => {
    const result = await db.query('SELECT id_etiqueta FROM etiquetas_pelicula WHERE id_pelicula = $1', [id]);
    const soloEtiquetas = result.rows.map(item => item.id_etiqueta);
    return soloEtiquetas;
};

export const findAllIdiomas = async (id) => {
    const result = await db.query('SELECT id_idioma FROM pelicula_idiomas WHERE id_pelicula = $1', [id]);
    const soloIdiomas = result.rows.map(item => item.id_idioma);
    return soloIdiomas;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM peliculas WHERE id_pelicula = $1', [id]);
    return result.rows[0];
};

export const findByIdComplete = async (id) => {
    const query = 'SELECT * FROM obtener_pelicula_completa($1) as pelicula;';
    const result = await db.query(query, [id]);

    let pelicula = result.rows[0].pelicula;
    if (typeof pelicula === 'string') {
        pelicula = JSON.parse(pelicula);
    }
    return pelicula;
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
    etiquetas,
    img_carrusel
}) => {
    await db.query(
        'CALL insertar_pelicula_completa($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
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
            etiquetas,
            JSON.stringify(img_carrusel)
        ]
    );
};

export const update = async (id, {
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
    etiquetas,
    img_carrusel
}) => {
    await db.query(
        'CALL actualizar_pelicula_completa($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, $14)',
        [id,
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
            etiquetas,
            JSON.stringify(img_carrusel), // 👈 importante

        ]
    );
};

export const remove = async (id) => {
    await db.query('DELETE FROM peliculas WHERE id_pelicula = $1', [id]);
}