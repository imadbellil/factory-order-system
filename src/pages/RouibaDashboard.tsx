import React, { useState } from 'react';
import { PlusCircle, Package } from 'lucide-react';
import { Layout } from '../components/Layout';
import { OrderCard } from '../components/OrderCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { createOrder, deleteOrder, updateOrder } from '../services/orders';
import { useOrders } from '../hooks/useOrders';
import { User, CreateOrderData, OrderStatus, Order } from '../types';
import { SUBMITTER_OPTIONS, MACHINE_OPTIONS, ORDER_STATUS_LABELS } from '../utils/constants';
import { OrderStatusBar } from '../components/OrderStatusBar';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

interface RouibaDashboardProps {
  user: User;
}

export const RouibaDashboard: React.FC<RouibaDashboardProps> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateOrderData>({
    client: '',
    initialProduct: '',
    initialQuantity: 0,
    finalProduct: '',
    finalQuantity: 0,
    submitter: '',
    productType: '',
    quantity: 0,
    machineName: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [editTarget, setEditTarget] = useState<null | string>(null);
  const [editForm, setEditForm] = useState<CreateOrderData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { orders: allOrders, loading } = useOrders({ createdBy: user.uid });
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);

  const filteredOrders = activeStatus
    ? allOrders.filter(order => order.status === activeStatus)
    : allOrders;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createOrder(formData, user.uid);
      setFormData({
        client: '',
        initialProduct: '',
        initialQuantity: 0,
        finalProduct: '',
        finalQuantity: 0,
        submitter: '',
        productType: '',
        quantity: 0,
        machineName: '',
        comment: ''
      });
      setShowForm(false);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    if (deletePassword !== 'DELETE4321') {
      setDeleteError('Mot de passe de suppression incorrect.');
      return;
    }
    setDeleteLoading(true);
    try {
      if (deleteTarget) {
        await deleteOrder(deleteTarget);
        setDeleteSuccess('Commande supprimée avec succès.');
        setDeleteTarget(null);
        setDeletePassword('');
      }
    } catch (err) {
      setDeleteError('Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (order: any) => {
    setEditTarget(order.id);
    setEditForm({
      client: order.client || '',
      initialProduct: order.initialProduct || '',
      initialQuantity: order.initialQuantity || 0,
      finalProduct: order.finalProduct || '',
      finalQuantity: order.finalQuantity || 0,
      submitter: order.submitter || '',
      productType: order.productType || '',
      quantity: order.quantity || 0,
      machineName: order.machineName || '',
      comment: order.comment || ''
    });
    setEditError('');
    setEditSuccess('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editForm) return;
    const { name, value, type } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    if (editPassword !== 'Edit4321') {
      setEditError('Mot de passe de modification incorrect.');
      setEditLoading(false);
      return;
    }
    try {
      await updateOrder(editTarget, editForm);
      setEditSuccess('Commande modifiée et renvoyée à l\'étape d\'acceptation.');
      setEditTarget(null);
      setEditForm(null);
      setEditPassword('');
    } catch (err) {
      setEditError('Erreur lors de la modification.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Layout user={user} title="Tableau de Bord Rouiba">
      <div className="space-y-8">
        <OrderStatusBar activeStatus={activeStatus} onStatusClick={setActiveStatus} />
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mes Commandes</h2>
            <p className="text-gray-500">
              Créez et suivez vos demandes de production.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-100 shadow-sm"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Nouvelle Commande</span>
          </button>
        </div>

        {/* Create Order Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Nouvelle Commande de Production
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label htmlFor="submitter" className="block text-sm font-medium text-gray-700 mb-2">
                    Soumissionnaire *
                  </label>
                  <select
                    id="submitter"
                    name="submitter"
                    value={formData.submitter}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900"
                  >
                    <option value="">Sélectionner</option>
                    {SUBMITTER_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="initialProduct" className="block text-sm font-medium text-gray-700 mb-2">
                    Produit initial *
                  </label>
                  <input
                    type="text"
                    id="initialProduct"
                    name="initialProduct"
                    value={formData.initialProduct}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    placeholder="Produit initial"
                  />
                </div>
                <div>
                  <label htmlFor="initialQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité initiale *
                  </label>
                  <input
                    type="number"
                    id="initialQuantity"
                    name="initialQuantity"
                    value={formData.initialQuantity || ''}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    placeholder="Quantité initiale"
                  />
                </div>
                <div>
                  <label htmlFor="finalProduct" className="block text-sm font-medium text-gray-700 mb-2">
                    Produit final
                  </label>
                  <input
                    type="text"
                    id="finalProduct"
                    name="finalProduct"
                    value={formData.finalProduct}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    placeholder="Produit final (optionnel)"
                  />
                </div>
                <div>
                  <label htmlFor="finalQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité finale
                  </label>
                  <input
                    type="number"
                    id="finalQuantity"
                    name="finalQuantity"
                    value={formData.finalQuantity || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    placeholder="Quantité finale (optionnel)"
                  />
                </div>
                <div>
                  <label htmlFor="machineName" className="block text-sm font-medium text-gray-700 mb-2">
                    Machine *
                  </label>
                  <select
                    id="machineName"
                    name="machineName"
                    value={formData.machineName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900"
                  >
                    <option value="">Sélectionner</option>
                    {MACHINE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400 resize-none"
                    placeholder="Ajouter un commentaire..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Création...' : 'Créer la commande'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Orders List */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <Package className="h-16 w-16 mx-auto text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Aucune commande trouvée</h3>
              <p className="mt-1 text-gray-500">
                {activeStatus ? `Aucune commande avec le statut "${ORDER_STATUS_LABELS[activeStatus]}".` : "Créez votre première commande pour commencer. ✨"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                >
                  {order.status === 'pending' && (
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                        className="flex-1 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-lg transition-colors"
                      onClick={() => openEditModal(order)}
                    >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="flex-1 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2 px-4 rounded-lg transition-colors"
                        onClick={() => setDeleteTarget(order.id)}
                      >
                        Supprimer
                    </button>
                    </div>
                  )}
                </OrderCard>
              ))}
            </div>
          )}
        </div>

        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

        {/* Delete Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm border">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Confirmer la suppression</h2>
              <p className="mb-4 text-gray-600">Veuillez entrer le mot de passe spécial pour supprimer cette commande.</p>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                placeholder="Mot de passe de suppression"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                disabled={deleteLoading}
              />
              {deleteError && <p className="text-red-600 text-sm mt-2">{deleteError}</p>}
              {deleteSuccess && <p className="text-green-600 text-sm mt-2">{deleteSuccess}</p>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setDeleteTarget(null); setDeletePassword(''); setDeleteError(''); setDeleteSuccess(''); }}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  disabled={deleteLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 font-semibold transition-colors disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editTarget && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg border">
              <h2 className="text-lg font-bold mb-6 text-gray-900">Modifier la commande</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-client" className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                    <input
                      type="text"
                      id="edit-client"
                      name="client"
                      value={editForm.client}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-submitter" className="block text-sm font-medium text-gray-700 mb-2">Soumissionnaire *</label>
                    <select
                      id="edit-submitter"
                      name="submitter"
                      value={editForm.submitter}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900"
                    >
                      <option value="">Sélectionner</option>
                      {SUBMITTER_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-initialProduct" className="block text-sm font-medium text-gray-700 mb-2">Produit initial *</label>
                    <input
                      type="text"
                      id="edit-initialProduct"
                      name="initialProduct"
                      value={editForm.initialProduct}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-initialQuantity" className="block text-sm font-medium text-gray-700 mb-2">Quantité initiale *</label>
                    <input
                      type="number"
                      id="edit-initialQuantity"
                      name="initialQuantity"
                      value={editForm.initialQuantity || ''}
                      onChange={handleEditInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-finalProduct" className="block text-sm font-medium text-gray-700 mb-2">Produit final *</label>
                    <input
                      type="text"
                      id="edit-finalProduct"
                      name="finalProduct"
                      value={editForm.finalProduct}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-finalQuantity" className="block text-sm font-medium text-gray-700 mb-2">Quantité finale *</label>
                    <input
                      type="number"
                      id="edit-finalQuantity"
                      name="finalQuantity"
                      value={editForm.finalQuantity || ''}
                      onChange={handleEditInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-machineName" className="block text-sm font-medium text-gray-700 mb-2">Machine *</label>
                    <select
                      id="edit-machineName"
                      name="machineName"
                      value={editForm.machineName}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-gray-50 text-gray-900"
                    >
                      <option value="">Sélectionner</option>
                      {MACHINE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/50 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
                  placeholder="Mot de passe de modification"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  disabled={editLoading}
                />
                {editError && <p className="text-red-600 text-sm mt-2">{editError}</p>}
                {editSuccess && <p className="text-green-600 text-sm mt-2">{editSuccess}</p>}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setEditTarget(null); setEditForm(null); setEditError(''); setEditSuccess(''); setEditPassword(''); }}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    disabled={editLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-semibold transition-colors disabled:opacity-50"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Modification...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};