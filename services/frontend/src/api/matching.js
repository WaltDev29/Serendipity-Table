import { apiFetch } from './client';

export async function triggerMatchingLifecycleStepApi(step, slotId = 1) {
  const adminToken = localStorage.getItem('admin_token');
  const headers = {};
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  return await apiFetch(`/admin/matching/lifecycle/step/${step}?slotId=${slotId}`, {
    method: 'POST',
    headers
  });
}
