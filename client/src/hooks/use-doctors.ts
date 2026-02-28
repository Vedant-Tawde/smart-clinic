import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useDoctors() {
  return useQuery({
    queryKey: [api.doctors.list.path],
    queryFn: async () => {
      const res = await fetch(api.doctors.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch doctors");
      return api.doctors.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.doctors.create.input>) => {
      const res = await fetch(api.doctors.create.path, {
        method: api.doctors.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.doctors.create.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to create doctor");
      }
      return api.doctors.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.data.path] });
    },
  });
}

export function useGiveBreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doctorId: number) => {
      const url = buildUrl(api.doctors.giveBreak.path, { id: doctorId });
      const res = await fetch(url, {
        method: api.doctors.giveBreak.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to give break");
      return api.doctors.giveBreak.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.doctors.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.data.path] });
    },
  });
}
