import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export function setRoleCookie(role) {
  if (typeof document === 'undefined') return;

  if (!role) {
    document.cookie = 'nakaam_user_role=; path=/; max-age=0; SameSite=Lax';
    return;
  }

  document.cookie = `nakaam_user_role=${role}; path=/; max-age=1209600; SameSite=Lax`;
}

export function clearRoleCookie() {
  setRoleCookie();
}

export function getSessionStatus({ session, isPending, error } = {}) {
  if (isPending) return 'initializing';
  if (error) return 'error';
  if (session) return 'authenticated';
  return 'unauthenticated';
}
