import admin from '../config/firebase.js'

export const asignarRolAdmin = async (uid) => {
  await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
};
export const removerRolAdmin = async (uid) => {
  // Aquí quitas la propiedad "role" o la pones en otro valor, por ejemplo 'cliente'
  
  // Opcional: si quieres remover todos los claims, usa {}
  // Si solo quieres cambiar el rol a 'cliente':
  //await admin.auth().setCustomUserClaims(uid, { role: 'cliente' });

  // Si quieres eliminar el claim role completamente:
  await admin.auth().setCustomUserClaims(uid, {});
};

// Nuevas funciones para el rol empleado
export const asignarRolEmpleado = async (uid) => {
  await admin.auth().setCustomUserClaims(uid, { role: 'empleado' });
};

export const removerRolEmpleado = async (uid) => {
  // Remover el rol empleado (volver a usuario normal)
  await admin.auth().setCustomUserClaims(uid, {});
};