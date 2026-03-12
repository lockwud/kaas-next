"use client";

export type AppRole =
  | "proprietor"
  | "administrator"
  | "headmaster"
  | "subject_teacher"
  | "class_teacher"
  | "student"
  | "guest";

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
};

const ACCESS_TOKEN_KEY = "kaas_token";
const REFRESH_TOKEN_KEY = "kaas_refresh_token";
const ROLE_KEY = "kaas_user_role_key";

const isBrowser = (): boolean => typeof window !== "undefined";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const pickString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const pickToken = (source: Record<string, unknown> | null, keys: string[]): string | undefined => {
  if (!source) return undefined;
  for (const key of keys) {
    const value = pickString(source[key]);
    if (value) return value;
  }
  return undefined;
};

export const normalizeRoleKey = (role?: string | null): AppRole => {
  if (!role) return "guest";
  const normalized = role.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "admin") return "administrator";
  if (normalized === "general_manager") return "administrator";
  if (
    normalized === "proprietor" ||
    normalized === "administrator" ||
    normalized === "headmaster" ||
    normalized === "subject_teacher" ||
    normalized === "class_teacher" ||
    normalized === "student"
  ) {
    return normalized;
  }
  return "guest";
};

const getStorageToken = (primaryKey: string, fallbackKeys: string[]): string | null => {
  if (!isBrowser()) return null;
  const primary = window.localStorage.getItem(primaryKey);
  if (primary) return primary;
  for (const key of fallbackKeys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
};

export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  return getStorageToken(ACCESS_TOKEN_KEY, ["kaas_access_token", "access_token", "accessToken", "token"]);
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return getStorageToken(REFRESH_TOKEN_KEY, ["kaas_refresh", "refresh_token", "refreshToken"]);
};

export const getRoleKey = (): AppRole => {
  if (!isBrowser()) return "guest";
  return normalizeRoleKey(window.localStorage.getItem(ROLE_KEY));
};

export const setSessionTokens = (tokens: SessionTokens): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
};

export const setRoleKey = (role: string): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(ROLE_KEY, normalizeRoleKey(role));
};

export const clearAuthSession = (): void => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(ROLE_KEY);
  window.localStorage.removeItem("kaas_school_id");
  window.localStorage.removeItem("kaas_branch_id");
  window.localStorage.removeItem("kaas_user_name");
  window.localStorage.removeItem("kaas_user_email");
  window.localStorage.removeItem("kaas_user_role");
  window.localStorage.removeItem("kaas_school_name");
};

export const extractSessionTokens = (payload: unknown): SessionTokens | null => {
  const root = asRecord(payload);
  const nestedTokens = asRecord(root?.tokens);
  const nestedSession = asRecord(root?.session);

  const accessToken =
    pickToken(root, ["accessToken", "token"]) ||
    pickToken(nestedTokens, ["accessToken", "token"]) ||
    pickToken(nestedSession, ["accessToken", "token"]);

  if (!accessToken) {
    return null;
  }

  const refreshToken =
    pickToken(root, ["refreshToken"]) ||
    pickToken(nestedTokens, ["refreshToken"]) ||
    pickToken(nestedSession, ["refreshToken"]);

  return { accessToken, refreshToken };
};
