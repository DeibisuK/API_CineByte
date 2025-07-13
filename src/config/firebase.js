import admin from 'firebase-admin';

const base64 = process.env.FIREBASE_CREDENTIALS_BASE64;

if (!base64) {
  throw new Error('FIREBASE_CREDENTIALS_BASE64 no está definida');
}

const jsonString = Buffer.from(base64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(jsonString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
