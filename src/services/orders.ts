import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { CreateOrderData, Order, OrderStatus } from '../types';
import { createNotification } from './notifications';

export const ordersCollection = collection(db, 'orders');

const getNextOrderNumber = async (): Promise<number> => {
  const counterRef = doc(db, 'counters', 'orders');
  
  try {
    const newOrderNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const currentNumber = counterDoc.exists() ? counterDoc.data().current : 0;
      const nextNumber = currentNumber + 1;
      
      transaction.set(counterRef, { current: nextNumber }, { merge: true });
      
      return nextNumber;
    });
    return newOrderNumber;
  } catch (error) {
    console.error("Error in getNextOrderNumber transaction:", error);
    throw new Error("Failed to generate order number.");
  }
}

export const createOrder = async (orderData: CreateOrderData, userId: string, userEmail?: string): Promise<void> => {
  try {
    const nextOrderNumber = await getNextOrderNumber();
    const orderNumber = `CMD-${String(nextOrderNumber).padStart(4, '0')}`;
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      orderNumber,
      status: 'pending',
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await createNotification({
      type: 'created',
      orderId: docRef.id,
      status: 'pending',
      message: `Nouvelle commande ${orderNumber} créée par ${userEmail || 'un utilisateur'}`,
      icon: 'plus',
    });
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  filters?: { status?: OrderStatus; createdBy?: string }
) => {
  let q = query(ordersCollection, orderBy('updatedAt', 'desc'));

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.createdBy) {
    q = query(q, where('createdBy', '==', filters.createdBy));
  }

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
    } as Order));
    callback(orders);
  });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus, rejectionReason?: string, userId?: string, userEmail?: string): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    await updateDoc(doc(db, 'orders', orderId), updateData);
    await createNotification({
      type: status === 'accepted' ? 'accepted' : 'status',
      orderId,
      status,
      message: status === 'accepted'
        ? `Commande acceptée par ${userEmail || 'un utilisateur'}`
        : `Statut de la commande modifié: ${status}`,
      icon: status === 'accepted' ? 'check' : 'refresh',
    });
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};

export const subscribeToPendingOrders = (callback: (orders: Order[]) => void) => {
  return subscribeToOrders(callback, { status: 'pending' });
};

export const subscribeToAcceptedOrders = (callback: (orders: Order[]) => void) => {
  const q = query(
    collection(db, 'orders'), 
    where('status', 'in', ['accepted', 'en_cours', 'fini', 'charge', 'rejected']),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
    } as Order));
    callback(orders);
  });
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    console.error('Delete order error:', error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, updatedData: Partial<Order>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      ...updatedData,
      status: 'pending',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Update order error:', error);
    throw error;
  }
};