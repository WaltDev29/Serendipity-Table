import { apiFetch } from './client';

export async function getMyNotificationsApi() {
  return await apiFetch('/notifications');
}

export async function markNotificationReadApi(id) {
  return await apiFetch(`/notifications/${id}/read`, {
    method: 'PATCH'
  });
}

export async function markAllNotificationsReadApi() {
  return await apiFetch('/notifications/read-all', {
    method: 'POST'
  });
}
