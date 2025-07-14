import db from '../config/db.js';

// Crear un nuevo registro de venta_asiento
export const create = async (ventaAsientoData) => {
    const client = await db.connect();
    try {
        const query = `
            INSERT INTO venta_asientos (id_venta, id_asiento, id_funcion, precio_unitario)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            ventaAsientoData.venta_id,
            ventaAsientoData.id_asiento,
            ventaAsientoData.id_funcion,
            ventaAsientoData.precio_asiento
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Crear múltiples asientos para una venta
export const createMultiple = async (venta_id, asientos, id_funcion) => {
    const client = await db.connect();
    try {
        const values = [];
        const placeholders = [];
        asientos.forEach((asiento, index) => {
            const baseIndex = index * 4; // Ahora son 4 campos
            placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`);
            values.push(venta_id, asiento.id_asiento || 1, id_funcion, asiento.precio_asiento);
        });

        const query = `
            INSERT INTO venta_asientos (id_venta, id_asiento, id_funcion, precio_unitario)
            VALUES ${placeholders.join(', ')}
            RETURNING *
        `;

        const result = await client.query(query, values);
        return result.rows;
    } finally {
        client.release();
    }
};

// Obtener asientos de una venta
export const findByVentaId = async (venta_id) => {
    const client = await db.connect();
    try {
        const query = `
            SELECT va.*, a.numero_asiento, a.fila, f.fecha_hora
            FROM venta_asientos va
            JOIN asientos a ON va.id_asiento = a.id_asiento
            JOIN funciones f ON va.id_funcion = f.id_funcion
            WHERE va.id_venta = $1
        `;
        const result = await client.query(query, [venta_id]);
        return result.rows;
    } finally {
        client.release();
    }
};

// Eliminar asientos de una venta (para cancelaciones)
export const deleteByVentaId = async (venta_id) => {
    const client = await db.connect();
    try {
        const query = 'DELETE FROM venta_asientos WHERE id_venta = $1';
        const result = await client.query(query, [venta_id]);
        return result.rowCount;
    } finally {
        client.release();
    }
};

// Verificar disponibilidad de asientos para una función específica
export const verificarDisponibilidadPorFuncion = async (id_funcion, asientos_ids) => {
    const client = await db.connect();
    try {
        const query = `
            SELECT * FROM public.verificar_disponibilidad_asientos($1, $2)
        `;
        const result = await client.query(query, [id_funcion, asientos_ids]);
        return result.rows;
    } finally {
        client.release();
    }
};

// Obtener asientos disponibles de una sala para una función
export const getAsientosDisponiblesPorFuncion = async (id_sala, id_funcion) => {
    const client = await db.connect();
    try {
        console.log(`🎬 getAsientosDisponiblesPorFuncion: Sala ${id_sala}, Función ${id_funcion}`);

        const query = `
            SELECT 
                a.id_asiento,
                a.id_sala,
                a.fila,
                a.columna,
                a.tipo,
                a.url_imagen,
                a.fecha_creacion,
                CASE 
                    WHEN va.id_asiento IS NOT NULL THEN false
                    ELSE true
                END as disponible,
                CASE 
                    WHEN va.id_asiento IS NOT NULL THEN true
                    ELSE false
                END as ocupado
            FROM asientos a
            LEFT JOIN venta_asientos va ON a.id_asiento = va.id_asiento 
                AND va.id_funcion = $2
            WHERE a.id_sala = $1
            ORDER BY a.fila, a.columna
        `;

        console.log('🗃️ Query SQL:', query);
        console.log('🎯 Parámetros:', [id_sala, id_funcion]);

        const result = await client.query(query, [id_sala, id_funcion]);

        console.log(`📊 Asientos encontrados: ${result.rows.length}`);
        console.log('🪑 Primeros 3 asientos:', result.rows.slice(0, 3));

        // Verificar si hay asientos ocupados
        const ocupados = result.rows.filter(a => a.ocupado === true);
        console.log(`🔴 Asientos ocupados: ${ocupados.length}`);
        if (ocupados.length > 0) {
            console.log('🎯 Asientos ocupados:', ocupados.map(a => `${a.fila}${a.columna}`));
        }

        return result.rows;
    } finally {
        client.release();
    }
};

