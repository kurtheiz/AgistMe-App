import { create } from 'zustand';
import { Notification } from '../types/profile';

interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateNotification: (notificationId: string, updates: Partial<Notification>) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  isLoading: false,
  setNotifications: (notifications) => set({ notifications }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateNotification: (notificationId, updates) => 
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, ...updates }
          : notification
      ),
    })),
}));
