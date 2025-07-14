import admin from '../config/firebase.js';

export const asignarRolAdmin = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { 
      role: 'admin', 
      isAdmin: true,
      isEmployee: false 
    });
    return { success: true, message: 'Rol admin asignado correctamente' };
  } catch (error) {
    console.error('Error al asignar rol admin:', error);
    throw new Error('Error al asignar rol de administrador');
  }
};

export const removerRolAdmin = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { 
      role: 'user', 
      isAdmin: false,
      isEmployee: false 
    });
    return { success: true, message: 'Rol admin removido correctamente' };
  } catch (error) {
    console.error('Error al remover rol admin:', error);
    throw new Error('Error al remover rol de administrador');
  }
};

export const asignarRolEmpleado = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { 
      role: 'employee', 
      isEmployee: true,
      isAdmin: false 
    });
    return { success: true, message: 'Rol empleado asignado correctamente' };
  } catch (error) {
    console.error('Error al asignar rol empleado:', error);
    throw new Error('Error al asignar rol de empleado');
  }
};

export const removerRolEmpleado = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { 
      role: 'user', 
      isEmployee: false,
      isAdmin: false 
    });
    return { success: true, message: 'Rol empleado removido correctamente' };
  } catch (error) {
    console.error('Error al remover rol empleado:', error);
    throw new Error('Error al remover rol de empleado');
  }
};

export const obtenerUsuarioConClaims = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      customClaims: userRecord.customClaims || {},
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime
    };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw new Error('Usuario no encontrado');
  }
};

export const revocarTokensUsuario = async (uid) => {
  try {
    await admin.auth().revokeRefreshTokens(uid);
    return { success: true, message: 'Tokens revocados correctamente' };
  } catch (error) {
    console.error('Error al revocar tokens:', error);
    throw new Error('Error al revocar tokens del usuario');
  }
};

export const cambiarEstadoUsuario = async (uid, disabled) => {
  try {
    await admin.auth().updateUser(uid, { disabled });
    return { 
      success: true, 
      message: `Usuario ${disabled ? 'deshabilitado' : 'habilitado'} correctamente` 
    };
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    throw new Error('Error al cambiar estado del usuario');
  }
};

export const crearCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('Error al crear custom token:', error);
    throw new Error('Error al generar token personalizado');
  }
};