import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { syncFirebaseUserWithDatabase, signOutSupabase } from "@/lib/auth";

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  authReady: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(isFirebaseConfigured());
  const [linkingSupabase, setLinkingSupabase] = useState(false);

  const syncSupabase = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      await signOutSupabase();
      return;
    }
    setLinkingSupabase(true);
    try {
      await syncFirebaseUserWithDatabase(firebaseUser);
    } finally {
      setLinkingSupabase(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setInitializing(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      try {
        await syncSupabase(nextUser);
      } catch (error) {
        console.warn("[Auth] sync Supabase:", error);
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, [syncSupabase]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await syncFirebaseUserWithDatabase(cred.user);
  }, []);

  const signUpEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      if (displayName?.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      await syncFirebaseUserWithDatabase(cred.user);
    },
    []
  );

  const signInGoogle = useCallback(async () => {
    if (Platform.OS !== "web") {
      throw new Error("Google solo está disponible en la versión web por ahora.");
    }
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await syncFirebaseUserWithDatabase(cred.user);
  }, []);

  const signOut = useCallback(async () => {
    await signOutSupabase();
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing: initializing || linkingSupabase,
      authReady: !isFirebaseConfigured() || (!initializing && !linkingSupabase),
      signInEmail,
      signUpEmail,
      signInGoogle,
      signOut,
    }),
    [
      user,
      initializing,
      linkingSupabase,
      signInEmail,
      signUpEmail,
      signInGoogle,
      signOut,
    ]
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
