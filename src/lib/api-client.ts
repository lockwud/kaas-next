"use client";

import { clearAuthSession, extractSessionTokens, getAccessToken, getRefreshToken, setSessionTokens } from "./auth-session";

type ApiEnvelope<T> = {
  status: string;
  message: string;
  data: T;
};

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/+$/, "");
const API_PATH_PREFIX = (process.env.NEXT_PUBLIC_API_PATH_PREFIX ?? "/api/v1").trim();
const REFRESH_PATH = process.env.NEXT_PUBLIC_AUTH_REFRESH_PATH ?? "/auth/refresh-token";
const REFRESH_FALLBACK_PATH = "/auth/refresh";

let refreshPromise: Promise<string | null> | null = null;

const withLeadingSlash = (path: string): string => (path.startsWith("/") ? path : `/${path}`);

const applyPrefix = (path: string): string => {
  const normalizedPath = withLeadingSlash(path);
  if (!API_PATH_PREFIX) {
    return normalizedPath;
  }

  const normalizedPrefix = withLeadingSlash(API_PATH_PREFIX).replace(/\/+$/, "");
  let basePathname = "";
  try {
    basePathname = new URL(API_BASE_URL).pathname.replace(/\/+$/, "");
  } catch {
    basePathname = "";
  }

  if (basePathname === normalizedPrefix || basePathname.endsWith(`${normalizedPrefix}`)) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith(`${normalizedPrefix}/`) || normalizedPath === normalizedPrefix) {
    return normalizedPath;
  }

  return `${normalizedPrefix}${normalizedPath}`;
};

const resolveUrl = (path: string): string => `${API_BASE_URL}${path}`;

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const fetchWithApiPrefixFallback = async (path: string, init: RequestInit): Promise<Response> => {
  const primaryPath = applyPrefix(path);
  const primaryResponse = await fetch(resolveUrl(primaryPath), init);

  if (primaryResponse.status !== 404) {
    return primaryResponse;
  }

  const legacyPath = withLeadingSlash(path);
  if (legacyPath.startsWith("/api/v1/") || API_PATH_PREFIX) {
    return primaryResponse;
  }

  return fetch(resolveUrl(`/api/v1${legacyPath}`), init);
};

const getEnvelopeData = <T>(payload: unknown): T | null => {
  if (!payload || typeof payload !== "object") return null;
  if ("data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
};

const isAuthEndpoint = (path: string): boolean =>
  /\/auth\/(login|register|refresh|refresh-token|logout)/.test(path);

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    const refreshPaths = Array.from(new Set([REFRESH_PATH, REFRESH_FALLBACK_PATH]));

    for (const refreshPath of refreshPaths) {
      const headers = new Headers();
      let body: string | undefined;

      if (refreshToken) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify({ refreshToken });
      }

      const response = await fetchWithApiPrefixFallback(refreshPath, {
        method: "POST",
        credentials: "include",
        headers,
        body,
      });

      if (response.status === 404) {
        continue;
      }

      const payload = await parseJson<ApiEnvelope<unknown> | Record<string, unknown>>(response);
      const data = getEnvelopeData<unknown>(payload);
      const tokens = extractSessionTokens(data ?? payload);

      if (!response.ok || !tokens?.accessToken) {
        clearAuthSession();
        return null;
      }

      setSessionTokens(tokens);
      return tokens.accessToken;
    }

    clearAuthSession();
    return null;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/Login") {
    window.location.href = "/Login";
  }
};

export async function apiRequest<T>(path: string, init?: RequestInit, hasRetried = false): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetchWithApiPrefixFallback(path, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !hasRetried && !isAuthEndpoint(path)) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiRequest<T>(path, init, true);
    }
    redirectToLogin();
    throw new Error("Session expired. Please login again.");
  }

  const payload = await parseJson<ApiEnvelope<T> | T>(response);

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload
      ? String((payload as { message?: string }).message ?? "Request failed")
      : "Request failed";
    throw new ApiRequestError(message, response.status);
  }

  const data = getEnvelopeData<T>(payload);
  if (data === null || data === undefined) {
    throw new Error("Empty response from server");
  }

  return data;
}
