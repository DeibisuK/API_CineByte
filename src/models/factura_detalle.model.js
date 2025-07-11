import db from '../config/db.js';

// Crear un nuevo detalle de factura
export const create = async (detalleData) => {
    const client = await db.connect();
    try {
        const query = `
            INSERT INTO factura_detalles (id_factura, descripcion, cantidad, precio_unitario, subtotal)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            detalleData.factura_id,
            detalleData.descripcion,
            detalleData.cantidad,
            detalleData.precio_unitario,
            detalleData.subtotal
        ];
        
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Crear múltiples detalles para una factura
export const createMultiple = async (factura_id, detalles) => {
    const client = await db.connect();
    try {
        const values = [];
        const placeholders = [];
        
        detalles.forEach((detalle, index) => {
            const baseIndex = index * 5;
            placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`);
            values.push(
                factura_id,
                detalle.descripcion,
                detalle.cantidad,
                detalle.precio_unitario,
                detalle.subtotal
            );
        });
        
        const query = `
            INSERT INTO factura_detalles (id_factura, descripcion, cantidad, precio_unitario, subtotal)
            VALUES ${placeholders.join(', ')}
            RETURNING *
        `;
        
        const result = await client.query(query, values);
        return result.rows;
    } finally {
        client.release();
    }
};

// Obtener detalles de una factura
export const findByFacturaId = async (factura_id) => {
    const client = await db.connect();
    try {
        const query = 'SELECT * FROM factura_detalles WHERE id_factura = $1';
        const result = await client.query(query, [factura_id]);
        return result.rows;
    } finally {
        client.release();
    }
};
