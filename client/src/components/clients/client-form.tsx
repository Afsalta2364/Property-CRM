import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { insertClientSchema, type InsertClient, type Client } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: InsertClient) => Promise<void>;
  onCancel: () => void;
}

export function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [newCustomField, setNewCustomField] = useState({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: "",
  });

  // Fetch custom fields for clients
  const { data: customFields } = useQuery({
    queryKey: ["/api/custom-fields", "client"],
    queryFn: async () => {
      const response = await fetch("/api/custom-fields/client");
      if (!response.ok) throw new Error("Failed to fetch custom fields");
      return response.json();
    },
  });

  // Create custom field mutation
  const createCustomField = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/custom-fields", {
        ...data,
        entityType: "client",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields", "client"] });
      setCustomFieldDialogOpen(false);
      setNewCustomField({ name: "", label: "", type: "text", required: false, options: "" });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: initialData || {
      name: "",
      nationality: "",
      phone: "",
      email: "",
      passportCopy: "",
      emiratesId: "",
      visaStatus: "not_required",
      source: "",
      clientType: "buyer",
      notes: "",
      visaCopy: "",
      company: "",
      status: "prospect",
      customFields: "",
    },
  });

  const status = watch("status");
  const visaStatus = watch("visaStatus");
  const clientType = watch("clientType");
  const source = watch("source");

  const handleFileUpload = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For demo purposes, we'll use a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue(field as any, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomField = async () => {
    if (newCustomField.name && newCustomField.label) {
      const fieldData = {
        ...newCustomField,
        options: newCustomField.type === "select" && newCustomField.options 
          ? JSON.stringify(newCustomField.options.split(",").map(opt => opt.trim()))
          : null
      };
      await createCustomField.mutateAsync(fieldData);
    }
  };

  const onFormSubmit = async (data: InsertClient) => {
    await onSubmit(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  {...register("nationality")}
                  className="mt-1"
                />
                {errors.nationality && (
                  <p className="text-sm text-red-600 mt-1">{errors.nationality.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className="mt-1"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...register("company")}
                className="mt-1"
              />
              {errors.company && (
                <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passportCopy">Passport Copy</Label>
                <div className="mt-1">
                  <Input
                    id="passportCopy"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload("passportCopy", e)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
                {errors.passportCopy && (
                  <p className="text-sm text-red-600 mt-1">{errors.passportCopy.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emiratesId">Emirates ID</Label>
                <div className="mt-1">
                  <Input
                    id="emiratesId"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload("emiratesId", e)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
                {errors.emiratesId && (
                  <p className="text-sm text-red-600 mt-1">{errors.emiratesId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visaStatus">Visa Status</Label>
                <Select value={visaStatus || undefined} onValueChange={(value) => setValue("visaStatus", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="not_required">Not Required</SelectItem>
                  </SelectContent>
                </Select>
                {errors.visaStatus && (
                  <p className="text-sm text-red-600 mt-1">{errors.visaStatus.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="visaCopy">Visa Copy</Label>
                <div className="mt-1">
                  <Input
                    id="visaCopy"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload("visaCopy", e)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
                {errors.visaCopy && (
                  <p className="text-sm text-red-600 mt-1">{errors.visaCopy.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Select value={source || undefined} onValueChange={(value) => setValue("source", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="direct">Direct Contact</SelectItem>
                  </SelectContent>
                </Select>
                {errors.source && (
                  <p className="text-sm text-red-600 mt-1">{errors.source.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="clientType">Type of Client</Label>
                <Select value={clientType || undefined} onValueChange={(value) => setValue("clientType", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="landlord">Landlord</SelectItem>
                  </SelectContent>
                </Select>
                {errors.clientType && (
                  <p className="text-sm text-red-600 mt-1">{errors.clientType.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                className="mt-1"
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Custom Fields</CardTitle>
            <Dialog open={customFieldDialogOpen} onOpenChange={setCustomFieldDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Custom Field</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Field</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fieldName">Field Name</Label>
                    <Input
                      id="fieldName"
                      value={newCustomField.name}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldLabel">Field Label</Label>
                    <Input
                      id="fieldLabel"
                      value={newCustomField.label}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, label: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldType">Field Type</Label>
                    <Select 
                      value={newCustomField.type} 
                      onValueChange={(value) => setNewCustomField(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newCustomField.type === "select" && (
                    <div>
                      <Label htmlFor="fieldOptions">Options (comma-separated)</Label>
                      <Input
                        id="fieldOptions"
                        value={newCustomField.options}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, options: e.target.value }))}
                        className="mt-1"
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCustomFieldDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddCustomField}
                      disabled={createCustomField.isPending}
                    >
                      {createCustomField.isPending ? "Adding..." : "Add Field"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {customFields && customFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customFields.map((field: any) => (
                  <div key={field.id}>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === "text" && (
                      <Input
                        id={field.name}
                        className="mt-1"
                      />
                    )}
                    {field.type === "number" && (
                      <Input
                        id={field.name}
                        type="number"
                        className="mt-1"
                      />
                    )}
                    {field.type === "date" && (
                      <Input
                        id={field.name}
                        type="date"
                        className="mt-1"
                      />
                    )}
                    {field.type === "file" && (
                      <div className="mt-1">
                        <Input
                          id={field.name}
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(`custom_${field.name}`, e)}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                        />
                      </div>
                    )}
                    {field.type === "boolean" && (
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {field.type === "select" && field.options && (
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {JSON.parse(field.options).map((option: string, index: number) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No custom fields defined. Add your first custom field to get started.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Client" : "Save Client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
