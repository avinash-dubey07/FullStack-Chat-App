import admin from "firebase-admin";

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_CREDENTIALS, "base64").toString());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
