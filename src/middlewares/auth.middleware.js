import admin from 'firebase-admin';

export async function verificarTokenAdmin(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Verificar custom claims en lugar de una propiedad del token
    if (!decoded.isAdmin || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    
    // Agregar información del usuario al request para uso posterior
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      customClaims: {
        isAdmin: decoded.isAdmin,
        isEmployee: decoded.isEmployee
      }
    };
    
    next();
  } catch (err) {
    console.error('Token inválido', err);
    res.status(401).json({ error: 'Token inválido' });
  }
}

export async function verificarTokenEmployee(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Verificar si es empleado o admin
    if (!decoded.isEmployee && !decoded.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de empleado o administrador.' });
    }
    
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      customClaims: {
        isAdmin: decoded.isAdmin,
        isEmployee: decoded.isEmployee
      }
    };
    
    next();
  } catch (err) {
    console.error('Token inválido', err);
    res.status(401).json({ error: 'Token inválido' });
  }
}

export async function verificarTokenBasico(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'user',
      customClaims: {
        isAdmin: decoded.isAdmin || false,
        isEmployee: decoded.isEmployee || false
      }
    };
    
    next();
  } catch (err) {
    console.error('Token inválido', err);
    res.status(401).json({ error: 'Token inválido' });
  }
}
