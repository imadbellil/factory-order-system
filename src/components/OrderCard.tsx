import React, { ReactNode, useEffect, useState } from 'react';
import { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { Clock, Box, Package, Truck, User, Factory, Hash } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface OrderCardProps {
  order: Order;
  children?: ReactNode;
  onDelete?: () => void;
  onClick: () => void;
}

const InfoLine = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-start text-sm text-gray-600">
    <div className="flex-shrink-0 w-5 h-5 mr-2 mt-0.5 text-gray-400">{icon}</div>
    <div className="flex-grow">
      <span className="font-semibold text-gray-800">{label}:</span> {value}
    </div>
  </div>
);

const toDate = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (date.toDate && typeof date.toDate === 'function') {
    return date.toDate();
  }
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
};

function estimationToMs(est?: { days: number; hours: number; minutes: number }): number {
  if (!est) return 0;
  return (
    (est.days || 0) * 24 * 60 * 60 * 1000 +
    (est.hours || 0) * 60 * 60 * 1000 +
    (est.minutes || 0) * 60 * 1000
  );
}

function formatMs(ms: number): string {
  if (ms <= 0) return 'Terminé';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
  return `${minutes}:${seconds.toString().padStart(2,'0')}`;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, children, onClick }) => {
  const createdAtDate = toDate(order.createdAt);
  const updatedAtDate = toDate(order.updatedAt);

  // Timer logic
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (order.status === 'en_cours' && order.productionEstimation && updatedAtDate) {
      const duration = estimationToMs(order.productionEstimation);
      const end = updatedAtDate.getTime() + duration;
      const update = () => setRemaining(end - Date.now());
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    } else {
      setRemaining(null);
    }
  }, [order.status, order.productionEstimation, updatedAtDate]);

  function estimationToString(est?: { days: number; hours: number; minutes: number }): string {
    if (!est) return '';
    const parts = [];
    if (est.days) parts.push(`${est.days}j`);
    if (est.hours) parts.push(`${est.hours}h`);
    if (est.minutes) parts.push(`${est.minutes}min`);
    return parts.join(' ') || '0min';
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden cursor-pointer hover:border-blue-400 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-blue-600 flex items-center gap-2">
              <Hash size={16} /> N° {order.orderNumber || 'N/A'}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
              <Clock size={12} />
              {createdAtDate ? format(createdAtDate, "d MMM yyyy 'à' HH:mm") : '...'}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-grow space-y-4">
        {/* Timer for en_cours */}
        {order.status === 'en_cours' && order.productionEstimation && (
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
            <Clock size={18} />
            <span>{formatMs(remaining ?? 0)}</span>
            <span className="text-xs text-gray-500">/ {estimationToString(order.productionEstimation)}</span>
          </div>
        )}
        <InfoLine icon={<User size={16}/>} label="Client" value={order.client || 'N/A'} />
        <InfoLine icon={<Factory size={16}/>} label="Machine" value={order.machineName || 'N/A'} />

        <div className="border-t border-gray-200 pt-4">
          <p className="font-semibold text-gray-800 mb-2">Détails</p>
          <div className="space-y-3">
            <InfoLine icon={<Package size={16}/>} label="Produit Initial" value={`${order.initialProduct || 'N/A'} (${order.initialQuantity || 0})`} />
            <InfoLine icon={<Box size={16}/>} label="Produit Final" value={`${order.finalProduct || '-'} (${order.finalQuantity || 0})`} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {children && (
        <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};