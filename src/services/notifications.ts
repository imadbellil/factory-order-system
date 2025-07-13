import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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