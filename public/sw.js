self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'New Notification'
  const options = {
    body: data.body || '',
    data: data.data || {},
    badge: '/logo.png',
    icon: '/logo.png'
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  const payload = event.notification.data || {}
  event.notification.close()

  const urlParams = new URLSearchParams()
  if (payload.type) {
    urlParams.set('notify', payload.type)
  }
  if (payload.reportId) {
    urlParams.set('reportId', payload.reportId)
  }
  if (payload.attendanceDate) {
    urlParams.set('attendanceDate', payload.attendanceDate)
  }

  const targetUrl = `/?${urlParams.toString()}`

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'notification-click', payload })
          return client.focus()
        }
      }
      return clients.openWindow(targetUrl)
    })
  )
})
