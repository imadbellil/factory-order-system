import React from 'react';
import { Order } from '../types';
import { format } from 'date-fns';
import { X, Calendar, User, Factory, Hash, Package, Box, Info, CheckCircle, Tag, Truck } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ORDER_STATUS_LABELS } from '../utils/constants';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

const DetailRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
      {icon}
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{children}</dd>
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

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const createdAtDate = toDate(order.createdAt);
  const updatedAtDate = toDate(order.updatedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b rounded-t-2xl bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Hash size={20} className="text-blue-600"/>
              Détails de la Commande N° {order.orderNumber || 'N/A'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Informations complètes sur la demande de production.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 ml-auto bg-transparent rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <dl className="divide-y divide-gray-200">
            <DetailRow icon={<Info size={16}/>} label="Statut Actuel">
              <StatusBadge status={order.status} />
            </DetailRow>
            <DetailRow icon={<User size={16}/>} label="Client">
              {order.client}
            </DetailRow>
            <DetailRow icon={<Factory size={16}/>} label="Machine">
              {order.machineName}
            </DetailRow>
            <DetailRow icon={<Tag size={16}/>} label="Soumissionnaire">
              {order.submitter}
            </DetailRow>
            <DetailRow icon={<Calendar size={16}/>} label="Date de création">
              {createdAtDate ? format(createdAtDate, "eeee d MMMM yyyy 'à' HH:mm") : 'N/A'}
            </DetailRow>
            <DetailRow icon={<Calendar size={16}/>} label="Dernière modification">
              {updatedAtDate ? format(updatedAtDate, "eeee d MMMM yyyy 'à' HH:mm") : 'N/A'}
            </DetailRow>
          </dl>

          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
             <h4 className="text-md font-semibold text-blue-800 mb-3">Produits</h4>
             <dl className="divide-y divide-blue-100">
                <DetailRow icon={<Package size={16}/>} label="Produit Initial">
                  <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-md">{order.initialProduct}</span>
                </DetailRow>
                 <DetailRow icon={<CheckCircle size={16}/>} label="Quantité Initiale">
                   {order.initialQuantity} unités
                </DetailRow>
                <DetailRow icon={<Box size={16}/>} label="Produit Final">
                  {order.finalProduct ? <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded-md">{order.finalProduct}</span> : <span className="text-gray-500">N/A</span>}
                </DetailRow>
                <DetailRow icon={<Truck size={16}/>} label="Quantité Finale">
                  {order.finalQuantity ? `${order.finalQuantity} unités` : <span className="text-gray-500">N/A</span>}
                </DetailRow>
             </dl>
          </div>
          
          {order.rejectionReason && (
             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-red-800 mb-2">Motif de Rejet</h4>
                <p className="text-sm text-red-700">{order.rejectionReason}</p>
             </div>
          )}

          {/* Optional Comment */}
          {order.comment && (
            <div className="bg-muted border border-muted-dark rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Commentaire</h4>
              <p className="text-sm text-gray-800 whitespace-pre-line">{order.comment}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t rounded-b-2xl bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}; 