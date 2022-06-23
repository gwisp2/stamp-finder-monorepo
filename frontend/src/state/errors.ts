export const API_ERROR_STATUS = 'API_ERROR';
export const FETCH_ERROR_STATUS = 'FETCH_ERROR';

export interface GenericError<S extends string> {
  status: S;
  message: string;
}

export function formatError(err: unknown): string {
  const unknownErrorMessage = 'Неизвестная ошибка';
  if (typeof err !== 'object' || err === null) {
    return unknownErrorMessage;
  }

  const status = (err as { status: unknown }).status;
  const data = (err as { data: unknown }).data;
  if (typeof data !== 'string' || typeof status !== 'string') {
    return unknownErrorMessage;
  }

  if (status === API_ERROR_STATUS || status === FETCH_ERROR_STATUS) {
    return data;
  } else {
    return 'Неизвестная ошибка';
  }
}
