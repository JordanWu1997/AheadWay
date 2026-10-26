self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch (_) { data = {}; }
  event.waitUntil(self.registration.showNotification(data.title || '公車出發提醒', {
    body: data.body || '公車接近所選站牌。',
    icon: new URL('icon.svg', self.registration.scope).href,
    badge: new URL('icon.svg', self.registration.scope).href,
    tag: 'bus-leave-alert',
    data: {url: self.registration.scope}
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then(windows => {
    const existing = windows.find(client => client.url.startsWith(self.registration.scope));
    return existing ? existing.focus() : clients.openWindow(self.registration.scope);
  }));
});
