/**
 * Token auth (Authorization: Bearer) backed by localStorage.
 *
 * The token is set once via the login modal and then attached to every
 * same-origin request by the global fetch patch installed in `main.ts`, so
 * note scripts that call `fetch('/exec')` need no changes.
 */

const TOKEN_KEY = 'downspace_token';
export const AUTH_REQUIRED_EVENT = 'downspace:auth-required';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** True when a token is present locally (does not verify it with the server). */
export function hasToken(): boolean {
  return !!getToken();
}

/**
 * Requests a login prompt. Any code can call this (note scripts included) to
 * make the app shell show the login modal.
 */
export function requireAuth(): void {
  window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT));
}

function isSameOrigin(url: string): boolean {
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * fetch() wrapper that adds the Bearer token to same-origin requests and
 * raises the login prompt on a 401.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  const headers = new Headers(
    init?.headers ?? (typeof input === 'string' || input instanceof URL ? undefined : input.headers),
  );

  const token = getToken();
  if (token && isSameOrigin(url) && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    requireAuth();
  }

  return res;
}

/**
 * Patches window.fetch so third-party code (note <script> blocks, tools in
 * notes/tools) transparently authenticates. Only same-origin requests are
 * touched, and an explicit Authorization header always wins.
 */
export function installFetchInterceptor(): void {
  const original = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    const token = getToken();
    if (!token || !isSameOrigin(url)) {
      return original(input, init);
    }

    const originalHeaders = init?.headers ?? (typeof input === 'string' || input instanceof URL ? undefined : input.headers);
    const headers = new Headers(originalHeaders);
    if (headers.has('Authorization')) {
      return original(input, init);
    }
    headers.set('Authorization', `Bearer ${token}`);
    return original(input, { ...init, headers });
  };
}

export interface SessionStatus {
  authenticated: boolean;
  /** False when the server was started without AUTH_TOKEN (auth disabled). */
  required: boolean;
}

/** Ask the server whether the current token is valid. */
export async function fetchSession(): Promise<SessionStatus> {
  try {
    const res = await authFetch('/api/session');
    if (!res.ok) return { authenticated: false, required: true };
    const data = (await res.json()) as Partial<SessionStatus>;
    return {
      authenticated: !!data.authenticated,
      required: data.required !== false,
    };
  } catch {
    return { authenticated: false, required: true };
  }
}

/** Exchange a token for confirmation. Returns true on success. */
export async function login(token: string): Promise<boolean> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) return false;
  setToken(token);
  return true;
}

export function logout(): void {
  clearToken();
  window.location.reload();
}

declare global {
  interface Window {
    downspace?: {
      token: () => string | null;
      login: (token: string) => Promise<boolean>;
      logout: () => void;
      requireAuth: () => void;
    };
  }
}

export function exposeAuthGlobals(): void {
  window.downspace = {
    token: getToken,
    login,
    logout,
    requireAuth,
  };
}
