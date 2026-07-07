import { api } from './api';

export const mediaUrl = (value?: string | null) => {
  if (!value || /^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) return value || undefined;
  const apiBase = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${apiBase}${value.startsWith('/') ? value : `/${value}`}`;
};
