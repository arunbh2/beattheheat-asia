import { useQuery } from "@tanstack/react-query";
import { getCapitalsWeather, getForecast, getProfile } from "./api";
import type { CurrentWeather } from "../lib/contracts";
import { useMemo } from "react";

export function useCapitalsWeather() {
  const q = useQuery({ queryKey: ["weather", "capitals"], queryFn: getCapitalsWeather, refetchInterval: 25 * 60 * 1000, refetchOnWindowFocus: false, retry: 1, staleTime: 20 * 60 * 1000 });
  const byId = useMemo(() => new Map<string, CurrentWeather>((q.data?.records ?? []).map(r => [r.capitalId, r])), [q.data]);
  return { ...q, byId };
}
export const useForecast = (id: string | null) => useQuery({ queryKey: ["forecast", id], queryFn: () => getForecast(id!), enabled: !!id, staleTime: 25 * 60 * 1000, retry: 1 });
export const useProfile = (id: string | null) => useQuery({ queryKey: ["profile", id], queryFn: () => getProfile(id!), enabled: !!id, staleTime: 60 * 60 * 1000 });
