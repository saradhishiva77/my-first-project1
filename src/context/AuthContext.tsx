import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile, type UserRole } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  role: UserRole | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    loading: true,
    role: null,
  });

  async function loadProfile(uid: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    return data as Profile | null;
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const session = data.session;
      if (session) {
        loadProfile(session.user.id).then((profile) => {
          if (!mounted) return;
          setState({
            session,
            profile,
            loading: false,
            role: (profile?.role ??
              (session.user.app_metadata?.role as UserRole) ??
              'user') as UserRole,
          });
        });
      } else {
        setState({ session: null, profile: null, loading: false, role: null });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          setState({ session: null, profile: null, loading: false, role: null });
          return;
        }
        const profile = await loadProfile(session.user.id);
        setState({
          session,
          profile,
          loading: false,
          role: (profile?.role ??
            (session.user.app_metadata?.role as UserRole) ??
            'user') as UserRole,
        });
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ session: null, profile: null, loading: false, role: null });
  };

  const refreshProfile = async () => {
    if (!state.session) return;
    const profile = await loadProfile(state.session.user.id);
    setState((s) => ({
      ...s,
      profile,
      role: (profile?.role ?? 'user') as UserRole,
    }));
  };

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
