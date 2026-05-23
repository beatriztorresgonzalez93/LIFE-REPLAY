import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (mode === "register" && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>LIFE REPLAY</Text>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, mode === "login" && styles.tabActive]}
              onPress={() => {
                setMode("login");
                setConfirmPassword("");
                setError(null);
              }}
            >
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
                Iniciar sesión
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === "register" && styles.tabActive]}
              onPress={() => {
                setMode("register");
                setError(null);
              }}
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
          {mode === "register" ? (
            <Field
              label="Repite contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Vuelve a escribir la contraseña"
              secureTextEntry
              autoComplete="new-password"
            />
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={mode === "login" ? "Entrar" : "Crear cuenta"}
            onPress={handleSubmit}
            loading={loading}
          />
        </ScrollView>
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
    flexGrow: 1,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: spacing.xl * 3,
    gap: spacing.md,
    justifyContent: "center",
  },
  kicker: {
    color: colors.accent,
    fontSize: 22,
    letterSpacing: 4,
    fontWeight: "700",
  },
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
});
