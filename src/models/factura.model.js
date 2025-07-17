import db from '../config/db.js';

// Crear una nueva factura
export const create = async (facturaData) => {
    const client = await db.connect();
    try {
        const query = `
            INSERT INTO facturas (
                id_venta, numero_factura, cliente_nombre, cliente_email, cliente_telefono,
                pelicula_titulo, sala_nombre, fecha_funcion, hora_inicio, hora_fin, idioma,
                subtotal, iva_valor, total,
                promocion_aplicada, codigo_cupon_usado, descuento_aplicado
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;
        const values = [
            facturaData.venta_id,
            facturaData.numero_factura,
            facturaData.cliente_nombre, // Ya no usar valores por defecto
            facturaData.cliente_email,
            facturaData.cliente_telefono,
            facturaData.pelicula_titulo,
            facturaData.sala_nombre,
            facturaData.fecha_funcion,
            facturaData.hora_inicio,
            facturaData.hora_fin,
            facturaData.idioma,
            facturaData.subtotal,
            facturaData.iva_valor || facturaData.iva, // Manejar ambos nombres
            facturaData.total, // Ya es el total final con descuento aplicado
            facturaData.promocion_aplicada || null,
            facturaData.codigo_cupon_usado || null,
            facturaData.descuento_aplicado || 0.00
        ];
        
        const result = await client.query(query, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener factura por ID
export const findById = async (id) => {
    const client = await db.connect();
    try {
        const query = 'SELECT * FROM facturas WHERE id = $1';
        const result = await client.query(query, [id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener factura por venta
export const findByVentaId = async (venta_id) => {
    const client = await db.connect();
    try {
        const query = 'SELECT * FROM facturas WHERE id_venta = $1';
        const result = await client.query(query, [venta_id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Actualizar estado de factura
export const updateEstado = async (id, estado) => {
    const client = await db.connect();
    try {
        const query = `
            UPDATE facturas 
            SET estado = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await client.query(query, [estado, id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Generar número de factura único
export const generateNumeroFactura = async () => {
    const client = await db.connect();
    try {
        // Obtener el último número de factura del año actual
        const query = `
            SELECT numero_factura 
            FROM facturas 
            WHERE numero_factura LIKE $1 
            ORDER BY numero_factura DESC 
            LIMIT 1
        `;
        const year = new Date().getFullYear();
        const prefix = `F${year}`;
        
        const result = await client.query(query, [`${prefix}%`]);
        
        if (result.rows.length === 0) {
            return `${prefix}001`;
        }
        
        const lastNumber = result.rows[0].numero_factura;
        const sequence = parseInt(lastNumber.substring(5)) + 1;
        return `${prefix}${sequence.toString().padStart(3, '0')}`;
    } finally {
        client.release();
    }
};
