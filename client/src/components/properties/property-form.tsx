import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients } from "@/hooks/use-clients";
import { insertPropertySchema, type InsertProperty, type Property } from "@shared/schema";

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: InsertProperty) => Promise<void>;
  onCancel: () => void;
}

export function PropertyForm({ initialData, onSubmit, onCancel }: PropertyFormProps) {
  const { clients } = useClients();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InsertProperty>({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: initialData || {
      title: "",
      address: "",
      price: "",
      bedrooms: undefined,
      bathrooms: undefined,
      propertyType: "residential",
      status: "listed",
      clientId: undefined,
      description: "",
      imageUrl: "",
    },
  });

  const propertyType = watch("propertyType");
  const status = watch("status");
  const clientId = watch("clientId");

  const onFormSubmit = async (data: InsertProperty) => {
    // Convert price to string and handle optional numeric fields
    const formattedData = {
      ...data,
      price: data.price.toString(),
      bedrooms: data.bedrooms || undefined,
      bathrooms: data.bathrooms || undefined,
      clientId: data.clientId || undefined,
    };
    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Property Title *</Label>
          <Input
            id="title"
            {...register("title")}
            className="mt-1"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price")}
            className="mt-1"
          />
          {errors.price && (
            <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          {...register("address")}
          className="mt-1"
        />
        {errors.address && (
          <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            {...register("bedrooms", { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.bedrooms && (
            <p className="text-sm text-red-600 mt-1">{errors.bedrooms.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            step="0.5"
            {...register("bathrooms", { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.bathrooms && (
            <p className="text-sm text-red-600 mt-1">{errors.bathrooms.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyType">Property Type *</Label>
          <Select value={propertyType} onValueChange={(value) => setValue("propertyType", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
          {errors.propertyType && (
            <p className="text-sm text-red-600 mt-1">{errors.propertyType.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(value) => setValue("status", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="listed">Listed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="clientId">Client</Label>
        <Select value={clientId?.toString() || ""} onValueChange={(value) => setValue("clientId", value ? parseInt(value) : undefined)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a client (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No client assigned</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clientId && (
          <p className="text-sm text-red-600 mt-1">{errors.clientId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          {...register("imageUrl")}
          className="mt-1"
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          className="mt-1"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Property" : "Save Property"}
        </Button>
      </div>
    </form>
  );
}
