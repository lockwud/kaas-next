export type SignatureMethod = "draw" | "initials" | "image";

export interface SignatureProfile {
  method: SignatureMethod;
  dataUrl: string;
  initialsText?: string;
  updatedAt: string;
}

export const SIGNATURE_STORAGE_KEY = "kaas_signature_profile";

export const loadSignatureProfile = (): SignatureProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as SignatureProfile;
  } catch {
    return null;
  }
};

export const saveSignatureProfile = (profile: SignatureProfile) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SIGNATURE_STORAGE_KEY, JSON.stringify(profile));
};
