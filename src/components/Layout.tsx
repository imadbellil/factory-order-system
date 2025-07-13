import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { LogOut, Factory, UserCircle, Bell, Plus, Check, RefreshCw, Trash2 } from 'lucide-react';
import { signOut } from '../services/auth';
import { User } from '../types';
import { ROLE_LABELS } from '../utils/constants';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Notification } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User;
  title: string;
}

const Toast: React.FC<{ message: string; icon?: string; onClose: () => void }> = ({ message, icon, onClose }) => {
  const Icon = icon === 'plus' ? Plus : icon === 'check' ? Check : icon === 'refresh' ? RefreshCw : Bell;
  useEffect(() => {
    const audio = new Audio('/notification.wav');
    audio.play();
  }, []);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
      <Icon size={20} className="text-white" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white font-bold">&times;</button>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, user, title }) => {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(all);
      setUnread(all.filter(n => !n.readBy?.includes(user.uid)));
    });
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    if (unread.length > 0) {
      setToast({ message: unread[0].message, icon: unread[0].icon });
    }
  }, [unread.length]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const markAllRead = async () => {
    const batch = unread.slice(0, 10);
    await Promise.all(batch.map(n => updateDoc(doc(db, 'notifications', n.id), {
      readBy: [...(n.readBy || []), user.uid]
    })));
    setDropdownOpen(false);
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src="/img/logo.webp" alt="Logo" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span>{ROLE_LABELS[user.role]} - {user.displayName || user.email}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  className="relative p-2 rounded-full hover:bg-primary-light transition-colors"
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6 text-primary" />
                  {unread.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow">{unread.length}</span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-muted z-50 p-3 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-primary">Notifications</span>
                      {unread.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">Tout marquer comme lu</button>
                      )}
                    </div>
                    <ul className="max-h-72 overflow-y-auto divide-y divide-muted">
                      {notifications.slice(0, 10).map(n => (
                        <li key={n.id} className={`py-2 px-1 flex items-start gap-2 group ${!n.readBy?.includes(user.uid) ? 'bg-primary-light/40' : ''}`}>
                          <span className="mt-0.5">
                            {n.icon === 'plus' ? <Plus size={18} className="text-primary" /> : n.icon === 'check' ? <Check size={18} className="text-accent" /> : n.icon === 'refresh' ? <RefreshCw size={18} className="text-blue-400" /> : <Bell size={18} className="text-primary" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800">{n.message}</div>
                            <div className="text-xs text-muted-dark mt-1">{n.status} • {n.type}</div>
                          </div>
                          <button
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100"
                            title="Supprimer la notification"
                            onClick={() => handleDeleteNotification(n.id)}
                            tabIndex={-1}
                          >
                            <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                          </button>
                        </li>
                      ))}
                      {notifications.length === 0 && <li className="text-sm text-gray-500 py-4">Aucune notification</li>}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} icon={toast.icon} onClose={() => setToast(null)} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
};