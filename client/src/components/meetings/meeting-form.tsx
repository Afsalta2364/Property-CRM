import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClients } from "@/hooks/use-clients";
import { useProperties } from "@/hooks/use-properties";
import { insertMeetingSchema, type InsertMeeting, type Meeting } from "@shared/schema";

interface MeetingFormProps {
  initialData?: Meeting;
  onSubmit: (data: InsertMeeting) => Promise<void>;
  onCancel: () => void;
}

export function MeetingForm({ initialData, onSubmit, onCancel }: MeetingFormProps) {
  const { clients } = useClients();
  const { properties } = useProperties();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InsertMeeting>({
    resolver: zodResolver(insertMeetingSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      clientId: undefined,
      propertyId: undefined,
      scheduledAt: new Date(),
      duration: 60,
      location: "",
      type: "property_viewing",
      status: "scheduled",
      externalClientName: "",
      externalClientEmail: "",
      externalClientPhone: "",
    },
  });

  const clientId = watch("clientId");
  const propertyId = watch("propertyId");
  const type = watch("type");
  const status = watch("status");

  const onFormSubmit = async (data: InsertMeeting) => {
    // If using existing client, clear external client fields
    if (data.clientId) {
      data.externalClientName = "";
      data.externalClientEmail = "";
      data.externalClientPhone = "";
    } else {
      // If using external client, clear clientId
      data.clientId = undefined;
    }
    
    await onSubmit(data);
  };

  const formatDateTimeLocal = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div>
        <Label htmlFor="title">Meeting Title *</Label>
        <Input
          id="title"
          {...register("title")}
          className="mt-1"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scheduledAt">Date & Time *</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            {...register("scheduledAt", {
              setValueAs: (value) => new Date(value),
            })}
            defaultValue={formatDateTimeLocal(initialData?.scheduledAt || new Date())}
            className="mt-1"
          />
          {errors.scheduledAt && (
            <p className="text-sm text-red-600 mt-1">{errors.scheduledAt.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="15"
            step="15"
            {...register("duration", { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.duration && (
            <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Meeting Type *</Label>
          <Select value={type} onValueChange={(value) => setValue("type", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="property_viewing">Property Viewing</SelectItem>
              <SelectItem value="contract_discussion">Contract Discussion</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(value) => setValue("status", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register("location")}
          className="mt-1"
        />
        {errors.location && (
          <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="propertyId">Related Property</Label>
        <Select value={propertyId?.toString() || ""} onValueChange={(value) => setValue("propertyId", value ? parseInt(value) : undefined)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a property (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No property</SelectItem>
            {properties?.map((property) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.propertyId && (
          <p className="text-sm text-red-600 mt-1">{errors.propertyId.message}</p>
        )}
      </div>

      {/* Client Selection Tabs */}
      <div>
        <Label className="text-base font-medium">Client Information *</Label>
        <Tabs defaultValue="existing" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Client</TabsTrigger>
            <TabsTrigger value="external">External Client</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="space-y-4">
            <div>
              <Label htmlFor="clientId">Select Client</Label>
              <Select value={clientId?.toString() || ""} onValueChange={(value) => setValue("clientId", value ? parseInt(value) : undefined)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-600 mt-1">{errors.clientId.message}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="external" className="space-y-4">
            <div>
              <Label htmlFor="externalClientName">Client Name</Label>
              <Input
                id="externalClientName"
                {...register("externalClientName")}
                className="mt-1"
              />
              {errors.externalClientName && (
                <p className="text-sm text-red-600 mt-1">{errors.externalClientName.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="externalClientEmail">Email</Label>
                <Input
                  id="externalClientEmail"
                  type="email"
                  {...register("externalClientEmail")}
                  className="mt-1"
                />
                {errors.externalClientEmail && (
                  <p className="text-sm text-red-600 mt-1">{errors.externalClientEmail.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="externalClientPhone">Phone</Label>
                <Input
                  id="externalClientPhone"
                  type="tel"
                  {...register("externalClientPhone")}
                  className="mt-1"
                />
                {errors.externalClientPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.externalClientPhone.message}</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
          {isSubmitting ? "Saving..." : initialData ? "Update Meeting" : "Schedule Meeting"}
        </Button>
      </div>
    </form>
  );
}
