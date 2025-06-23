import { Router } from "express";
import { createGenero, deleteGenero, getGeneroById, getGeneros, updateGenero } from "../controllers/generos.controllers.js";

 const router = Router();

router.get("/generos", getGeneros);

router.get("/generos/:id", getGeneroById);

router.post("/generos", createGenero);

router.delete("/generos/:id", deleteGenero);

router.put("/generos/:id", updateGenero);

 export default router;