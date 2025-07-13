import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Package, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { OrderCard } from '../components/OrderCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { updateOrderStatus } from '../services/orders';
import { useAcceptedOrders } from '../hooks/useOrders';
import { User, OrderStatus, Order, ProductionEstimation } from '../types';
import { HANGAR_STATUS_FLOW, ORDER_STATUS_LABELS } from '../utils/constants';
import { OrderStatusBar } from '../components/OrderStatusBar';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

interface HangarDashboardProps {
  user: User;
}

export const HangarDashboard: React.FC<HangarDashboardProps> = ({ user }) => {
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const { orders: allOrders, loading } = useAcceptedOrders();
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmModal, setConfirmModal] = useState<{orderId: string, currentStatus: OrderStatus, nextStatus: OrderStatus} | null>(null);
  const [productionEstimation, setProductionEstimation] = useState<ProductionEstimation>({ days: 0, hours: 0, minutes: 0 });
  const [estimationError, setEstimationError] = useState<string>('');
  const estimationOptions = [
    '30 min',
    '1 heure',
    '2 heures',
    '4 heures',
    '8 heures',
    '1 jour',
    '2 jours',
    '3 jours',
    '1 semaine',
  ];

  // Helper to validate estimation
  const isEstimationValid = (est: ProductionEstimation) => {
    const { days, hours, minutes } = est;
    return (
      Number.isInteger(days) && days >= 0 &&
      Number.isInteger(hours) && hours >= 0 && hours <= 23 &&
      Number.isInteger(minutes) && minutes >= 0 && minutes <= 59 &&
      (days > 0 || hours > 0 || minutes > 0)
    );
  };

  const filteredOrders = activeStatus
    ? allOrders.filter(order => order.status === activeStatus)
    : allOrders;

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = HANGAR_STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === HANGAR_STATUS_FLOW.length - 1) {
      return null;
    }
    return HANGAR_STATUS_FLOW[currentIndex + 1];
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrders(prev => new Set(prev).add(orderId));
    
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setProcessingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getStatusCounts = () => {
    const counts: { [key: string]: number } = {};
    HANGAR_STATUS_FLOW.forEach(status => {
      counts[status] = allOrders.filter(order => order.status === status).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Layout user={user} title="Tableau de Bord Hangar">
      <div className="space-y-6">
        <OrderStatusBar activeStatus={activeStatus} onStatusClick={setActiveStatus} />
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suivi de Production</h2>
          <p className="text-gray-500">
            Gérez le statut des commandes acceptées.
          </p>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
            <Package className="h-16 w-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Aucune commande trouvée</h3>
            <p className="mt-1 text-gray-500">
              {activeStatus ? `Aucune commande avec le statut "${ORDER_STATUS_LABELS[activeStatus]}".` : "Aucune commande acceptée à traiter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const isProcessing = processingOrders.has(order.id);
              const isCompleted = order.status === 'charge';

              return (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)}>
                  {!isCompleted && nextStatus && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Prochaine étape: <strong>{ORDER_STATUS_LABELS[nextStatus]}</strong>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({orderId: order.id, currentStatus: order.status, nextStatus});
                        }}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Mise à jour...</span>
                          </>
                        ) : (
                          <>
                            <span>Avancer</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Commande terminée</span>
                      </div>
                    </div>
                  )}
                </OrderCard>
              );
            })}
          </div>
        )}
      </div>
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col border">
            <div className="flex items-start justify-between p-5 border-b rounded-t-2xl bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Confirmer l'avancement</h3>
              <button
                onClick={() => { setConfirmModal(null); setProductionEstimation({ days: 0, hours: 0, minutes: 0 }); setEstimationError(''); }}
                className="p-2 ml-auto bg-transparent rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">Êtes-vous sûr de vouloir avancer le statut de cette commande ?</p>
              <div className="flex flex-col gap-2">
                <span><strong>Statut actuel :</strong> {ORDER_STATUS_LABELS[confirmModal.currentStatus]}</span>
                <span><strong>Nouveau statut :</strong> {ORDER_STATUS_LABELS[confirmModal.nextStatus]}</span>
              </div>
              {/* Show estimation inputs only when moving to 'en_cours' */}
              {confirmModal.nextStatus === 'en_cours' && (
                <div className="mt-4 flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimation du temps de production *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={productionEstimation.days}
                      onChange={e => setProductionEstimation(est => ({ ...est, days: parseInt(e.target.value) || 0 }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                      placeholder="Jours"
                    />
                    <span className="self-center">jours</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={productionEstimation.hours}
                      onChange={e => setProductionEstimation(est => ({ ...est, hours: parseInt(e.target.value) || 0 }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                      placeholder="Heures"
                    />
                    <span className="self-center">heures</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={productionEstimation.minutes}
                      onChange={e => setProductionEstimation(est => ({ ...est, minutes: parseInt(e.target.value) || 0 }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                      placeholder="Minutes"
                    />
                    <span className="self-center">minutes</span>
                  </div>
                  {estimationError && <p className="text-red-600 text-sm mt-2">{estimationError}</p>}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t rounded-b-2xl bg-gray-50">
              <button
                onClick={() => { setConfirmModal(null); setProductionEstimation({ days: 0, hours: 0, minutes: 0 }); setEstimationError(''); }}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (confirmModal) {
                    if (confirmModal.nextStatus === 'en_cours') {
                      if (!isEstimationValid(productionEstimation)) {
                        setEstimationError('Veuillez entrer une estimation valide (au moins un champ > 0, heures 0-23, minutes 0-59).');
                        return;
                      }
                      setProcessingOrders(prev => new Set(prev).add(confirmModal.orderId));
                      try {
                        await updateOrderStatus(confirmModal.orderId, confirmModal.nextStatus, undefined, undefined, undefined, productionEstimation);
                      } catch (error) {
                        console.error('Error updating order status:', error);
                      } finally {
                        setProcessingOrders(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(confirmModal.orderId);
                          return newSet;
                        });
                      }
                      setConfirmModal(null);
                      setProductionEstimation({ days: 0, hours: 0, minutes: 0 });
                      setEstimationError('');
                    } else {
                      await handleUpdateStatus(confirmModal.orderId, confirmModal.nextStatus);
                      setConfirmModal(null);
                    }
                  }
                }}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};