// Verificar si asientos específicos están ocupados en una función
export const checkAsientosOcupadosEnFuncion = async (id_funcion, asientos_ids) => {
    const client = await db.connect();
    try {
        console.log('🔍 Ejecutando checkAsientosOcupadosEnFuncion:', { id_funcion, asientos_ids });

        // Primero verificar si existen registros en venta_asientos
        const countQuery = `SELECT COUNT(*) as total FROM venta_asientos`;
        const countResult = await client.query(countQuery);
        console.log('📊 Total registros en venta_asientos:', countResult.rows[0].total);

        // Si no hay registros, los asientos están disponibles
        if (countResult.rows[0].total === '0') {
            console.log('✅ No hay registros en venta_asientos, todos los asientos están disponibles');
            return [];
        }

        const query = `
            SELECT va.id_asiento, va.precio_unitario, v.estado as estado_venta
            FROM venta_asientos va
            JOIN ventas v ON va.id_venta = v.id_venta
            WHERE va.id_funcion = $1 
            AND va.id_asiento = ANY($2::int[])
            AND v.estado != 'Cancelada'
        `;

        console.log('🗃️ Query SQL:', query);
        console.log('🎯 Parámetros:', [id_funcion, asientos_ids]);

        const result = await client.query(query, [id_funcion, asientos_ids]);

        console.log('📊 Resultado query:', result.rows);
        console.log('📈 Filas encontradas:', result.rowCount);

        return result.rows;
    } catch (error) {
        console.error('❌ Error en checkAsientosOcupadosEnFuncion:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Obtener ocupación de asientos por función (para analytics)
export const getOcupacionPorFuncion = async (id_funcion) => {
    const client = await db.connect();
    try {
        const query = `
            SELECT 
                f.id_funcion,
                s.nombre as sala,
                s.id_sala,
                COUNT(a.id_asiento) as total_asientos,
                COUNT(va.id_asiento) as asientos_vendidos,
                (COUNT(a.id_asiento) - COUNT(va.id_asiento)) as asientos_disponibles,
                ROUND((COUNT(va.id_asiento)::decimal / COUNT(a.id_asiento)) * 100, 2) as porcentaje_ocupacion
            FROM funciones f
            JOIN salas s ON f.id_sala = s.id_sala
            JOIN asientos a ON s.id_sala = a.id_sala
            LEFT JOIN venta_asientos va ON (
                a.id_asiento = va.id_asiento 
                AND va.id_funcion = f.id_funcion
            )
            LEFT JOIN ventas v ON (
                va.id_venta = v.id_venta 
                AND v.estado != 'Cancelada'
            )
            WHERE f.id_funcion = $1
            GROUP BY f.id_funcion, s.nombre, s.id_sala
        `;
        const result = await client.query(query, [id_funcion]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// 🔧 TEMPORAL: Función de verificación de estructura de BD
export const verificarEstructuraBD = async () => {
    const client = await db.connect();
    try {
        // Verificar si existe la columna id_funcion en venta_asientos
        const checkColumnQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'venta_asientos' 
            AND column_name = 'id_funcion'
        `;

        const columnResult = await client.query(checkColumnQuery);
        console.log('📋 Estructura columna id_funcion:', columnResult.rows);

        // Verificar registros en venta_asientos
        const countQuery = `SELECT COUNT(*) as total FROM venta_asientos`;
        const countResult = await client.query(countQuery);
        console.log('📊 Total registros en venta_asientos:', countResult.rows[0]);

        // Verificar registros con id_funcion
        const withFuncionQuery = `SELECT COUNT(*) as con_funcion FROM venta_asientos WHERE id_funcion IS NOT NULL`;
        const withFuncionResult = await client.query(withFuncionQuery);
        console.log('🎭 Registros con id_funcion:', withFuncionResult.rows[0]);

        return {
            column_exists: columnResult.rowCount > 0,
            total_records: countResult.rows[0].total,
            records_with_funcion: withFuncionResult.rows[0].con_funcion
        };
    } catch (error) {
        console.error('❌ Error verificando estructura BD:', error);
        return { error: error.message };
    } finally {
        client.release();
    }
};

export const getVentasPorDia = async (startDate, endDate) => {
    const query = `
            SELECT 
                DATE(va.fecha_venta) AS fecha,
                COUNT(*) AS total_asientos,
                SUM(va.precio_unitario) AS total_ventas
            FROM venta_asientos va
            JOIN ventas v ON va.id_venta = v.id_venta
            WHERE v.estado != 'pendiente'
              AND va.fecha_venta BETWEEN $1 AND $2
            GROUP BY DATE(va.fecha_venta)
            ORDER BY fecha DESC
            LIMIT 7;
        `;
    const result = await db.query(query, [startDate, endDate]);
    console.log(`📊 Ventas por día desde ${startDate} hasta ${endDate}:`, result.rows);
    return result.rows;
}

