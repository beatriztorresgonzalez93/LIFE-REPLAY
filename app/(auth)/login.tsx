import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, spacing } from "@/lib/theme";

type Mode = "login" | "register";

export default function LoginScreen() {
  const { signInEmail, signUpEmail, initializing } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Configura EXPO_PUBLIC_SUPABASE_URL y ANON_KEY en .env");
      return;
    }
    if (!email.trim() || !password) {
      setError("Introduce email y contraseña.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password, displayName);
      }
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al autenticar");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.kicker}>LIFE REPLAY</Text>
          <Text style={styles.title}>
            {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </Text>
          <Text style={styles.subtitle}>
            Cuenta con email y contraseña (Supabase Auth). Tus episodios y fotos
            quedan en tu usuario.
          </Text>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, mode === "login" && styles.tabActive]}
              onPress={() => setMode("login")}
            >
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
                Entrar
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === "register" && styles.tabActive]}
              onPress={() => setMode("register")}
            >
              <Text
                style={[styles.tabText, mode === "register" && styles.tabTextActive]}
              >
                Registro
              </Text>
            </Pressable>
          </View>

          {mode === "register" ? (
            <Field
              label="Nombre (opcional)"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Beatriz"
              autoCapitalize="words"
            />
          ) : null}

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoComplete={mode === "login" ? "password" : "new-password"}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={mode === "login" ? "Entrar" : "Crear cuenta"}
            onPress={handleSubmit}
            loading={loading}
          />

          <Text style={styles.hint}>
            En Supabase: Authentication → Providers → Email activado. Si el
            registro pide confirmar email, revisa tu bandeja o desactiva
            “Confirm email” en Supabase para pruebas.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: "center",
  },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
  },
  title: { color: colors.foreground, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: spacing.sm },
  tabs: { flexDirection: "row", gap: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  tabActive: { borderColor: colors.accent, backgroundColor: colors.surface },
  tabText: { color: colors.muted, fontWeight: "600" },
  tabTextActive: { color: colors.foreground },
  error: { color: "#f87171", fontSize: 13 },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: spacing.sm },
});
