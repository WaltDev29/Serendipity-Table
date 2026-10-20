import { apiFetch } from './client';

export async function getAdminDashboardApi() {
  return await apiFetch('/admin/dashboard');
}

export async function getAdminSlotsApi() {
  return await apiFetch('/admin/slots');
}

export async function toggleRegionCloseApi(slotId, region, isClosed) {
  return await apiFetch(`/admin/slots/${slotId}/regions/${encodeURIComponent(region)}/toggle-close?isClosed=${isClosed}`, {
    method: 'PATCH'
  });
}

export async function getAdminTablesApi(slotId) {
  const query = slotId ? `?slotId=${slotId}` : '';
  return await apiFetch(`/admin/tables${query}`);
}

export async function swapMembersApi(tableId1, userId1, tableId2, userId2, reason) {
  return await apiFetch('/admin/tables/swap', {
    method: 'POST',
    body: JSON.stringify({
      tableId1,
      userId1,
      tableId2,
      userId2,
      reason
    })
  });
}

export async function getAdminVenuesApi() {
  return await apiFetch('/admin/venues');
}

export async function toggleVenueReservedApi(venueId, isReserved) {
  return await apiFetch(`/admin/venues/${venueId}/reserve?isReserved=${isReserved}`, {
    method: 'PATCH'
  });
}

export async function getAdminBlacklistApi() {
  return await apiFetch('/admin/blacklist');
}

export async function addToBlacklistApi(userId, reason) {
  return await apiFetch('/admin/blacklist', {
    method: 'POST',
    body: JSON.stringify({ userId, reason })
  });
}

export async function removeFromBlacklistApi(userId) {
  return await apiFetch(`/admin/blacklist/${userId}`, {
    method: 'DELETE'
  });
}

export async function getAdminInquiriesApi() {
  return await apiFetch('/admin/cs/inquiries');
}

export async function replyInquiryApi(inquiryId, answer) {
  return await apiFetch(`/admin/cs/inquiries/${inquiryId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ answer })
  });
}

export async function getAdminAuditLogsApi() {
  return await apiFetch('/admin/audit-logs');
}
