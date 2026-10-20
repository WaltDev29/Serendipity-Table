import { apiFetch } from './client';

export async function getUpcomingSlotsApi() {
  return await apiFetch('/slots');
}
