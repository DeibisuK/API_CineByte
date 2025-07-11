import db from '../config/db.js';

// Crear un nuevo registro de venta_asiento
export const create = async (ventaAsientoData) => {
    const client = await db.connect();
    try {
        const query = `
            INSERT INTO venta_asientos (id_venta, id_asiento, precio_unitario)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [
            ventaAsientoData.venta_id,
            ventaAsientoData.id_asiento,
            ventaAsientoData.precio_asiento
        ];
        
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Crear múltiples asientos para una venta
export const createMultiple = async (venta_id, asientos) => {
    const client = await db.connect();
    try {
        const values = [];
        const placeholders = [];
          asientos.forEach((asiento, index) => {
            const baseIndex = index * 3;
            placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
            values.push(venta_id, asiento.id_asiento || 1, asiento.precio_asiento);
        });

        const query = `
            INSERT INTO venta_asientos (id_venta, id_asiento, precio_unitario)
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
        const query = 'SELECT * FROM venta_asientos WHERE id_venta = $1';
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
