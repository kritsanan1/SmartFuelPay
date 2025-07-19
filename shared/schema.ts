import { pgTable, text, serial, integer, timestamp, decimal, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // pending, success, failed, timeout
  pumpNumber: text("pump_number").notNull().default("03"),
  fuelType: text("fuel_type").notNull().default("Gasohol 95"),
  pricePerLiter: decimal("price_per_liter", { precision: 10, scale: 2 }).notNull().default("35.50"),
  estimatedVolume: decimal("estimated_volume", { precision: 10, scale: 2 }).notNull(),
  qrCodeData: text("qr_code_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTransactionSchema = insertTransactionSchema.partial().extend({
  id: z.number(),
});

// Vehicle Management Schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  licensePlate: text("license_plate").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin"),
  color: text("color"),
  fuelType: text("fuel_type").notNull().default("Gasoline"),
  mileage: integer("mileage").notNull().default(0),
  ownerName: text("owner_name").notNull(),
  ownerPhone: text("owner_phone"),
  ownerEmail: text("owner_email"),
  registrationExpiry: date("registration_expiry"),
  insuranceExpiry: date("insurance_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Types Schema
export const maintenanceTypes = pgTable("maintenance_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // engine, transmission, brakes, tires, electrical, etc.
  intervalType: text("interval_type").notNull(), // mileage, time, both
  intervalMileage: integer("interval_mileage"), // miles between service
  intervalMonths: integer("interval_months"), // months between service
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Maintenance Records Schema
export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  maintenanceTypeId: integer("maintenance_type_id").references(() => maintenanceTypes.id).notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  completedDate: date("completed_date"),
  mileageAtService: integer("mileage_at_service"),
  nextServiceMileage: integer("next_service_mileage"),
  nextServiceDate: date("next_service_date"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  serviceProvider: text("service_provider"),
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, overdue, cancelled
  reminderSent: boolean("reminder_sent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Reminders Schema
export const maintenanceReminders = pgTable("maintenance_reminders", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  maintenanceTypeId: integer("maintenance_type_id").references(() => maintenanceTypes.id).notNull(),
  reminderType: text("reminder_type").notNull(), // upcoming, overdue, urgent
  reminderDate: date("reminder_date").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceTypeSchema = createInsertSchema(maintenanceTypes).omit({
  id: true,
  createdAt: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceReminderSchema = createInsertSchema(maintenanceReminders).omit({
  id: true,
  createdAt: true,
});

export const updateVehicleSchema = insertVehicleSchema.partial().extend({
  id: z.number(),
});

export const updateMaintenanceRecordSchema = insertMaintenanceRecordSchema.partial().extend({
  id: z.number(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;

export type MaintenanceType = typeof maintenanceTypes.$inferSelect;
export type InsertMaintenanceType = z.infer<typeof insertMaintenanceTypeSchema>;

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;
export type UpdateMaintenanceRecord = z.infer<typeof updateMaintenanceRecordSchema>;

export type MaintenanceReminder = typeof maintenanceReminders.$inferSelect;
export type InsertMaintenanceReminder = z.infer<typeof insertMaintenanceReminderSchema>;
