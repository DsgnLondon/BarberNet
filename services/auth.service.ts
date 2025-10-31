import { getFirebaseAuth } from '../config/firebase-config';
import { onAuthStateChanged, GoogleAuthProvider, signInWithCredential, signOut as fbSignOut, User } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export type AuthState = { user: User | null; loading: boolean };

// Using a lightweight singleton Google auth request per app session
let googleInit: ReturnType<typeof Google.useAuthRequest> | null = null;

export function useGoogleRequest() {
  const extra = (Constants?.expoConfig as any)?.extra || {};
  const google = (extra.oauth || {}).google || {};
  const cfg: any = {
    expoClientId: google.expoClientId,
    iosClientId: google.iosClientId,
    androidClientId: google.androidClientId,
    webClientId: google.webClientId,
    selectAccount: true,
  };
  const [request, response, promptAsync] = Google.useAuthRequest(cfg);
  googleInit = [request, response, promptAsync] as any;
  return { request, response, promptAsync };
}

export async function signInWithGoogleResponse(response: any) {
  const auth = getFirebaseAuth();
  // Response from Google.useAuthRequest
  // When successful, response.type === 'success' and response.authentication has idToken
  const idToken = (response as any)?.authentication?.idToken;
  if (!idToken) throw new Error('Google sign-in failed: missing idToken');
  const credential = GoogleAuthProvider.credential(idToken);
  return await signInWithCredential(auth, credential);
}

export function onAuth(cb: (u: User | null) => void) {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, cb);
}

export async function signOut() {
  const auth = getFirebaseAuth();
  await fbSignOut(auth);
}

export function isFirstSession(u: User | null) {
  if (!u) return false;
  const c = u.metadata.creationTime;
  const l = u.metadata.lastSignInTime;
  return !!c && !!l && c === l;
}
