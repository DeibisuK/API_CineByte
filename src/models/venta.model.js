import db from '../config/db.js';

// Crear una nueva venta
export const create = async (ventaData) => {
    const client = await db.connect();
    try {
        const query = `
            INSERT INTO ventas (firebase_uid, id_funcion, cantidad_boletos, subtotal, iva, total, estado, fecha_venta)
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const values = [
            ventaData.firebase_uid,
            ventaData.funcion_id,
            ventaData.total_asientos,
            ventaData.subtotal,
            ventaData.iva,
            ventaData.total,
            ventaData.estado || 'pendiente'
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener venta por ID
export const findById = async (id) => {
    const client = await db.connect();
    try {
        const query = 'SELECT * FROM ventas WHERE id_venta = $1';
        const result = await client.query(query, [id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener venta por ID y usuario
export const findByIdAndUser = async (id, firebase_uid) => {
    const client = await db.connect();
    try {
        const query = 'SELECT * FROM ventas WHERE id_venta = $1 AND firebase_uid = $2';
        const result = await client.query(query, [id, firebase_uid]); 
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Actualizar estado de venta
export const updateEstado = async (id, estado) => {
    const client = await db.connect();
    try {
        const query = `
            UPDATE ventas
            SET estado = $1
            WHERE id_venta = $2
            RETURNING *
        `;
        const result = await client.query(query, [estado, id]);       
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener historial de ventas de un usuario
export const getHistorialByUser = async (firebase_uid, limit = 10, offset = 0) => {
    const client = await db.connect();
    try {
        const query = `
            SELECT
                v.*,
                p.titulo as pelicula_titulo,
                s.nombre as sala_nombre,
                f.fecha_hora_inicio as fecha_funcion,
                EXTRACT(HOUR FROM f.fecha_hora_inicio) || ':' || LPAD(EXTRACT(MINUTE FROM f.fecha_hora_inicio)::text, 2, '0') as hora_funcion,
                array_agg(va.numero_asiento) as asientos
            FROM ventas v
            LEFT JOIN funciones f ON v.id_funcion = f.id_funcion      
            LEFT JOIN peliculas p ON f.id_pelicula = p.id_pelicula    
            LEFT JOIN salas s ON f.id_sala = s.id_sala
            LEFT JOIN venta_asientos va ON v.id_venta = va.id_venta
            WHERE v.firebase_uid = $1
            GROUP BY v.id_venta, p.titulo, s.nombre, f.fecha_hora_inicio
            ORDER BY v.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await client.query(query, [firebase_uid, limit, offset]);
        return result.rows;
    } finally {
        client.release();
    }
};

// Obtener estadísticas de ventas de un usuario
export const getEstadisticasByUser = async (firebase_uid, fecha_inicio, fecha_fin) => {
    const client = await db.connect();
    try {
        let query = `
            SELECT
                COUNT(*) as total_ventas,
                COALESCE(SUM(total), 0) as total_ingresos,
                COALESCE(SUM(cantidad_boletos), 0) as total_asientos_vendidos
            FROM ventas
            WHERE firebase_uid = $1
        `;

        const params = [firebase_uid];
        let paramIndex = 2;

        if (fecha_inicio) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(fecha_inicio);
            paramIndex++;
        }

        if (fecha_fin) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(fecha_fin);
            paramIndex++;
        }

        const result = await client.query(query, params);
        return result.rows[0];
    } finally {
        client.release();
    }
};
