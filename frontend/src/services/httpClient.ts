import { apiBaseUrl } from './apiConfig';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API da Biblioteca.');
  }

  const body = await response.text();
  let payload: unknown;
  try {
    payload = body ? JSON.parse(body) : undefined;
  } catch {
    payload = undefined;
  }
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload
      ? String(payload.error)
      : `A API retornou o status ${response.status}.`;
    throw new ApiError(response.status, message);
  }
  return payload as T;
}
