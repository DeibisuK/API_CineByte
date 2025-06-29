import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta al JSON
const serviceAccountPath = path.join(__dirname, '../../cinebyte-f2b52-firebase-adminsdk-fbsvc-c93acb955a.json');

// Leer y parsear el archivo manualmente
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
