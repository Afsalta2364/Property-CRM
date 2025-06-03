import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Meeting, InsertMeeting } from "@shared/schema";

export function useMeetings() {
  const query = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  const createMeeting = useMutation({
    mutationFn: async (data: InsertMeeting) => {
      const response = await apiRequest("POST", "/api/meetings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
    },
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertMeeting> }) => {
      const response = await apiRequest("PUT", `/api/meetings/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
    },
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/meetings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
    },
  });

  return {
    meetings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  };
}

export function useMeetingsByDateRange(startDate: Date, endDate: Date) {
  return useQuery<Meeting[]>({
    queryKey: ["/api/meetings", { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const response = await fetch(`/api/meetings?${params}`);
      if (!response.ok) throw new Error("Failed to fetch meetings");
      return response.json();
    },
  });
}
