import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query('SELECT * FROM promociones');
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query('SELECT * FROM promociones WHERE id_promo = $1', [id]);
    return result.rows[0];
};

export const insert = async ({
    imagen_url,
    titulo,
    descripcion,
    tipo_promocion,
    fecha_inicio,
    fecha_fin,
    url_link,
    estado,
    porcentaje_descuento,
    nro_boletos,
    codigo_cupon,
    dia_valido
}) => {
    const result = await db.query(
        `INSERT INTO promociones (
            imagen_url, titulo, descripcion, tipo_promocion, 
            fecha_inicio, fecha_fin, url_link, estado,
            porcentaje_descuento, nro_boletos, codigo_cupon, dia_valido
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
            imagen_url, titulo, descripcion, tipo_promocion,
            fecha_inicio, fecha_fin, url_link, estado,
            porcentaje_descuento, nro_boletos, codigo_cupon, dia_valido
        ]
    );
    return result.rows[0];
};

export const update = async (id, {
    imagen_url,
    titulo,
    descripcion,
    tipo_promocion,
    fecha_inicio,
    fecha_fin,
    url_link,
    estado,
    porcentaje_descuento,
    nro_boletos,
    codigo_cupon,
    dia_valido
}) => {
    const result = await db.query(
        `UPDATE promociones SET 
            imagen_url = $1, titulo = $2, descripcion = $3, tipo_promocion = $4,
            fecha_inicio = $5, fecha_fin = $6, url_link = $7, estado = $8,
            porcentaje_descuento = $9, nro_boletos = $10, codigo_cupon = $11, dia_valido = $12
        WHERE id_promo = $13 RETURNING *`,
        [
            imagen_url, titulo, descripcion, tipo_promocion,
            fecha_inicio, fecha_fin, url_link, estado,
            porcentaje_descuento, nro_boletos, codigo_cupon, dia_valido,
            id
        ]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    await db.query('DELETE FROM promociones WHERE id_promo = $1', [id]);
};

//Ver si esta activo
export const findActive = async () => {
    const result = await db.query(
        `SELECT * FROM promociones 
         WHERE estado = 'Activo' 
         AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin`
    );
    return result.rows;
};

//Validar cupon
export const validateCoupon = async (codigo) => {
    const result = await db.query(
        `SELECT * FROM promociones 
         WHERE codigo_cupon = $1 
         AND estado = 'Activo'
         AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin`,
        [codigo]
    );
    return result.rows[0];
};