import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { ensureUserProfile } from "@/lib/auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setInitializing(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setInitializing(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setInitializing(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase no configurado");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      await ensureUserProfile(
        data.user.id,
        data.user.user_metadata?.display_name ?? data.user.email
      );
    }
  }, []);

  const signUpEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase no configurado");

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName?.trim() || "Usuario Life Replay",
          },
        },
      });
      if (error) throw new Error(error.message);
      if (data.user) {
        await ensureUserProfile(
          data.user.id,
          displayName?.trim() || data.user.email || "Usuario Life Replay"
        );
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      initializing,
      signInEmail,
      signUpEmail,
      signOut,
    }),
    [user, session, initializing, signInEmail, signUpEmail, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
