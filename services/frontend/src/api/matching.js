import { apiFetch } from './client';

export async function triggerMatchingLifecycleStepApi(step, slotId = null) {
  const adminToken = localStorage.getItem('admin_token');
  const headers = {};
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  const query = slotId ? `?slotId=${slotId}` : '';
  return await apiFetch(`/admin/matching/lifecycle/step/${step}${query}`, {
    method: 'POST',
    headers
  });
}

