import * as userService from '../services/user.service.js';
import admin from '../config/firebase.js';

export const crearUsuarioAdmin = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // 1. Crear usuario
    const user = await admin.auth().createUser({
      email,
      password,
      displayName
    });

    // 2. Asignar custom claim admin
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });

    res.status(201).json({
      message: 'Usuario admin creado correctamente',
      uid: user.uid,
      email: user.email
    });
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
    res.status(500).json({ error: 'No se pudo crear el usuario admin' });
  }
};

export const asignarAdmin = async (req, res) => {
  try {
    const { uid } = req.body;
    await userService.asignarRolAdmin(uid);
    res.json({ message: 'Rol admin asignado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export async function listarUsuarios(req, res) {
  try {
    const search = req.query.search?.toLowerCase() || ''; // texto de búsqueda, opcional
    const usuarios = [];
    let nextPageToken;

    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      usuarios.push(...result.users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    // Devolver solo lo que necesitas (opcional)
    let resultado = usuarios.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      customClaims: user.customClaims || {},
    }));

    if (search) {
      resultado = resultado.filter(u =>
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.displayName && u.displayName.toLowerCase().includes(search))
      );
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'No se pudo listar los usuarios' });
  }
}

export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await admin.auth().deleteUser(id);

    res.json({ message: `Usuario ${id} eliminado correctamente` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
};

export const removerAdmin = async (req, res) => {
  try {
    const { uid } = req.body;
    await userService.removerRolAdmin(uid); // método en tu servicio que quite o actualice el rol
    res.json({ message: 'Rol admin removido correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Nuevas funciones para el rol empleado
export const asignarEmpleado = async (req, res) => {
  try {
    const { uid } = req.body;
    await userService.asignarRolEmpleado(uid);
    res.json({ message: 'Rol empleado asignado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removerEmpleado = async (req, res) => {
  try {
    const { uid } = req.body;
    await userService.removerRolEmpleado(uid);
    res.json({ message: 'Rol empleado removido correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editarUsuario = async (req, res) => {
  const { uid } = req.params;
  const { username, email, password } = req.body;

  const dataToUpdate = {};

  if (username) dataToUpdate.displayName = username;
  if (email) dataToUpdate.email = email;
  if (password) dataToUpdate.password = password;

  try {
    await admin.auth().updateUser(uid, dataToUpdate);
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar usuario:', error);
    res.status(500).json({ error: error.message });
  }
};