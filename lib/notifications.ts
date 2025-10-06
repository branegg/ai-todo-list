export function scheduleNotification(title: string, body: string, timestamp: Date) {
  const now = new Date().getTime();
  const scheduledTime = new Date(timestamp).getTime();
  const delay = scheduledTime - now;

  if (delay <= 0) {
    // Time has passed, show notification immediately
    showNotification(title, body);
    return;
  }

  // Schedule notification
  setTimeout(() => {
    showNotification(title, body);
  }, delay);
}

export function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'todo-reminder',
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
