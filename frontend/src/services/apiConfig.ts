export type DataMode = 'local' | 'api';

const runtimeConfig = globalThis as typeof globalThis & {
  __VITE_DATA_MODE__?: string;
  __VITE_API_BASE_URL__?: string;
};

export const dataMode: DataMode = runtimeConfig.__VITE_DATA_MODE__ === 'api' ? 'api' : 'local';
export const apiBaseUrl = (runtimeConfig.__VITE_API_BASE_URL__ || 'http://localhost:5219').replace(/\/$/, '');
