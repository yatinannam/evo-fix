self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'EvoCare reminder', {
    body: data.body || 'It is time for your medication.',
    icon: '/evocare-icon.png', tag: data.tag || 'evocare-reminder', data: { url: data.url || '/evocare/dashboard/medications' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/evocare/dashboard/medications'));
});
