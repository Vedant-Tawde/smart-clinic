import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboard() {
  return useQuery({
    queryKey: [api.dashboard.data.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.data.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();
      return api.dashboard.data.responses[200].parse(data);
    },
    // Refresh dashboard data frequently for real-time feel
    refetchInterval: 5000, 
  });
}

export function useLoadBalanceSuggestions() {
  return useQuery({
    queryKey: [api.dashboard.loadBalanceSuggestions.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.loadBalanceSuggestions.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      return api.dashboard.loadBalanceSuggestions.responses[200].parse(data);
    },
    refetchInterval: 15000,
  });
}
