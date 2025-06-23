import { Router } from "express";
import { createPelicula, deletePelicula, getPeliculaById, getPeliculas, updatePelicula } from "../controllers/peliculas.controllers.js";

 const router = Router();

router.get("/peliculas", getPeliculas);

router.get("/peliculas/:id", getPeliculaById);

router.post("/peliculas", createPelicula);

router.delete("/peliculas/:id", deletePelicula);

router.put("/peliculas/:id", updatePelicula);

 export default router;