import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useWalkIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.patients.walkin.input>) => {
      const res = await fetch(api.patients.walkin.path, {
        method: api.patients.walkin.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.patients.walkin.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to register walk-in patient");
      }
      return api.patients.walkin.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dashboard.data.path] });
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.patients.list.path] });
    },
  });
}

export function useSearchPatients(query: string) {
  return useQuery({
    queryKey: [api.patients.search.path, query],
    queryFn: async () => {
      if (!query) return [];
      const url = `${api.patients.search.path}?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Search failed");
      return api.patients.search.responses[200].parse(await res.json());
    },
    enabled: query.length > 1,
  });
}
