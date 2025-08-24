import admin from "firebase-admin";
import serviceAccount from "./serviceAccount.js";

// process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
// const adminEmails = JSON.parse(process.env.ADMIN_EMAILS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();
// db.settings({
//   host: "127.0.0.1:8080",
//   ssl: false,
// });


export {auth, db}