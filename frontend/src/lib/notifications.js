// Advanced Notification System
import { writable } from 'svelte/store';

export const notifications = writable([]);

let notificationId = 0;

export const notificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export function addNotification(message, type = notificationTypes.INFO, duration = 5000) {
  const id = notificationId++;
  const notification = {
    id,
    message,
    type,
    timestamp: Date.now()
  };
  
  notifications.update(n => [...n, notification]);
  
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
  
  return id;
}

export function removeNotification(id) {
  notifications.update(n => n.filter(notification => notification.id !== id));
}

export function clearAllNotifications() {
  notifications.set([]);
}

// Convenience methods
export const notify = {
  success: (message, duration) => addNotification(message, notificationTypes.SUCCESS, duration),
  error: (message, duration) => addNotification(message, notificationTypes.ERROR, duration),
  warning: (message, duration) => addNotification(message, notificationTypes.WARNING, duration),
  info: (message, duration) => addNotification(message, notificationTypes.INFO, duration)
};