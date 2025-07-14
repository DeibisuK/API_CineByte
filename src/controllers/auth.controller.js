import { AuthService } from '../services/auth.service.js';
import admin from 'firebase-admin';

export class AuthController {
  /**
   * Asignar role de administrador a un usuario
   */
  static async makeAdmin(req, res) {
    try {
      const { uid } = req.params;
      const result = await AuthService.makeAdmin(uid);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Asignar role de empleado a un usuario
   */
  static async makeEmployee(req, res) {
    try {
      const { uid } = req.params;
      const result = await AuthService.makeEmployee(uid);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Remover roles personalizados de un usuario
   */
  static async removeRoles(req, res) {
    try {
      const { uid } = req.params;
      const result = await AuthService.removeCustomClaims(uid);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener información de un usuario incluyendo sus roles
   */
  static async getUserInfo(req, res) {
    try {
      const { uid } = req.params;
      const userInfo = await AuthService.getUserWithClaims(uid);
      res.status(200).json(userInfo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Listar todos los usuarios con sus roles
   */
  static async listUsers(req, res) {
    try {
      const { maxResults = 1000, pageToken } = req.query;
      
      const listUsersResult = await admin.auth().listUsers(parseInt(maxResults), pageToken);
      
      const users = listUsersResult.users.map(user => ({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        customClaims: user.customClaims || {},
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      }));

      res.status(200).json({
        users,
        pageToken: listUsersResult.pageToken,
        totalUsers: users.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Revocar tokens de un usuario (forzar re-login)
   */
  static async revokeTokens(req, res) {
    try {
      const { uid } = req.params;
      const result = await AuthService.revokeRefreshTokens(uid);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Generar un custom token para un usuario
   */
  static async generateCustomToken(req, res) {
    try {
      const { uid } = req.params;
      const { additionalClaims } = req.body;
      
      const customToken = await AuthService.createCustomToken(uid, additionalClaims);
      res.status(200).json({ customToken });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Deshabilitar/habilitar un usuario
   */
  static async toggleUserStatus(req, res) {
    try {
      const { uid } = req.params;
      const { disabled } = req.body;
      
      await admin.auth().updateUser(uid, { disabled });
      
      res.status(200).json({ 
        success: true, 
        message: `Usuario ${disabled ? 'deshabilitado' : 'habilitado'} correctamente` 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Eliminar un usuario completamente
   */
  static async deleteUser(req, res) {
    try {
      const { uid } = req.params;
      
      await admin.auth().deleteUser(uid);
      
      res.status(200).json({ 
        success: true, 
        message: 'Usuario eliminado correctamente' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener información del usuario autenticado actual
   */
  static async getCurrentUser(req, res) {
    try {
      // req.user se establece en el middleware de autenticación
      const userInfo = await AuthService.getUserWithClaims(req.user.uid);
      res.status(200).json(userInfo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
