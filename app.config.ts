import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ?? "";
const firebaseAuthDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
const firebaseStorageBucket =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
const firebaseMessagingSenderId =
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
const firebaseAppId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() ?? "";

const config: ExpoConfig = {
  name: "Life Replay",
  slug: "life-replay",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "lifereplay",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#07070a",
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription:
        "Life Replay necesita la cámara para tomar la foto del día.",
      NSPhotoLibraryUsageDescription:
        "Life Replay necesita acceso a tus fotos para elegir la imagen del episodio.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#07070a",
    },
    edgeToEdgeEnabled: true,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_MEDIA_IMAGES",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Life Replay necesita acceso a tus fotos para guardar episodios.",
        cameraPermission:
          "Life Replay necesita la cámara para tomar la foto del día.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl,
    supabaseAnonKey,
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
  },
};

export default config;
