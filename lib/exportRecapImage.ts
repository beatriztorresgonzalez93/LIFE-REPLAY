import { Platform, Alert } from "react-native";
import type { RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

function downloadDataUrlOnWeb(dataUri: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Captura un View (SeasonRecapPoster) y lo descarga o abre el menú compartir.
 */
export async function exportRecapPoster(
  viewRef: RefObject<View | null>,
  year: number
) {
  if (!viewRef.current) {
    throw new Error("No se pudo preparar la imagen del recap.");
  }

  await new Promise((r) => setTimeout(r, 400));

  const filename = `life-replay-temporada-${year}.png`;

  if (Platform.OS === "web") {
    const dataUri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "data-uri",
    });
    downloadDataUrlOnWeb(dataUri, filename);
    return;
  }

  const uri = await captureRef(viewRef, {
    format: "png",
    quality: 1,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: "Guardar recap de temporada",
      UTI: "public.png",
    });
    return;
  }

  Alert.alert("Imagen lista", "El recap se guardó en la app. URI: " + uri);
}
