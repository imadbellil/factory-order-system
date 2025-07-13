import { useState, useEffect } from 'react';
import { subscribeToOrders, subscribeToPendingOrders, subscribeToAcceptedOrders } from '../services/orders';
import { Order, OrderStatus } from '../types';
import { query, collection, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useOrders = (filters: { createdBy?: string } = {}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    if (filters.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(ordersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [filters.createdBy]);

  return { orders, loading };
};

export const usePendingOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPendingOrders((ordersData) => {
      setOrders(ordersData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { orders, loading };
};

export const useAcceptedOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAcceptedOrders((ordersData) => {
      setOrders(ordersData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { orders, loading };
};

// New hook: Get real-time counts of orders by status
export const useOrderStatusCounts = () => {
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>({
    pending: 0,
    accepted: 0,
    rejected: 0,
    en_cours: 0,
    fini: 0,
    charge: 0,
  });

  useEffect(() => {
    const unsubscribe = subscribeToOrders((orders) => {
      const newCounts = { ...statusCounts };
      // Reset all counts
      Object.keys(newCounts).forEach((k) => (newCounts[k as OrderStatus] = 0));
      // Count each order by status
      orders.forEach((order) => {
        if (order.status in newCounts) {
          newCounts[order.status as OrderStatus]++;
        }
      });
      setStatusCounts({ ...newCounts });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return statusCounts;
};