import { apiFetch } from './client';

export async function loginApi(phone, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password })
  });
  if (data?.accessToken) {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
}

export async function signupApi(signupData) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(signupData)
  });
  if (data?.accessToken) {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
}

export async function getMyProfileApi() {
  return await apiFetch('/users/me');
}

export async function updateProfileApi(profileData) {
  return await apiFetch('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(profileData)
  });
}

export async function getMyTicketsApi() {
  return await apiFetch('/users/me/tickets');
}

export async function getMyBlocksApi() {
  return await apiFetch('/users/me/blocks');
}

export async function blockUserApi(targetUserId, reason) {
  return await apiFetch('/users/me/blocks', {
    method: 'POST',
    body: JSON.stringify({ targetUserId, reason })
  });
}

export async function unblockUserApi(targetUserId) {
  return await apiFetch(`/users/me/blocks/${targetUserId}`, {
    method: 'DELETE'
  });
}

export async function withdrawApi() {
  return await apiFetch('/users/me/withdraw', {
    method: 'POST'
  });
}

export async function uploadProfileImageApi(file) {
  const formData = new FormData();
  formData.append('file', file);
  return await apiFetch('/users/me/profile-image', {
    method: 'POST',
    body: formData
  });
}
