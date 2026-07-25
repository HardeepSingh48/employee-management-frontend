/**
 * Typed Axios error extraction utility.
 *
 * Eliminates the `error: any` anti-pattern from every async thunk.
 * Import `extractErrorMessage` and pass the raw caught value.
 */

import axios from 'axios';

interface ApiErrorBody {
  message?: string;
}

/**
 * Extracts a human-readable error message from an unknown thrown value.
 *
 * Priority:
 * 1. `error.response.data.message` (backend JSON error)
 * 2. `error.message` (Axios or native JS Error)
 * 3. Provided fallback string
 */
export function extractErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred.',
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    return body?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
