import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Web app's Firebase configuration (ensure this matches your firebase.config.js)
const firebaseConfig = {
  apiKey: "AIzaSyAdp3u_aLi0WDxnZ6f4UyzltOF4nTx8vfY",
  authDomain: "gabby-chat-app.firebaseapp.com",
  projectId: "gabby-chat-app",
  storageBucket: "gabby-chat-app.firebasestorage.app",
  messagingSenderId: "281698213202",
  appId: "1:281698213202:web:33d6948ba98518bb536e8b",
  clientId: "1036419903880-5m0ro850e3bsnikltnarnki63fn8fqr2.apps.googleusercontent.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle Background Messages
onBackgroundMessage(messaging, (payload) => {
  console.log("Received background message: ", payload);

  // Customize the notification
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // You can replace this with your app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
