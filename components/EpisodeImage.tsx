import { useEffect, useState } from "react";
import {
  Image,
  type ImageStyle,
  StyleSheet,
  View,
  type StyleProp,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DEFAULT_EPISODE_PHOTO, resolveEpisodePhotoUrl } from "@/lib/episodePhoto";
import { colors } from "@/lib/theme";

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
};

export function EpisodeImage({ uri, style }: Props) {
  const resolved = resolveEpisodePhotoUrl(uri);
  const [src, setSrc] = useState(resolved);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(resolveEpisodePhotoUrl(uri));
    setFailed(false);
  }, [uri]);

  if (failed) {
    return (
      <View style={[styles.placeholder, style]}>
        <FontAwesome name="image" size={28} color={colors.muted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src }}
      style={style}
      onError={() => {
        if (src !== DEFAULT_EPISODE_PHOTO) {
          setSrc(DEFAULT_EPISODE_PHOTO);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
