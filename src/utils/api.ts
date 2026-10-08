/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  message?: string;
}

/**
 * Robust API fetch helper that safely handles:
 * - Proper JSON responses
 * - Non-JSON error pages (e.g. proxy warmups, 502/503/504 HTML, Vite fallbacks)
 * - Network timeouts or disconnections
 * Preventing "Unexpected token 'T' / '<' ... is not valid JSON" errors in the UI.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(input, init);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return {
          ok: response.ok && data?.success !== false,
          status: response.status,
          data,
          message: data?.message || (response.ok ? undefined : `Request failed with status ${response.status}`),
        };
      } catch (jsonErr: any) {
        return {
          ok: false,
          status: response.status,
          data: {} as T,
          message: 'Unable to parse server response. Please retry.',
        };
      }
    }

    // Response is non-JSON (e.g. HTML error page from proxy or dev server)
    const text = await response.text();
    let friendlyMessage = 'Server communication error. Please try again.';

    if (response.status === 502 || response.status === 503 || response.status === 504) {
      friendlyMessage = 'Portal service is warming up or reconnecting. Please wait a few seconds and try again.';
    } else if (response.status === 404) {
      friendlyMessage = 'The requested service endpoint was temporarily unreachable. Please refresh and retry.';
    } else if (text.includes('The page') || text.includes('cannot be found') || text.includes('Starting Server')) {
      friendlyMessage = 'The server is currently waking up. Please wait 5 seconds and try again.';
    } else if (response.status >= 500) {
      friendlyMessage = `Server error (${response.status}). Please try again shortly.`;
    }

    return {
      ok: false,
      status: response.status,
      data: { success: false, message: friendlyMessage } as any,
      message: friendlyMessage,
    };
  } catch (netErr: any) {
    return {
      ok: false,
      status: 0,
      data: { success: false, message: 'Network connection issue. Please verify your connection.' } as any,
      message: 'Network connection issue. Please verify your connection and try again.',
    };
  }
}
