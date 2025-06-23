import {pool} from '../db.js';

export const getGeneros = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM generos');
    res.json(rows);
};

export const getGeneroById = async (req, res) => {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM generos WHERE id = $1', [id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: "Genero not found" });
    }
    res.json(rows);
};

export const createGenero = async (req, res) => {
    const data = req.body;
    await pool.query('INSERT INTO generos (nombre) VALUES ($1)', [data.nombre]);
    res.send("Genero created successfully!");
};

export const deleteGenero = async (req, res) => {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM generos WHERE id = $1', [id]);

    if (rowCount === 0) {
        return res.status(404).json({ message: "Genero not found" });
    }

    res.send(`Genero with ID ${id} deleted successfully!`);
};

export const updateGenero = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const { rowCount } = await pool.query('UPDATE generos SET nombre = $1 WHERE id = $2', [data.nombre, id]);

    if (rowCount === 0) {
        return res.status(404).json({ message: "Genero not found" });
    }

    res.send(`Genero with ID ${id} updated successfully!`);
};