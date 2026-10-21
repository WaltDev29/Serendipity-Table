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

export async function checkoutOrderApi({ eventSlotId, ticketType, ticketCount, amount, paymentMethod, itemName }) {
  const defaultItemName = itemName || (ticketType === '3_TICKETS' ? '우연한 식탁 3회 참가권' : '우연한 식탁 1회 참가권');
  return await apiFetch('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({
      itemName: defaultItemName,
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
