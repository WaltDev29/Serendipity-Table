import { apiFetch } from './client';

export async function getMyActiveTableApi() {
  return await apiFetch('/tables/my-active');
}

export async function getMyPastTablesApi() {
  return await apiFetch('/tables/my-past');
}

export async function submitFeedbackApi(tableId, feedbackData) {
  return await apiFetch(`/tables/${tableId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
}

export async function submitSecretChemistryApi(tableId, chemistryData) {
  return await apiFetch(`/tables/${tableId}/secret-chemistry`, {
    method: 'POST',
    body: JSON.stringify(chemistryData)
  });
}
