import { apiFetch } from './client';

export async function getUpcomingSlotsApi() {
  return await apiFetch('/slots');
}

export async function getHomeStatsApi() {
  return await apiFetch('/slots/stats');
}
