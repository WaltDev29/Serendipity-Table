import { apiFetch } from './client';

export async function adminLoginApi(phone, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password })
  });
  if (data?.accessToken) {
    localStorage.setItem('admin_token', data.accessToken);
  }
  return data;
}

export async function getAdminDashboardApi() {
  return await apiFetch('/admin/dashboard');
}

export async function getAdminSlotsApi() {
  return await apiFetch('/admin/slots');
}

export async function getAdminApplicationsApi(slotId) {
  const query = slotId ? `?slotId=${slotId}` : '';
  return await apiFetch(`/admin/applications${query}`);
}

export async function getAdminUsersApi() {
  return await apiFetch('/admin/users');
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

export async function addStrikeApi(userId, reason) {
  return await apiFetch(`/admin/users/${userId}/strike?reason=${encodeURIComponent(reason)}`, {
    method: 'POST'
  });
}

export async function getAdminInquiriesApi() {
  return await apiFetch('/admin/cs/inquiries');
}

export async function replyInquiryApi(inquiryId, answer, operatorName = '총괄관리자') {
  return await apiFetch(`/admin/cs/inquiries/${inquiryId}/reply`, {
    method: 'POST',
    body: JSON.stringify({
      replyContent: answer,
      operatorName: operatorName,
      answer: answer
    })
  });
}

export async function resolveInquiryApi(inquiryId) {
  return await apiFetch(`/admin/cs/inquiries/${inquiryId}/resolve`, {
    method: 'POST'
  });
}

export async function deleteInquiryApi(inquiryId) {
  return await apiFetch(`/admin/cs/inquiries/${inquiryId}`, {
    method: 'DELETE'
  });
}

export async function updateSlotStatusApi(slotId, status) {
  return await apiFetch(`/admin/slots/${slotId}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH'
  });
}

export async function getAdminAuditLogsApi() {
  return await apiFetch('/admin/audit-logs');
}

export async function refundApplicationApi(applicationId, reason) {
  return await apiFetch(`/admin/applications/${applicationId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}

export async function updateUserByAdminApi(userId, userData) {
  return await apiFetch(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(userData)
  });
}

export async function sendDirectMessageApi(userId, title, content) {
  return await apiFetch(`/admin/users/${userId}/message`, {
    method: 'POST',
    body: JSON.stringify({ title, content })
  });
}

export async function getAdminOrdersApi() {
  return await apiFetch('/admin/orders');
}

export async function refundOrderApi(orderId, reason) {
  return await apiFetch(`/admin/orders/${orderId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}

