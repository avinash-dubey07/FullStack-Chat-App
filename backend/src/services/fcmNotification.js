import admin from "../firebaseAdmin.js";

export const sendFcmNotification = async (token, title, body) => {
  try {
    if (!token) {
      console.error("FCM token is required");
      return;
    }

    const message = {
      notification: {
        title: title || "New Notification",     // Customizable title
        body: body || "You have a new message", // Customizable message
      },
      token: token,
    };

    await admin.messaging().send(message);
    console.log("FCM notification sent successfully!");
  } catch (error) {
    console.error("Error sending FCM notification:", error);
  }
};
