import { 
  users, transactions, vehicles, maintenanceTypes, maintenanceRecords, maintenanceReminders,
  type User, type InsertUser, type Transaction, type InsertTransaction, type UpdateTransaction,
  type Vehicle, type InsertVehicle, type UpdateVehicle,
  type MaintenanceType, type InsertMaintenanceType,
  type MaintenanceRecord, type InsertMaintenanceRecord, type UpdateMaintenanceRecord,
  type MaintenanceReminder, type InsertMaintenanceReminder
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  updateTransaction(transaction: UpdateTransaction): Promise<Transaction | undefined>;
  getRecentTransactions(limit: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;

  // Vehicle Management
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined>;
  updateVehicle(vehicle: UpdateVehicle): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  deleteVehicle(id: number): Promise<boolean>;

  // Maintenance Types
  createMaintenanceType(type: InsertMaintenanceType): Promise<MaintenanceType>;
  getMaintenanceType(id: number): Promise<MaintenanceType | undefined>;
  getAllMaintenanceTypes(): Promise<MaintenanceType[]>;
  getActiveMaintenanceTypes(): Promise<MaintenanceType[]>;

  // Maintenance Records
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  updateMaintenanceRecord(record: UpdateMaintenanceRecord): Promise<MaintenanceRecord | undefined>;
  getMaintenanceRecordsByVehicle(vehicleId: number): Promise<MaintenanceRecord[]>;
  getUpcomingMaintenance(daysAhead?: number): Promise<MaintenanceRecord[]>;
  getOverdueMaintenance(): Promise<MaintenanceRecord[]>;

  // Maintenance Reminders
  createMaintenanceReminder(reminder: InsertMaintenanceReminder): Promise<MaintenanceReminder>;
  getMaintenanceReminder(id: number): Promise<MaintenanceReminder | undefined>;
  getActiveReminders(): Promise<MaintenanceReminder[]>;
  markReminderAsRead(id: number): Promise<boolean>;
  dismissReminder(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.transactionId, transactionId));
    return transaction || undefined;
  }

  async updateTransaction(updateTransaction: UpdateTransaction): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(updateTransaction)
      .where(eq(transactions.id, updateTransaction.id))
      .returning();
    return transaction || undefined;
  }

  async getRecentTransactions(limit: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
  }

  // Vehicle Management Implementation
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.licensePlate, licensePlate));
    return vehicle || undefined;
  }

  async updateVehicle(updateVehicle: UpdateVehicle): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updateVehicle)
      .where(eq(vehicles.id, updateVehicle.id))
      .returning();
    return vehicle || undefined;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.createdAt));
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount > 0;
  }

  // Maintenance Types Implementation
  async createMaintenanceType(insertType: InsertMaintenanceType): Promise<MaintenanceType> {
    const [type] = await db
      .insert(maintenanceTypes)
      .values(insertType)
      .returning();
    return type;
  }

  async getMaintenanceType(id: number): Promise<MaintenanceType | undefined> {
    const [type] = await db.select().from(maintenanceTypes).where(eq(maintenanceTypes.id, id));
    return type || undefined;
  }

  async getAllMaintenanceTypes(): Promise<MaintenanceType[]> {
    return await db
      .select()
      .from(maintenanceTypes)
      .orderBy(maintenanceTypes.category, maintenanceTypes.name);
  }

  async getActiveMaintenanceTypes(): Promise<MaintenanceType[]> {
    return await db
      .select()
      .from(maintenanceTypes)
      .where(eq(maintenanceTypes.isActive, true))
      .orderBy(maintenanceTypes.category, maintenanceTypes.name);
  }

  // Maintenance Records Implementation
  async createMaintenanceRecord(insertRecord: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [record] = await db
      .insert(maintenanceRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record || undefined;
  }

  async updateMaintenanceRecord(updateRecord: UpdateMaintenanceRecord): Promise<MaintenanceRecord | undefined> {
    const [record] = await db
      .update(maintenanceRecords)
      .set(updateRecord)
      .where(eq(maintenanceRecords.id, updateRecord.id))
      .returning();
    return record || undefined;
  }

  async getMaintenanceRecordsByVehicle(vehicleId: number): Promise<MaintenanceRecord[]> {
    return await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.vehicleId, vehicleId))
      .orderBy(desc(maintenanceRecords.scheduledDate));
  }

  async getUpcomingMaintenance(daysAhead: number = 30): Promise<MaintenanceRecord[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.status, 'scheduled'))
      .orderBy(maintenanceRecords.scheduledDate);
  }

  async getOverdueMaintenance(): Promise<MaintenanceRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.status, 'scheduled'))
      .orderBy(maintenanceRecords.scheduledDate);
  }

  // Maintenance Reminders Implementation
  async createMaintenanceReminder(insertReminder: InsertMaintenanceReminder): Promise<MaintenanceReminder> {
    const [reminder] = await db
      .insert(maintenanceReminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async getMaintenanceReminder(id: number): Promise<MaintenanceReminder | undefined> {
    const [reminder] = await db.select().from(maintenanceReminders).where(eq(maintenanceReminders.id, id));
    return reminder || undefined;
  }

  async getActiveReminders(): Promise<MaintenanceReminder[]> {
    return await db
      .select()
      .from(maintenanceReminders)
      .where(eq(maintenanceReminders.isDismissed, false))
      .orderBy(desc(maintenanceReminders.priority), desc(maintenanceReminders.createdAt));
  }

  async markReminderAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(maintenanceReminders)
      .set({ isRead: true })
      .where(eq(maintenanceReminders.id, id));
    return result.rowCount > 0;
  }

  async dismissReminder(id: number): Promise<boolean> {
    const result = await db
      .update(maintenanceReminders)
      .set({ isDismissed: true })
      .where(eq(maintenanceReminders.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
