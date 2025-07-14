import admin from 'firebase-admin';

export class AuthService {
  /**
   * Asignar role personalizado a un usuario
   */
  static async setCustomClaims(uid, claims) {
    try {
      await admin.auth().setCustomUserClaims(uid, claims);
      return { success: true, message: 'Claims actualizados correctamente' };
    } catch (error) {
      console.error('Error al establecer custom claims:', error);
      throw new Error('Error al actualizar permisos del usuario');
    }
  }

  /**
   * Hacer un usuario administrador
   */
  static async makeAdmin(uid) {
    return await this.setCustomClaims(uid, { role: 'admin', isAdmin: true });
  }

  /**
   * Hacer un usuario empleado
   */
  static async makeEmployee(uid) {
    return await this.setCustomClaims(uid, { role: 'employee', isEmployee: true });
  }

  /**
   * Remover todos los roles personalizados
   */
  static async removeCustomClaims(uid) {
    return await this.setCustomClaims(uid, null);
  }

  /**
   * Obtener información del usuario incluyendo custom claims
   */
  static async getUserWithClaims(uid) {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        customClaims: userRecord.customClaims || {},
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled
      };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw new Error('Usuario no encontrado');
    }
  }

  /**
   * Generar un custom token (útil para autenticación desde el servidor)
   */
  static async createCustomToken(uid, additionalClaims = {}) {
    try {
      const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      console.error('Error al crear custom token:', error);
      throw new Error('Error al generar token personalizado');
    }
  }

  /**
   * Revocar tokens de un usuario (forzar re-autenticación)
   */
  static async revokeRefreshTokens(uid) {
    try {
      await admin.auth().revokeRefreshTokens(uid);
      return { success: true, message: 'Tokens revocados correctamente' };
    } catch (error) {
      console.error('Error al revocar tokens:', error);
      throw new Error('Error al revocar tokens del usuario');
    }
  }

  /**
   * Verificar si un token fue emitido después de la revocación
   */
  static async verifyTokenWithRevocation(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken, true);
      return decodedToken;
    } catch (error) {
      if (error.code === 'auth/id-token-revoked') {
        throw new Error('Token revocado. Re-autenticación requerida.');
      }
      throw error;
    }
  }
}
