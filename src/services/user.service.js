
import admin from '../config/firebase.js'

export const asignarRolAdmin = async (uid) => {
  await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
};
