import admin from 'firebase-admin';

export async function verificarTokenAdmin(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  } catch (err) {
    console.error('Token inválido', err);
    res.status(401).json({ error: 'Token inválido' });
  }
}
