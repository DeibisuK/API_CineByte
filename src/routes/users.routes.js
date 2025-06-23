 import { Router } from "express";
 import {pool} from '../db.js'

 const router = Router();

router.get("/users", async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
});

router.get("/users/:id", (req, res) => {
    const { id } = req.params;
    res.send(`User with ID ${id} is working!`);
});

router.post("/users", (req, res) => {
    res.send("User created successfully!");
});

router.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    res.send(`User with ID ${id} deleted successfully!`);
});

router.put("/users/:id", (req, res) => {
    const { id } = req.params;
    res.send(`User with ID ${id} updated successfully!`);
});

 export default router;