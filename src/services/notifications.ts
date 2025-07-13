import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app } from './firebase';

const messaging: Messaging = getMessaging(app);

interface CreateNotificationInput {
  type: 'created' | 'accepted' | 'status';
  orderId: string;
  status: string;
  message: string;
  icon?: string;
}

export const createNotification = async ({ type, orderId, status, message, icon }: CreateNotificationInput) => {
  await addDoc(collection(db, 'notifications'), {
    type,
    orderId,
    status,
    message,
    icon: icon || null,
    timestamp: serverTimestamp(),
    readBy: [],
  });
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidKey = 'BBuvuV1woUeO1_qBaBOBoDVbXmjpTvaTJbznt8KJ9LmjXhdYc_gwutIM98Hq3ocya5iwN3sW7jZFOCXDusZSWkU';
      const token = await getToken(messaging, { vapidKey });
      // TODO: Save this token to Firestore under the user profile
      return token;
    }
  } catch (err) {
    console.error('Unable to get permission to notify.', err);
  }
  return null;
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  return onMessage(messaging, callback);
}; 