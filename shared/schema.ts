import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nationality: text("nationality"),
  phone: text("phone"),
  email: text("email").notNull().unique(),
  passportCopy: text("passport_copy"), // file path/URL
  emiratesId: text("emirates_id"), // file path/URL
  visaStatus: text("visa_status"), // valid, expired, pending, not_required
  source: text("source"), // referral, website, social_media, direct
  clientType: text("client_type"), // buyer, seller, investor, tenant, landlord
  notes: text("notes"),
  visaCopy: text("visa_copy"), // file path/URL
  company: text("company"),
  status: text("status").notNull().default("active"), // active, inactive, prospect
  customFields: text("custom_fields"), // JSON string for dynamic fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  address: text("address").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  propertyType: text("property_type").notNull(), // residential, commercial, industrial
  status: text("status").notNull().default("listed"), // listed, pending, sold
  clientId: integer("client_id").references(() => clients.id),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: integer("client_id").references(() => clients.id),
  propertyId: integer("property_id").references(() => properties.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  location: text("location"),
  type: text("type").notNull().default("property_viewing"), // property_viewing, contract_discussion, consultation
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  externalClientName: text("external_client_name"), // for non-existing clients
  externalClientEmail: text("external_client_email"),
  externalClientPhone: text("external_client_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// Custom fields definition table
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(), // text, number, date, select, boolean, file
  options: text("options"), // JSON string for select options
  required: boolean("required").default(false),
  entityType: text("entity_type").notNull(), // client, property, meeting
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;
export type CustomField = typeof customFields.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
