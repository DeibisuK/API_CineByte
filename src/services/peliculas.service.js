import * as model from '../models/pelicula.model.js';

export const getAllPeliculas = async () => {
  return await model.findAll();
};

export const getAllPeliculasCompletas = async () => {
  // Usar método alternativo que no depende de funciones almacenadas
  return await model.findAllCompleteAlternative();
};

export const getPeliculaById = async (id) => {
  return await model.findById(id);
};

export const getPeliculaByIdComplete = async (id) => {
  // Usar método alternativo que no depende de funciones almacenadas
  return await model.findByIdCompleteAlternative(id);
};

export const createPelicula = async (data) => {
  return await model.insert(data);
};

export const updatePelicula = async (id, data) => {
  return await model.update(id, data);
};

export const deletePelicula = async (id) => {
  return await model.remove(id);
};

export const getAllActoresByPeliculaId = async (id) => {
  return await model.findAllActores(id);
};

export const getAllGenerosByPeliculaId = async (id) => {
  return await model.findAllGeneros(id);
};

export const getAllEtiquetasByPeliculaId = async (id) => {
  return await model.findAllEtiquetas(id);
};

export const getAllIdiomasByPeliculaId = async (id) => {
  return await model.findAllIdiomas(id);
};

export const getAnioFromPeliculas = async () => {
  return await model.getAnioFromPeliculas();
}

export const getPeliculasMasVendidas = async () => {
  return await model.getPeliculasMasVendidas();
}