import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Package } from 'lucide-react';
import { Layout } from '../components/Layout';
import { OrderCard } from '../components/OrderCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { updateOrderStatus } from '../services/orders';
import { useAcceptedOrders } from '../hooks/useOrders';
import { User, OrderStatus, Order } from '../types';
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
                          handleUpdateStatus(order.id, nextStatus);
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
    </Layout>
  );
};