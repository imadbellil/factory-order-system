import React from 'react';
import { useOrderStatusCounts } from '../hooks/useOrders';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { OrderStatus } from '../types';
import { CheckCircle, XCircle, Package, Truck, Clock, Loader, ClipboardList, List } from 'lucide-react';

interface OrderStatusBarProps {
  activeStatus: OrderStatus | null;
  onStatusClick: (status: OrderStatus | null) => void;
}

const statusOrder: OrderStatus[] = [
  'pending',
  'accepted',
  'en_cours',
  'fini',
  'charge',
];
const rejectedStatus: OrderStatus = 'rejected';

const ICONS: Record<OrderStatus, React.ReactNode> = {
  pending: <ClipboardList size={20} />,
  accepted: <CheckCircle size={20} />,
  en_cours: <Loader size={20} className="animate-spin" />,
  fini: <Package size={20} />,
  charge: <Truck size={20} />,
  rejected: <XCircle size={20} />,
};

export const OrderStatusBar: React.FC<OrderStatusBarProps> = ({ activeStatus, onStatusClick }) => {
  const counts = useOrderStatusCounts();
  const activeIndex = activeStatus ? statusOrder.indexOf(activeStatus) : -1;

  const isStepActive = (index: number) => {
    if (activeStatus === null) return true; // All active when "All" is selected
    if (activeStatus === rejectedStatus) return false;
    return index <= activeIndex;
  }

  return (
    <div className="w-full flex flex-wrap gap-2 justify-center py-4 px-2 items-center">
      {/* All Status - circular icon-only with tooltip */}
      <div className="relative group">
        <button
          onClick={() => onStatusClick(null)}
          className={`flex items-center justify-center h-12 w-12 rounded-full border transition-all duration-200 shadow-sm
            ${activeStatus === null ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' : 'bg-white text-blue-500 border-blue-300 hover:bg-blue-50 hover:scale-105'}
          `}
          aria-label="Tout"
        >
          <List size={22} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
          Tout
        </span>
      </div>

      {/* Status Pills */}
      {statusOrder.map((status) => (
        <button
          key={status}
          onClick={() => onStatusClick(status)}
          className={`flex items-center gap-2 px-4 h-12 rounded-full border transition-all duration-200 shadow-sm
            ${activeStatus === status ? 'bg-green-100 text-green-700 border-green-400 shadow-md scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:scale-105'}
          `}
        >
          {ICONS[status]}
          <span className="hidden sm:inline font-semibold text-sm">{ORDER_STATUS_LABELS[status]}</span>
          <span className="ml-2 text-xs font-bold bg-white/80 rounded-full px-2 py-0.5 text-green-700 border border-green-200">{counts[status] ?? 0}</span>
        </button>
      ))}

      {/* Rejected Status */}
      <button
        onClick={() => onStatusClick(rejectedStatus)}
        className={`flex items-center gap-2 px-4 h-12 rounded-full border transition-all duration-200 shadow-sm
          ${activeStatus === rejectedStatus ? 'bg-red-100 text-red-700 border-red-400 shadow-md scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:scale-105'}
        `}
      >
        {ICONS[rejectedStatus]}
        <span className="hidden sm:inline font-semibold text-sm">{ORDER_STATUS_LABELS[rejectedStatus]}</span>
        <span className="ml-2 text-xs font-bold bg-white/80 rounded-full px-2 py-0.5 text-red-700 border border-red-200">{counts[rejectedStatus] ?? 0}</span>
      </button>
    </div>
  );
}; 