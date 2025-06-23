import { pool } from '../db.js';

export const getEtiquetas = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM etiquetas');
    res.json(rows);
};

export const getEtiquetaById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM etiquetas WHERE id = $1', [id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: "Etiqueta not found" });
    }
    res.json(rows);
};

export const createEtiqueta = async (req, res) => {
    const data = req.body;
    await pool.query('INSERT INTO etiquetas (nombre) VALUES ($1)', [data.nombre]);
    res.send("Etiqueta created successfully!");
};

export const deleteEtiqueta = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM etiquetas WHERE id = $1', [id]);

    if (rowCount === 0) {
        return res.status(404).json({ message: "Etiqueta not found" });
    }

    res.send(`Etiqueta with ID ${id} deleted successfully!`);
};

export const updateEtiqueta = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const { rowCount } = await pool.query('UPDATE etiquetas SET nombre = $1 WHERE id = $2', [data.nombre, id]);

    if (rowCount === 0) {
        return res.status(404).json({ message: "Etiqueta not found" });
    }

    res.send(`Etiqueta with ID ${id} updated successfully!`);
};