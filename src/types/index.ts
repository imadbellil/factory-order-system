import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  role: 'rouiba' | 'meftah' | 'hangar';
  displayName?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'en_cours' | 'fini' | 'charge';

export interface ProductionEstimation {
  days: number;
  hours: number;
  minutes: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  client: string;
  initialProduct: string;
  initialQuantity: number;
  finalProduct?: string;
  finalQuantity?: number;
  submitter: string;
  productType: string;
  quantity: number;
  machineName: string;
  status: OrderStatus;
  createdBy: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  rejectionReason?: string;
  history: { status: string; date: Timestamp | Date; userId: string; }[];
  comment?: string;
  productionEstimation?: ProductionEstimation;
}

export interface CreateOrderData {
  client: string;
  initialProduct: string;
  initialQuantity: number;
  finalProduct?: string;
  finalQuantity?: number;
  submitter: string;
  productType: string;
  quantity: number;
  machineName: string;
  comment?: string;
}

export interface Notification {
  id: string;
  type: 'created' | 'accepted' | 'status';
  orderId: string;
  status: string;
  message: string;
  timestamp: any;
  readBy: string[];
  icon?: string;
}