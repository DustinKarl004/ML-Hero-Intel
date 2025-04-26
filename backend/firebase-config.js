const admin = require('firebase-admin');
require('dotenv').config();

// This is a placeholder. In production, use environment variables or a secure method to store credentials
const serviceAccount = {
  // This should be replaced with your actual Firebase service account key
  // For development, you can download this from Firebase Console > Project Settings > Service Accounts
  // For production, use environment variables or secrets management
  type: process.env.FIREBASE_TYPE || "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "your-private-key-id",
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : "your-private-key",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "your-client-email",
  client_id: process.env.FIREBASE_CLIENT_ID || "your-client-id",
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "your-cert-url"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
  });
}

const db = admin.firestore();

module.exports = { admin, db }; 