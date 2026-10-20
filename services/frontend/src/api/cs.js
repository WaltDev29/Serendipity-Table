import { apiFetch } from './client';

export async function createInquiryApi(category, title, content) {
  return await apiFetch('/cs/inquiries', {
    method: 'POST',
    body: JSON.stringify({ category, title, content })
  });
}

export async function getMyInquiriesApi() {
  return await apiFetch('/cs/inquiries/my');
}
