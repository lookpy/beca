import { initializeApp  } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

const serviceAccount = require("./spy-fake-firebase-adminsdk-85jji-49aafe4a9e.json")

export const firebaseApp = initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseMessaging = getMessaging(firebaseApp);
