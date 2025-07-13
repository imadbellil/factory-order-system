import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';
import { Layout } from '../components/Layout';
import { OrderCard } from '../components/OrderCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { updateOrderStatus } from '../services/orders';
import { useOrders, usePendingOrders } from '../hooks/useOrders';
import { User, OrderStatus, Order } from '../types';
import { OrderStatusBar } from '../components/OrderStatusBar';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

interface MeftahDashboardProps {
  user: User;
}

export const MeftahDashboard: React.FC<MeftahDashboardProps> = ({ user }) => {
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);

  const { orders: allOrders, loading: loadingAll } = useOrders();
  const { orders: pendingOrders, loading: loadingPending } = usePendingOrders();
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = activeStatus
    ? allOrders.filter(order => order.status === activeStatus)
    : allOrders;

  const handleAcceptOrder = async (orderId: string) => {
    setProcessingOrders(prev => new Set(prev).add(orderId));
    
    try {
      await updateOrderStatus(orderId, 'accepted');
    } catch (error) {
      console.error('Error accepting order:', error);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = rejectionReason[orderId];
    if (!reason || reason.trim() === '') {
      alert('Veuillez fournir un motif de rejet');
      return;
    }

    setProcessingOrders(prev => new Set(prev).add(orderId));
    
    try {
      await updateOrderStatus(orderId, 'rejected', reason);
      setRejectionReason(prev => ({ ...prev, [orderId]: '' }));
      setShowRejectionForm(null);
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleRejectionReasonChange = (orderId: string, reason: string) => {
    setRejectionReason(prev => ({ ...prev, [orderId]: reason }));
  };

  return (
    <Layout user={user} title="Tableau de Bord Meftah">
      <div className="space-y-10">
        <OrderStatusBar activeStatus={activeStatus} onStatusClick={setActiveStatus} />
        {/* Section 1: Accept Orders */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commandes à Accepter</h2>
          <p className="text-gray-500 mb-4">
            Acceptez ou rejetez les demandes de production en attente.
          </p>
          {loadingPending ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Toutes les commandes sont traitées!</h3>
              <p className="mt-1 text-gray-500">
                Aucune commande en attente pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)}>
                  <div className="space-y-3" onClick={stopPropagation}>
                    {/* Rejection form */}
                    {showRejectionForm === order.id && (
                      <div className="space-y-3">
                        <textarea
                          value={rejectionReason[order.id] || ''}
                          onChange={(e) => handleRejectionReasonChange(order.id, e.target.value)}
                          placeholder="Motif du rejet (obligatoire)"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400"
                        />
                      </div>
                    )}
                    {/* Action buttons */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-3">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={processingOrders.has(order.id)}
                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        {processingOrders.has(order.id) ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Traitement...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Accepter</span>
                          </>
                        )}
                      </button>
                      {showRejectionForm === order.id ? (
                        <div className="flex gap-2 flex-1">
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            disabled={processingOrders.has(order.id)}
                            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            {processingOrders.has(order.id) ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span>Rejet...</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                <span>Confirmer</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowRejectionForm(null)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRejectionForm(order.id)}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Rejeter</span>
                        </button>
                      )}
                    </div>
                  </div>
                </OrderCard>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: View Orders Status */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Suivi des Commandes</h2>
          <p className="text-gray-500 mb-4">
            Visualisez le statut de toutes les commandes.
          </p>
          {loadingAll ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <Package className="h-16 w-16 mx-auto text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Aucune commande trouvée</h3>
              <p className="mt-1 text-gray-500">
                {activeStatus ? `Aucune commande avec le statut "${ORDER_STATUS_LABELS[activeStatus]}".` : "Il n'y a pas de commandes à afficher."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
              ))}
            </div>
          )}
        </section>
      </div>
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </Layout>
  );
};