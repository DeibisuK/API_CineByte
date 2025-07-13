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

export const getAnioFromPeliculas = async () => {
    const result = await db.query('SELECT DISTINCT EXTRACT(YEAR FROM fecha_estreno)::int AS anio FROM peliculas ORDER BY anio DESC;');
    return result.rows.map(row => row.anio);
}

// Métodos alternativos que no dependen de funciones almacenadas
export const findAllCompleteAlternative = async () => {
    const query = `
        SELECT 
            p.*,
            COALESCE(
                (SELECT json_agg(json_build_object('id_genero', pg.id_genero, 'nombre', g.nombre))
                 FROM pelicula_generos pg 
                 JOIN generos g ON pg.id_genero = g.id_genero 
                 WHERE pg.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as generos,
            COALESCE(
                (SELECT json_agg(json_build_object('id_actor', pa.id_actor, 'nombre', a.nombre))
                 FROM pelicula_actores pa 
                 JOIN actores a ON pa.id_actor = a.id_actor 
                 WHERE pa.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as actores,
            COALESCE(
                (SELECT json_agg(json_build_object('id_etiqueta', ep.id_etiqueta, 'nombre', e.nombre))
                 FROM etiquetas_pelicula ep 
                 JOIN etiquetas e ON ep.id_etiqueta = e.id_etiqueta 
                 WHERE ep.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as etiquetas,
            COALESCE(
                (SELECT json_agg(json_build_object('id_idioma', pi.id_idioma, 'nombre', i.nombre))
                 FROM pelicula_idiomas pi 
                 JOIN idiomas i ON pi.id_idioma = i.id_idioma 
                 WHERE pi.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as idiomas
        FROM peliculas p
        ORDER BY p.fecha_estreno DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

export const findByIdCompleteAlternative = async (id) => {
    const query = `
        SELECT 
            p.*,
            COALESCE(
                (SELECT json_agg(json_build_object('id_genero', pg.id_genero, 'nombre', g.nombre))
                 FROM pelicula_generos pg 
                 JOIN generos g ON pg.id_genero = g.id_genero 
                 WHERE pg.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as generos,
            COALESCE(
                (SELECT json_agg(json_build_object('id_actor', pa.id_actor, 'nombre', a.nombre))
                 FROM pelicula_actores pa 
                 JOIN actores a ON pa.id_actor = a.id_actor 
                 WHERE pa.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as actores,
            COALESCE(
                (SELECT json_agg(json_build_object('id_etiqueta', ep.id_etiqueta, 'nombre', e.nombre))
                 FROM etiquetas_pelicula ep 
                 JOIN etiquetas e ON ep.id_etiqueta = e.id_etiqueta 
                 WHERE ep.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as etiquetas,
            COALESCE(
                (SELECT json_agg(json_build_object('id_idioma', pi.id_idioma, 'nombre', i.nombre))
                 FROM pelicula_idiomas pi 
                 JOIN idiomas i ON pi.id_idioma = i.id_idioma 
                 WHERE pi.id_pelicula = p.id_pelicula), 
                '[]'::json
            ) as idiomas
        FROM peliculas p
        WHERE p.id_pelicula = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};