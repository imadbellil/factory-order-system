import { OrderStatus } from '../types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  en_cours: 'En cours de production',
  fini: 'Fini',
  charge: 'Marchandise chargée',
  rejected: 'Rejetée',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  en_cours: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  fini: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  charge: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const MEFTEH_STATUS_ORDER: OrderStatus[] = [
  'pending',
  'accepted',
  'en_cours',
  'fini',
  'charge',
  'rejected'
];

export const HANGAR_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'accepted',
  'en_cours',
  'fini',
  'charge',
];

export const ROLE_LABELS = {
  rouiba: 'Rouiba',
  meftah: 'Meftah',
  hangar: 'Hangar'
};

// Dropdown options for submitter and machine
export const SUBMITTER_OPTIONS = [
  'Mohamed',
  'Nasro',
  'Islam',
  'Akram',
  'Oussama'
];

export const MACHINE_OPTIONS = [
  'Laser',
  'CNC',
  'Plasma',
  'autre'
];