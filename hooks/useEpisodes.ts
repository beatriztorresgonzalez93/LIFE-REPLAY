import { useCallback, useEffect, useState } from "react";
import { loadEpisodes, saveEpisodes } from "@/lib/data";
import { groupEpisodesIntoSeasons } from "@/lib/seasons";
import type { Episode } from "@/lib/types";

export function useEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const data = await loadEpisodes();
    setEpisodes(data);
    setReady(true);
    return data;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback(async (next: Episode[]) => {
    setEpisodes(next);
    await saveEpisodes(next);
  }, []);

  const seasons = groupEpisodesIntoSeasons(episodes);

  return { episodes, seasons, ready, refresh, persist, setEpisodes };
}
