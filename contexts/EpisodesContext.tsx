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
import { useAuth } from "@/contexts/AuthContext";
import { loadEpisodes, deleteEpisode } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { groupEpisodesIntoSeasons } from "@/lib/seasons";
import type { Episode } from "@/lib/types";

type EpisodesContextValue = {
  episodes: Episode[];
  seasons: ReturnType<typeof groupEpisodesIntoSeasons>;
  ready: boolean;
  setEpisodes: (episodes: Episode[]) => void;
  removeEpisode: (episodeId: string) => Promise<{ episodes: Episode[]; deletedFromCloud: boolean }>;
};

const EpisodesContext = createContext<EpisodesContextValue | null>(null);

export function EpisodesProvider({ children }: { children: ReactNode }) {
  const { user, initializing: authLoading } = useAuth();
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
    if (isSupabaseConfigured() && (authLoading || !user)) {
      setEpisodes([]);
      setReady(false);
      return;
    }
    refresh();
  }, [refresh, user?.id, authLoading]);

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
      setEpisodes,
      removeEpisode,
    }),
    [episodes, seasons, ready, removeEpisode]
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
