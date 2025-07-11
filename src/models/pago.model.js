import db from '../config/db.js';

// Crear un nuevo pago
export const create = async (pagoData) => {
    const client = await db.connect();
    try {
        const query = `
            INSERT INTO pagos (id_venta, id_metodo_pago, monto, fecha_pago)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const values = [
            pagoData.venta_id,
            pagoData.metodo_pago_id,
            pagoData.monto
        ];
        
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener pago por ID
export const findById = async (id) => {
    const client = await db.connect();
    try {
        const query = 'SELECT * FROM pagos WHERE id = $1';
        const result = await client.query(query, [id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener pagos por venta
export const findByVentaId = async (venta_id) => {
    const client = await db.connect();
    try {
        const query = 'SELECT * FROM pagos WHERE id_venta = $1';
        const result = await client.query(query, [venta_id]);
        return result.rows;
    } finally {
        client.release();
    }
};


