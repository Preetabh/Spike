import axios from "axios";

/**
 * Sends a push notification to a device token using Firebase Cloud Messaging (FCM).
 */
export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return;

  try {
    console.log(`[FCM] Sending push alert to token: ${fcmToken.substring(0, 15)}...`);

    // FCM Legacy API Request
    const response = await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      {
        to: fcmToken,
        notification: {
          title,
          body,
          sound: "default",
          click_action: "FLUTTER_NOTIFICATION_CLICK", // open app trigger
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=AIzaSyC9IGreaTSma8EKzr80HBoTT1UI1UfTMWE`,
        },
      }
    );

    console.log("[FCM] Response:", response.data);
  } catch (error) {
    console.error("[FCM] Error sending message:", error.response?.data || error.message);
  }
};
