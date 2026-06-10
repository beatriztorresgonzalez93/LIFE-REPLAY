import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim() ?? "";

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
      NSLocationWhenInUseUsageDescription:
        "Life Replay usa tu ubicación para recordar dónde pasó cada día.",
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
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
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
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Life Replay usa tu ubicación para recordar dónde pasó cada día.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl,
    supabaseAnonKey,
    groqApiKey,
  },
};

export default config;
