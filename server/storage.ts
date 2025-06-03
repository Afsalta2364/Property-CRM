import { 
  clients, 
  properties, 
  meetings, 
  users,
  customFields,
  type Client, 
  type InsertClient, 
  type Property, 
  type InsertProperty, 
  type Meeting, 
  type InsertMeeting, 
  type User, 
  type InsertUser,
  type CustomField,
  type InsertCustomField
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Property methods
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByClient(clientId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Meeting methods
  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingsByClient(clientId: number): Promise<Meeting[]>;
  getMeetingsByDateRange(startDate: Date, endDate: Date): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;

  // Custom fields methods
  getCustomFields(entityType: string): Promise<CustomField[]>;
  createCustomField(customField: InsertCustomField): Promise<CustomField>;
  updateCustomField(id: number, customField: Partial<InsertCustomField>): Promise<CustomField | undefined>;
  deleteCustomField(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private properties: Map<number, Property>;
  private meetings: Map<number, Meeting>;
  private customFields: Map<number, CustomField>;
  private currentUserId: number;
  private currentClientId: number;
  private currentPropertyId: number;
  private currentMeetingId: number;
  private currentCustomFieldId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.properties = new Map();
    this.meetings = new Map();
    this.customFields = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentPropertyId = 1;
    this.currentMeetingId = 1;
    this.currentCustomFieldId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = {
      ...insertClient,
      id,
      nationality: insertClient.nationality || null,
      phone: insertClient.phone || null,
      passportCopy: insertClient.passportCopy || null,
      emiratesId: insertClient.emiratesId || null,
      visaStatus: insertClient.visaStatus || null,
      source: insertClient.source || null,
      clientType: insertClient.clientType || null,
      notes: insertClient.notes || null,
      visaCopy: insertClient.visaCopy || null,
      company: insertClient.company || null,
      customFields: insertClient.customFields || null,
      status: insertClient.status || "active",
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;

    const updatedClient: Client = {
      ...existingClient,
      ...clientUpdate,
    };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Property methods
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertiesByClient(clientId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.clientId === clientId
    );
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      bedrooms: insertProperty.bedrooms || null,
      bathrooms: insertProperty.bathrooms || null,
      clientId: insertProperty.clientId || null,
      description: insertProperty.description || null,
      imageUrl: insertProperty.imageUrl || null,
      status: insertProperty.status || "listed",
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, propertyUpdate: Partial<InsertProperty>): Promise<Property | undefined> {
    const existingProperty = this.properties.get(id);
    if (!existingProperty) return undefined;

    const updatedProperty: Property = {
      ...existingProperty,
      ...propertyUpdate,
    };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Meeting methods
  async getMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort((a, b) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingsByClient(clientId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(
      (meeting) => meeting.clientId === clientId
    );
  }

  async getMeetingsByDateRange(startDate: Date, endDate: Date): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(
      (meeting) => {
        const meetingDate = new Date(meeting.scheduledAt);
        return meetingDate >= startDate && meetingDate <= endDate;
      }
    );
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentMeetingId++;
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      description: insertMeeting.description || null,
      clientId: insertMeeting.clientId || null,
      propertyId: insertMeeting.propertyId || null,
      duration: insertMeeting.duration || null,
      location: insertMeeting.location || null,
      externalClientName: insertMeeting.externalClientName || null,
      externalClientEmail: insertMeeting.externalClientEmail || null,
      externalClientPhone: insertMeeting.externalClientPhone || null,
      type: insertMeeting.type || "property_viewing",
      status: insertMeeting.status || "scheduled",
      createdAt: new Date(),
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meetingUpdate: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const existingMeeting = this.meetings.get(id);
    if (!existingMeeting) return undefined;

    const updatedMeeting: Meeting = {
      ...existingMeeting,
      ...meetingUpdate,
    };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetings.delete(id);
  }

  // Custom fields methods
  async getCustomFields(entityType: string): Promise<CustomField[]> {
    return Array.from(this.customFields.values()).filter(
      (field) => field.entityType === entityType
    );
  }

  async createCustomField(insertCustomField: InsertCustomField): Promise<CustomField> {
    const id = this.currentCustomFieldId++;
    const customField: CustomField = {
      ...insertCustomField,
      id,
      options: insertCustomField.options || null,
      required: insertCustomField.required || false,
      createdAt: new Date(),
    };
    this.customFields.set(id, customField);
    return customField;
  }

  async updateCustomField(id: number, customFieldUpdate: Partial<InsertCustomField>): Promise<CustomField | undefined> {
    const existingCustomField = this.customFields.get(id);
    if (!existingCustomField) return undefined;

    const updatedCustomField: CustomField = {
      ...existingCustomField,
      ...customFieldUpdate,
    };
    this.customFields.set(id, updatedCustomField);
    return updatedCustomField;
  }

  async deleteCustomField(id: number): Promise<boolean> {
    return this.customFields.delete(id);
  }
}

export const storage = new MemStorage();
