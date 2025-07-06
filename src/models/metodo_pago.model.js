import db from '../config/db.js';

// Función para detectar el banco basado en el número de tarjeta
export const detectarBanco = (numeroTarjeta) => {
    const numero = numeroTarjeta.replace(/\s/g, ''); // Remover espacios
    const primerDigito = numero.charAt(0);
    const primerosCuatro = numero.substring(0, 4);
    
    // Patrones de bancos principales
    if (numero.startsWith('4')) {
        return 'Visa';
    } else if (numero.startsWith('5') || (numero.startsWith('2') && parseInt(primerosCuatro) >= 2221 && parseInt(primerosCuatro) <= 2720)) {
        return 'Mastercard';
    } else if (numero.startsWith('34') || numero.startsWith('37')) {
        return 'American Express';
    } else if (numero.startsWith('6011') || numero.startsWith('644') || numero.startsWith('645') || numero.startsWith('646') || numero.startsWith('647') || numero.startsWith('648') || numero.startsWith('649') || numero.startsWith('65')) {
        return 'Discover';
    } else if (numero.startsWith('30') || numero.startsWith('36') || numero.startsWith('38')) {
        return 'Diners Club';
    } else if (numero.startsWith('35')) {
        return 'JCB';
    } else {
        return 'Banco Desconocido';
    }
};

// Obtener todos los métodos de pago de un usuario
export const findByFirebaseUid = async (firebase_uid) => {
    const result = await db.query(
        'SELECT * FROM metodos_pago WHERE firebase_uid = $1 ORDER BY fecha_creacion DESC',
        [firebase_uid]
    );
    return result.rows;
};

// Obtener un método de pago por ID
export const findById = async (id) => {
    const result = await db.query(
        'SELECT * FROM metodos_pago WHERE id_metodo_pago = $1',
        [id]
    );
    return result.rows[0];
};

// Obtener un método de pago por ID y usuario (para seguridad)
export const findByIdAndUser = async (id, firebase_uid) => {
    const result = await db.query(
        'SELECT * FROM metodos_pago WHERE id_metodo_pago = $1 AND firebase_uid = $2',
        [id, firebase_uid]
    );
    return result.rows[0];
};

// Crear un nuevo método de pago
export const insert = async ({
    firebase_uid,
    numero_tarjeta,
    fecha_expiracion,
    cvv
}) => {
    const banco = detectarBanco(numero_tarjeta);
    
    const result = await db.query(
        `INSERT INTO metodos_pago 
        (firebase_uid, numero_tarjeta, fecha_expiracion, cvv, banco) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
        [firebase_uid, numero_tarjeta, fecha_expiracion, cvv, banco]
    );
    return result.rows[0];
};

// Actualizar un método de pago
export const update = async (id, {
    numero_tarjeta,
    fecha_expiracion,
    cvv
}) => {
    const banco = detectarBanco(numero_tarjeta);
    
    const result = await db.query(
        `UPDATE metodos_pago 
        SET numero_tarjeta = $1, fecha_expiracion = $2, cvv = $3, banco = $4
        WHERE id_metodo_pago = $5 
        RETURNING *`,
        [numero_tarjeta, fecha_expiracion, cvv, banco, id]
    );
    return result.rows[0];
};

// Eliminar un método de pago
export const remove = async (id) => {
    await db.query('DELETE FROM metodos_pago WHERE id_metodo_pago = $1', [id]);
};
