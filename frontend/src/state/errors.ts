export interface ApiError {
  type: 'ApiError';
  message: string;
}

export interface UnknownError {
  type: 'UnknownError';
  message: string;
}

export type ResultError = ApiError | UnknownError;

export function formatError(err: unknown): string {
  if (isApiError(err)) {
    return err.message;
  } else if (isUnknownError(err)) {
    return `Неизвестная ошибка: ${err.message}`;
  } else {
    return 'Неизвестная ошибка';
  }
}

export function createApiError(message: string): ApiError {
  return { type: 'ApiError', message: message };
}

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }
  const type = (value as { type: unknown }).type;
  return type === 'ApiError';
}

export function createUnknownError(message: string): UnknownError {
  return { type: 'UnknownError', message: message };
}

export function isUnknownError(value: unknown): value is UnknownError {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }
  const type = (value as { type: unknown }).type;
  return type === 'UnknownError';
}
