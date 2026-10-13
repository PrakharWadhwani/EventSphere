import { api } from '../api/client';

export const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

const urlBase64ToUint8Array = (base64) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const registerServiceWorker = () =>
  pushSupported() ? navigator.serviceWorker.register('/sw.js') : Promise.resolve(null);

/** Asks for permission, subscribes this browser and registers it with the backend. */
export async function enablePush() {
  if (!pushSupported()) throw new Error('Push notifications are not supported in this browser.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;
  const { publicKey } = await api('/push/public-key');
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }
  await api('/push/subscribe', { method: 'POST', body: { subscription: subscription.toJSON() } });
  return subscription;
}

/** Re-sends an existing subscription after login so it is linked to the current user. */
export async function syncPushSubscription() {
  if (!pushSupported() || Notification.permission !== 'granted') return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await api('/push/subscribe', { method: 'POST', body: { subscription: subscription.toJSON() } });
  }
}
