import Constants from "expo-constants";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  type Auth,
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  EMBEDDED_FIREBASE_API_KEY,
  EMBEDDED_FIREBASE_APP_ID,
  EMBEDDED_FIREBASE_AUTH_DOMAIN,
  EMBEDDED_FIREBASE_MESSAGING_SENDER_ID,
  EMBEDDED_FIREBASE_PROJECT_ID,
  EMBEDDED_FIREBASE_STORAGE_BUCKET,
} from "./env.generated";

function firstNonEmpty(...values: (string | undefined)[]) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export function getFirebaseConfig(): FirebasePublicConfig {
  const extra = Constants.expoConfig?.extra as
    | {
        firebaseApiKey?: string;
        firebaseAuthDomain?: string;
        firebaseProjectId?: string;
        firebaseStorageBucket?: string;
        firebaseMessagingSenderId?: string;
        firebaseAppId?: string;
      }
    | undefined;

  return {
    apiKey: firstNonEmpty(
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      extra?.firebaseApiKey,
      EMBEDDED_FIREBASE_API_KEY
    ),
    authDomain: firstNonEmpty(
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      extra?.firebaseAuthDomain,
      EMBEDDED_FIREBASE_AUTH_DOMAIN
    ),
    projectId: firstNonEmpty(
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      extra?.firebaseProjectId,
      EMBEDDED_FIREBASE_PROJECT_ID
    ),
    storageBucket: firstNonEmpty(
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      extra?.firebaseStorageBucket,
      EMBEDDED_FIREBASE_STORAGE_BUCKET
    ),
    messagingSenderId: firstNonEmpty(
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      extra?.firebaseMessagingSenderId,
      EMBEDDED_FIREBASE_MESSAGING_SENDER_ID
    ),
    appId: firstNonEmpty(
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      extra?.firebaseAppId,
      EMBEDDED_FIREBASE_APP_ID
    ),
  };
}

export function isFirebaseConfigured() {
  const { apiKey, projectId, authDomain, appId } = getFirebaseConfig();
  return Boolean(apiKey && projectId && authDomain && appId);
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  const config = getFirebaseConfig();
  firebaseApp = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) return firebaseAuth;

  const app = getFirebaseApp();

  if (Platform.OS === "web") {
    firebaseAuth = getAuth(app);
    return firebaseAuth;
  }

  try {
    firebaseAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}
