import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Client, InsertClient } from "@shared/schema";

export function useClients() {
  const query = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createClient = useMutation({
    mutationFn: async (data: InsertClient) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertClient> }) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
  });

  return {
    clients: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createClient,
    updateClient,
    deleteClient,
  };
}
