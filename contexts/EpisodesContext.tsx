import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { loadEpisodes, saveEpisodes, deleteEpisode } from "@/lib/data";
import { groupEpisodesIntoSeasons } from "@/lib/seasons";
import type { Episode } from "@/lib/types";

type EpisodesContextValue = {
  episodes: Episode[];
  seasons: ReturnType<typeof groupEpisodesIntoSeasons>;
  ready: boolean;
  refresh: () => Promise<Episode[]>;
  setEpisodes: (episodes: Episode[]) => void;
  persist: (next: Episode[]) => Promise<void>;
  removeEpisode: (episodeId: string) => Promise<Episode[]>;
};

const EpisodesContext = createContext<EpisodesContextValue | null>(null);

export function EpisodesProvider({ children }: { children: ReactNode }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [ready, setReady] = useState(false);
  const episodesRef = useRef(episodes);
  episodesRef.current = episodes;

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

  const removeEpisode = useCallback(async (episodeId: string) => {
    const result = await deleteEpisode(episodeId, episodesRef.current);
    setEpisodes(result.episodes);
    return result;
  }, []);

  const seasons = useMemo(
    () => groupEpisodesIntoSeasons(episodes),
    [episodes]
  );

  const value = useMemo(
    () => ({
      episodes,
      seasons,
      ready,
      refresh,
      setEpisodes,
      persist,
      removeEpisode,
    }),
    [episodes, seasons, ready, refresh, persist, removeEpisode]
  );

  return (
    <EpisodesContext.Provider value={value}>{children}</EpisodesContext.Provider>
  );
}

export function useEpisodes() {
  const ctx = useContext(EpisodesContext);
  if (!ctx) {
    throw new Error("useEpisodes debe usarse dentro de EpisodesProvider");
  }
  return ctx;
}
