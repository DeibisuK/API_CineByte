import { Router } from "express";
import { createEtiqueta, deleteEtiqueta, getEtiquetaById, getEtiquetas, updateEtiqueta } from "../controllers/etiquetas.controllers.js";

const router = Router();

router.get("/etiquetas", getEtiquetas);

router.get("/etiquetas/:id", getEtiquetaById);

router.post("/etiquetas", createEtiqueta);

router.delete("/etiquetas/:id", deleteEtiqueta);

router.put("/etiquetas/:id", updateEtiqueta);

export default router;