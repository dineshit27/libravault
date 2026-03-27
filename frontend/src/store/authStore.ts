import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import type { Profile, UserRole } from '../types';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<UserRole>;
  loginAsGuest: (role: UserRole) => void;
  register: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole,
    adminInviteCode?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

function isGuestProfile(user: Profile | null): boolean {
  return !!user?.id?.startsWith('guest-');
}

function normalizeRole(rawRole: unknown): UserRole {
  if (typeof rawRole !== 'string') return 'user';
  const role = rawRole.trim().toLowerCase();
  return role === 'admin' ? 'admin' : 'user';
}

async function readRoleFromBackend(): Promise<UserRole | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return null;

    const response = await fetch('/api/node/auth/me-role', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const payload = await response.json() as { role?: unknown };
    if (typeof payload.role !== 'string') return null;
    return normalizeRole(payload.role);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      role: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          role: user ? normalizeRole(user.role) : null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await get().fetchProfile();
        const role = get().role;
        if (!role) {
          throw new Error('Unable to resolve user role after login');
        }
        return role;
      },

      loginAsGuest: (role) => {
        const now = new Date().toISOString();
        const guestId = role === 'admin' ? 'guest-admin' : 'guest-user';
        const guestProfile: Profile = {
          id: guestId,
          full_name: role === 'admin' ? 'Guest Admin' : 'Guest User',
          avatar_url: null,
          email: role === 'admin' ? 'guest-admin@local' : 'guest-user@local',
          role,
          membership_number: role === 'admin' ? 'GUEST-ADMIN' : 'GUEST-USER',
          phone: null,
          address: null,
          is_active: true,
          created_at: now,
          updated_at: now,
        };
        set({
          user: guestProfile,
          isAuthenticated: true,
          role,
          isLoading: false,
        });
      },

      register: async (email, password, fullName, role = 'user', adminInviteCode) => {
        if (role === 'admin') {
          const response = await fetch('/api/node/auth/admin-register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              fullName,
              role,
              adminInviteCode,
            }),
          });

          const raw = await response.text();
          let result: { error?: string; message?: string } | null = null;
          if (raw) {
            try {
              result = JSON.parse(raw);
            } catch {
              throw new Error(`Admin registration failed: server returned non-JSON response (${response.status}).`);
            }
          }

          if (!response.ok) {
            throw new Error(result?.error || result?.message || `Admin registration failed (${response.status}).`);
          }

          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;
      },

      loginWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, role: null });
      },

      fetchProfile: async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (!authUser) {
            const current = get().user;
            if (isGuestProfile(current)) {
              set({ isAuthenticated: true, role: current!.role, isLoading: false });
              return;
            }
            set({ user: null, isAuthenticated: false, role: null, isLoading: false });
            return;
          }
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            const resolvedRole = normalizeRole((profile as Record<string, unknown>).role);
            set({
              user: {
                ...(profile as Profile),
                role: resolvedRole,
              },
              isAuthenticated: true,
              role: resolvedRole,
              isLoading: false,
            });
          } else {
            // When direct profile read fails (e.g. RLS/policy mismatch), ask backend to resolve role from DB.
            const backendRole = await readRoleFromBackend();
            const fallbackRole: UserRole = backendRole || 'user';
            const fallbackProfile: Profile = {
              id: authUser.id,
              full_name: authUser.user_metadata?.full_name || authUser.email || 'User',
              avatar_url: authUser.user_metadata?.avatar_url || null,
              email: authUser.email || '',
              role: fallbackRole,
              membership_number: authUser.user_metadata?.membership_number || `TEMP-${authUser.id.slice(0, 6).toUpperCase()}`,
              phone: null,
              address: null,
              is_active: true,
              created_at: authUser.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set({
              user: fallbackProfile,
              isAuthenticated: true,
              role: fallbackRole,
              isLoading: false,
            });
          }
        } catch {
          const current = get().user;
          if (isGuestProfile(current)) {
            set({ isAuthenticated: true, role: current!.role, isLoading: false });
            return;
          }
          set({ user: null, isAuthenticated: false, role: null, isLoading: false });
        }
      },

      forgotPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      },
    }),
    {
      name: 'lms-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, role: state.role }),
    }
  )
);
