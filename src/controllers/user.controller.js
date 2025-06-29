import * as userService from '../services/user.service.js';

export const asignarAdmin = async (req, res) => {
  try {
    const { uid } = req.body;
    await userService.asignarRolAdmin(uid);
    res.json({ message: 'Rol admin asignado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
