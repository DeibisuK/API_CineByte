import  admin  from '../config/firebase.js';

/**
 * Validar si el token del usuario es válido
 */
export const validarToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token, true); // checkRevoked = true
    
    // Si llegamos aquí, el token es válido
    res.status(200).json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      customClaims: decodedToken
    });

  } catch (error) {
    console.error('Error validando token:', error);
    
    // Determinar el tipo de error
    let errorMessage = 'Token inválido';
    let errorCode = 'INVALID_TOKEN';

    if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'Token revocado';
      errorCode = 'TOKEN_REVOKED';
    } else if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expirado';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Usuario deshabilitado';
      errorCode = 'USER_DISABLED';
    }

    res.status(401).json({
      valid: false,
      error: errorMessage,
      code: errorCode
    });
  }
};

/**
 * Endpoint para que el frontend verifique periódicamente el estado del token
 */
export const verificarEstadoSesion = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        sessionValid: false,
        reason: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token con checkRevoked habilitado
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    
    // Obtener información adicional del usuario
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    
    res.status(200).json({
      sessionValid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      disabled: userRecord.disabled,
      customClaims: userRecord.customClaims || {},
      lastRefresh: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error verificando estado de sesión:', error);
    
    let reason = 'Token invalid';
    
    if (error.code === 'auth/id-token-revoked') {
      reason = 'Token revoked by admin';
    } else if (error.code === 'auth/user-disabled') {
      reason = 'User account disabled';
    } else if (error.code === 'auth/id-token-expired') {
      reason = 'Token expired';
    }

    res.status(401).json({
      sessionValid: false,
      reason: reason,
      code: error.code
    });
  }
};
