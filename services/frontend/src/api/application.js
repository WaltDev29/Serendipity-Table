import { apiFetch } from './client';

export async function applySlotApi(eventSlotId, preferredRegions) {
  return await apiFetch('/applications', {
    method: 'POST',
    body: JSON.stringify({
      eventSlotId,
      preferredRegions
    })
  });
}

export async function getMyApplicationsApi() {
  return await apiFetch('/applications/my');
}

export async function cancelApplicationApi(applicationId) {
  return await apiFetch(`/applications/${applicationId}/cancel`, {
    method: 'POST'
  });
}

export async function checkoutOrderApi({ eventSlotId, ticketType, ticketCount, amount, paymentMethod }) {
  return await apiFetch('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({
      eventSlotId,
      ticketType,
      ticketCount: ticketCount || 1,
      amount,
      paymentMethod: paymentMethod || 'CARD'
    })
  });
}

export async function getMyOrdersApi() {
  return await apiFetch('/orders/my');
}
