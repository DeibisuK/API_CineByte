import db from '../config/db.js';

export const findAll = async () => {
    const result = await db.query(`
        SELECT 
            ss.id_sede_sala,
            ss.id_sede,
            ss.id_sala,
            ss.nombre,
            ss.estado,
            s.nombre AS nombre_sede,
            s.direccion AS direccion_sede,
            sa.nombre AS nombre_sala,
            sa.cantidad_asientos,
            sa.tipo_sala
        FROM sede_salas ss
        JOIN sedes s ON ss.id_sede = s.id_sede
        JOIN salas sa ON ss.id_sala = sa.id_sala
        ORDER BY s.nombre, sa.nombre
    `);
    return result.rows;
};

export const findById = async (id) => {
    const result = await db.query(`
        SELECT 
            ss.id_sede_sala,
            ss.id_sede,
            ss.id_sala,
            ss.nombre,
            ss.estado,
            s.nombre AS nombre_sede,
            s.direccion AS direccion_sede,
            sa.nombre AS nombre_sala,
            sa.cantidad_asientos,
            sa.tipo_sala
        FROM sede_salas ss
        JOIN sedes s ON ss.id_sede = s.id_sede
        JOIN salas sa ON ss.id_sala = sa.id_sala
        WHERE ss.id_sede_sala = $1
    `, [id]);
    return result.rows[0];
};

export const findBySede = async (id_sede) => {
    const result = await db.query(`
        SELECT 
            ss.id_sede_sala,
            ss.id_sede,
            ss.id_sala,
            ss.nombre,
            ss.estado,
            s.nombre AS nombre_sede,
            s.direccion AS direccion_sede,
            sa.nombre AS nombre_sala,
            sa.cantidad_asientos,
            sa.tipo_sala
        FROM sede_salas ss
        JOIN sedes s ON ss.id_sede = s.id_sede
        JOIN salas sa ON ss.id_sala = sa.id_sala
        WHERE ss.id_sede = $1
        ORDER BY sa.nombre
    `, [id_sede]);
    return result.rows;
};

export const findBySala = async (id_sala) => {
    const result = await db.query(`
        SELECT 
            ss.id_sede_sala,
            ss.id_sede,
            ss.id_sala,
            ss.nombre,
            ss.estado,
            s.nombre AS nombre_sede,
            s.direccion AS direccion_sede,
            sa.nombre AS nombre_sala,
            sa.cantidad_asientos,
            sa.tipo_sala
        FROM sede_salas ss
        JOIN sedes s ON ss.id_sede = s.id_sede
        JOIN salas sa ON ss.id_sala = sa.id_sala
        WHERE ss.id_sala = $1
        ORDER BY s.nombre
    `, [id_sala]);
    return result.rows;
};

export const insert = async ({ id_sede, id_sala, nombre, estado = 'Disponible' }) => {
    const result = await db.query(
        `INSERT INTO sede_salas (id_sede, id_sala, nombre, estado) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [id_sede, id_sala, nombre, estado]
    );
    return result.rows[0];
};

export const insertMultiple = async (sedes_salas) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        const insertedRows = [];
        for (const item of sedes_salas) {
            const { id_sede, id_sala, nombre, estado = 'Disponible' } = item;
            const result = await client.query(
                `INSERT INTO sede_salas (id_sede, id_sala, nombre, estado) 
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [id_sede, id_sala, nombre, estado]
            );
            insertedRows.push(result.rows[0]);
        }
        
        await client.query('COMMIT');
        return insertedRows;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const update = async (id, { id_sede, id_sala, nombre, estado }) => {
    const result = await db.query(
        `UPDATE sede_salas SET 
            id_sede = $1, id_sala = $2, nombre = $3, estado = $4
         WHERE id_sede_sala = $5 RETURNING *`,
        [id_sede, id_sala, nombre, estado, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    await db.query('DELETE FROM sede_salas WHERE id_sede_sala = $1', [id]);
};

export const removeMultiple = async (ids) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        for (const id of ids) {
            await client.query('DELETE FROM sede_salas WHERE id_sede_sala = $1', [id]);
        }
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const checkExistingAssignment = async (id_sede, id_sala) => {
    const result = await db.query(
        'SELECT * FROM sede_salas WHERE id_sede = $1 AND id_sala = $2',
        [id_sede, id_sala]
    );
    return result.rows[0];
};

export const getSalasDisponibles = async (id_sede) => {
    const result = await db.query(`
        SELECT sa.* 
        FROM salas sa
        WHERE sa.id_sala NOT IN (
            SELECT ss.id_sala 
            FROM sede_salas ss 
            WHERE ss.id_sede = $1
        )
        ORDER BY sa.nombre
    `, [id_sede]);
    return result.rows;
};

export const getSedesDisponibles = async (id_sala) => {
    const result = await db.query(`
        SELECT s.* 
        FROM sedes s
        WHERE s.id_sede NOT IN (
            SELECT ss.id_sede 
            FROM sede_salas ss 
            WHERE ss.id_sala = $1
        )
        ORDER BY s.nombre
    `, [id_sala]);
    return result.rows;
};
