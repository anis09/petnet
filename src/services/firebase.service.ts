import admin from "firebase-admin";
import { MessagingDevicesResponse } from "firebase-admin/lib/messaging/messaging-api";
import { getMessaging } from "firebase-admin/messaging";
import firebaseAccountCredentials from "./petnet-mobile-app-firebase-adminsdk-s88e4-1cb4f3dcc5.json";
const serviceAccount = firebaseAccountCredentials as admin.ServiceAccount;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "petnet-mobile-app",
});
class FirebaseService {
  sendNotifcation = async (
    tokenDevice: string,
    title: string,
    desc: string
  ): Promise<MessagingDevicesResponse> => {
    try {
      const message = getMessaging();
      let result = await message.sendToDevice(tokenDevice, {
        notification: {
          title: title,
          body: desc,
        },
      });
      return result;
    } catch (error) {
      console.log("Error", error.message);
    }
  };
}

export default FirebaseService;
