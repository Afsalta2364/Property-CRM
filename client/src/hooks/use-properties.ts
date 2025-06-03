import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Property, InsertProperty } from "@shared/schema";

export function useProperties() {
  const query = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const createProperty = useMutation({
    mutationFn: async (data: InsertProperty) => {
      const response = await apiRequest("POST", "/api/properties", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProperty> }) => {
      const response = await apiRequest("PUT", `/api/properties/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  return {
    properties: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}

export function usePropertiesByClient(clientId: number) {
  return useQuery<Property[]>({
    queryKey: ["/api/clients", clientId, "properties"],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}/properties`);
      if (!response.ok) throw new Error("Failed to fetch client properties");
      return response.json();
    },
  });
}
