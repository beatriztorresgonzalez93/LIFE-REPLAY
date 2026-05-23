import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";
import { Field } from "@/components/ui/Field";
import { Kicker } from "@/components/ui/Kicker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, spacing } from "@/lib/theme";

type Mode = "login" | "register";

const AUTH_MODES: { value: Mode; label: string }[] = [
  { value: "login", label: "Iniciar sesión" },
  { value: "register", label: "Registro" },
];

export default function LoginScreen() {
  const { signInEmail, signUpEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    if (next === "login") {
      setConfirmPassword("");
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en .env");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenContainer scroll keyboardAware contentStyle={styles.content}>
        <Kicker variant="brand">LIFE REPLAY</Kicker>

        <SegmentedControl value={mode} options={AUTH_MODES} onChange={switchMode} />

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

        {error ? <ErrorText>{error}</ErrorText> : null}

        <Button
          title={mode === "login" ? "Entrar" : "Crear cuenta"}
          onPress={handleSubmit}
          loading={loading}
        />
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    maxWidth: 420,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 3,
    gap: spacing.md,
    justifyContent: "center",
  },
});
