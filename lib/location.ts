import { Platform } from "react-native";
import * as Location from "expo-location";

export type EpisodeLocation = {
  latitude: number;
  longitude: number;
  name?: string;
};

type LocationFetchResult =
  | { ok: true; location: EpisodeLocation }
  | { ok: false; reason: "denied" | "services_off" | "unavailable" };

let cachedLocation: EpisodeLocation | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

function formatAddress(address: Location.LocationGeocodedAddress): string | undefined {
  const parts = [address.street, address.city].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  const fallback = [address.district, address.region, address.country].filter(Boolean);
  return fallback.length > 0 ? fallback.join(", ") : undefined;
}

function rememberLocation(location: EpisodeLocation) {
  cachedLocation = location;
  cachedAt = Date.now();
}

async function readPosition(): Promise<Location.LocationObject | null> {
  const options: Location.LocationOptions = {
    accuracy: Location.Accuracy.Balanced,
  };
  if (Platform.OS === "android") {
    options.mayShowUserSettingsDialog = true;
  }

  try {
    return await Location.getCurrentPositionAsync(options);
  } catch (error) {
    console.warn("[readPosition] getCurrentPosition:", error);
  }

  try {
    return await Location.getLastKnownPositionAsync({ maxAge: 120_000 });
  } catch (error) {
    console.warn("[readPosition] getLastKnownPosition:", error);
  }

  return null;
}

async function fetchLocationAfterPermission(): Promise<LocationFetchResult> {
  const position = await readPosition();
  if (!position) {
    return { ok: false, reason: "unavailable" };
  }

  let name: string | undefined;
  try {
    const [address] = await Location.reverseGeocodeAsync(position.coords);
    if (address) name = formatAddress(address);
  } catch (geocodeError) {
    console.warn("[fetchLocationAfterPermission] geocodificación:", geocodeError);
  }

  const location = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    name,
  };
  rememberLocation(location);
  return { ok: true, location };
}

/** Pide permiso al abrir la app y precarga la ubicación si el usuario acepta. */
export async function requestLocationPermissionOnLaunch(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    await fetchLocationAfterPermission();
  } catch (error) {
    console.warn("[requestLocationPermissionOnLaunch]", error);
  }
}

/** Lee GPS actual (o caché reciente) para guardar en un episodio. */
export async function getLocationForEpisode(): Promise<EpisodeLocation | null> {
  if (Platform.OS === "web") return null;

  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return getRecentCachedLocation();
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      return getRecentCachedLocation();
    }

    const result = await fetchLocationAfterPermission();
    if (result.ok) return result.location;
    return getRecentCachedLocation();
  } catch (error) {
    console.warn("[getLocationForEpisode]", error);
    return getRecentCachedLocation();
  }
}

function getRecentCachedLocation(): EpisodeLocation | null {
  if (!cachedLocation || Date.now() - cachedAt > CACHE_TTL_MS) return null;
  return cachedLocation;
}

export function formatEpisodeLocation(episode: {
  latitude?: number;
  longitude?: number;
  locationName?: string;
}): string | null {
  if (episode.locationName?.trim()) return episode.locationName.trim();
  if (episode.latitude != null && episode.longitude != null) {
    return `${episode.latitude.toFixed(4)}, ${episode.longitude.toFixed(4)}`;
  }
  return null;
}
