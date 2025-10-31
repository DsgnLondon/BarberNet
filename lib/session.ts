// Lightweight session persistence with optional expo-secure-store
// Works even if the module is not yet installed (no-ops), but persistence
// will be enabled once expo-secure-store is added.

const KEY = 'app.hasEntered';

type SecureStoreModule = {
  setItemAsync: (k: string, v: string) => Promise<void>;
  getItemAsync: (k: string) => Promise<string | null>;
  deleteItemAsync: (k: string) => Promise<void>;
};

function getSecureStore(): SecureStoreModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-secure-store');
    return mod;
  } catch {
    return null;
  }
}

export async function markEntered() {
  const s = getSecureStore();
  if (!s) return;
  await s.setItemAsync(KEY, '1');
}

export async function clearEntered() {
  const s = getSecureStore();
  if (!s) return;
  await s.deleteItemAsync(KEY);
}

export async function hasEntered(): Promise<boolean> {
  const s = getSecureStore();
  if (!s) return false;
  const v = await s.getItemAsync(KEY);
  return v === '1';
}
