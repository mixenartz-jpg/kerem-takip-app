// Reminder service — Browser Notifications API + setTimeout scheduling
// Timeouts are stored in memory; they reset on page refresh (MVP behaviour).

const _timeouts = new Map(); // id → timeoutId

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function fireReminder(reminder) {
  if (Notification.permission === 'granted') {
    const n = new Notification(reminder.title, {
      body: reminder.pageRef ? `Sayfaya git: ${reminder.pageRef}` : undefined,
      icon: '/logo-white.png',
      tag: reminder.id,
    });
    // Auto-close after 8 seconds
    setTimeout(() => n.close(), 8000);
  }
}

export function scheduleReminder(reminder) {
  const now = Date.now();
  const fireAt = new Date(reminder.datetime).getTime();
  const delay = fireAt - now;

  if (delay <= 0) return; // already past

  // Cancel any existing timeout for this id
  cancelReminder(reminder.id);

  const tid = setTimeout(() => {
    fireReminder(reminder);
    _timeouts.delete(reminder.id);
  }, delay);

  _timeouts.set(reminder.id, tid);
}

export function cancelReminder(id) {
  if (_timeouts.has(id)) {
    clearTimeout(_timeouts.get(id));
    _timeouts.delete(id);
  }
}

export function initReminders(reminders = []) {
  const now = Date.now();
  reminders.forEach(r => {
    if (r.datetime && new Date(r.datetime).getTime() > now) {
      scheduleReminder(r);
    }
  });
}
