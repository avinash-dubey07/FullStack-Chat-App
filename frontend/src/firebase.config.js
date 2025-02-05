import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdp3u_aLi0WDxnZ6f4UyzltOF4nTx8vfY",
  authDomain: "gabby-chat-app.firebaseapp.com",
  projectId: "gabby-chat-app",
  storageBucket: "gabby-chat-app.firebasestorage.app",
  messagingSenderId: "281698213202",
  appId: "1:281698213202:web:33d6948ba98518bb536e8b",
  clientId:
    "1036419903880-5m0ro850e3bsnikltnarnki63fn8fqr2.apps.googleusercontent.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const messaging = getMessaging(app);

// Register Firebase Messaging Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

// device -> Token
// Romit -> Token | Avinash -> Token
// FE -> Token -> Backend -> User -> Romit -> Update -> fcmToken
// B.E -> Romit find -> TOKEN -> ADMIN SDK -> Notification

// Function to enable push notifications
const EnablePushNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");

      // Retrieve FCM token
      const fcmToken = await getToken(messaging, {
        vapidKey: "BPKqdfIMNM8ZjRZaCN52L2Z0ILYG9adAhPpGYb8ySyAjbqG27I-90xlUDFIWTTGabOD9f7yPzE70eDEYrISXbBM", // Replace with your actual Firebase Cloud Messaging VAPID Key
      });

      if (fcmToken) {
        console.log("FCM Token:", fcmToken);

        // Get logged-in user's ID from Firebase Auth
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          saveFcmTokenInDB(userId, fcmToken); // Store token in your DB
        }
      } else {
        console.log("No registration token available.");
      }
    } else {
      console.warn("Notification permission denied.");
    }
  } catch (error) {
    console.error("Error enabling push notifications:", error);
  }
};

// Request FCM Token
const requestForToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BPKqdfIMNM8ZjRZaCN52L2Z0ILYG9adAhPpGYb8ySyAjbqG27I-90xlUDFIWTTGabOD9f7yPzE70eDEYrISXbBM", //Get this from Firebase Console -> Cloud Messaging
    });
    if (token) {
      console.log("FCM Token:", token);
      saveFcmTokenInDB(token);
      return token;
    } else {
      console.warn("No registration token available.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
  }
};

// Listen for Incoming Messages
const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      resolve(payload);
    });
  });

// Saving FCM token in DB
const saveFcmTokenInDB = async (userId, fcmToken) => {
  try {
    const authToken = await auth.currentUser.getIdToken(); // Get Firebase auth token

    const response = await fetch(
      "http://your-backend-url/user/update-fcm-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // Send Firebase authentication token
        },
        body: JSON.stringify({ userId, token: fcmToken }),
      }
    );

    const data = await response.json();
    console.log("FCM Token stored:", data);
  } catch (error) {
    console.error("Error saving FCM token:", error);
  }
};

export {
  auth,
  provider,
  messaging,
  EnablePushNotifications,
  requestForToken,
  onMessageListener,
};
