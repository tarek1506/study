export interface NotificationItem {
  id: string
  message: string
  timestamp: Date
  read: boolean
}

/** Dispatch a notification event to be consumed by the UI */
export function pushNotification(message: string) {
  const item: NotificationItem = {
    id: Math.random().toString(36).substring(2, 9),
    message,
    timestamp: new Date(),
    read: false,
  }
  const event = new CustomEvent('studyflow-notification', { detail: item })
  window.dispatchEvent(event)
}
