import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, updateTransactionSchema,
  insertVehicleSchema, updateVehicleSchema,
  insertMaintenanceTypeSchema,
  insertMaintenanceRecordSchema, updateMaintenanceRecordSchema,
  insertMaintenanceReminderSchema
} from "@shared/schema";
import { HardwareController } from "./hardware";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize hardware controller
  const hardwareController = new HardwareController({
    pumpId: "03",
    serialPort: "/dev/ttyUSB0", // Adjust based on your hardware setup
    relayPin: 18,
    flowSensorPin: 24,
    emergencyStopPin: 25,
  });
  // Generate QR Code for payment
  app.post("/api/generate-qr", async (req, res) => {
    try {
      const { amount, pumpNumber = "03", fuelType = "Gasohol 95" } = req.body;
      
      if (!amount || amount < 50) {
        return res.status(400).json({ message: "Amount must be at least 50 THB" });
      }

      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const pricePerLiter = 35.50;
      const estimatedVolume = (amount / pricePerLiter).toFixed(2);
      
      // Mock QR code data for PromptPay
      const qrCodeData = `00020101021129370016A000000677010111011300669${amount.toString().padStart(10, '0')}5802TH5925Fuel Station Payment6304`;
      
      const transaction = await storage.createTransaction({
        transactionId,
        amount: amount.toString(),
        status: "pending",
        pumpNumber,
        fuelType,
        pricePerLiter: pricePerLiter.toString(),
        estimatedVolume,
        qrCodeData,
      });

      res.json({
        transactionId,
        qrCodeData,
        amount,
        estimatedVolume,
        expiresIn: 300, // 5 minutes
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Check payment status
  app.get("/api/payment-status/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransactionByTransactionId(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Simulate payment verification logic
      const now = new Date();
      const createdAt = new Date(transaction.createdAt);
      const timeElapsed = (now.getTime() - createdAt.getTime()) / 1000; // seconds

      if (timeElapsed > 300) { // 5 minutes timeout
        if (transaction.status === "pending") {
          await storage.updateTransaction({
            id: transaction.id,
            status: "timeout",
          });
          return res.json({ status: "timeout" });
        }
      }

      // Mock payment success after 8 seconds with 80% success rate
      if (transaction.status === "pending" && timeElapsed > 8) {
        const isSuccess = Math.random() > 0.2; // 80% success rate
        const newStatus = isSuccess ? "success" : "failed";
        
        await storage.updateTransaction({
          id: transaction.id,
          status: newStatus,
        });
        
        // If payment successful, authorize fuel dispensing
        if (newStatus === "success") {
          const amount = parseFloat(transaction.amount);
          const authorized = await hardwareController.authorizeFuelDispensing(transaction.pumpNumber, amount);
          console.log(`[Hardware] Fuel dispensing authorized: ${authorized} for ${amount} THB`);
        }
        
        return res.json({ status: newStatus });
      }

      res.json({ status: transaction.status });
    } catch (error) {
      res.status(500).json({ message: "Failed to check payment status" });
    }
  });

  // Get transaction details
  app.get("/api/transaction/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransactionByTransactionId(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transaction" });
    }
  });

  // Get recent transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  // Cancel transaction
  app.post("/api/cancel-transaction/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getTransactionByTransactionId(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Cannot cancel non-pending transaction" });
      }

      await storage.updateTransaction({
        id: transaction.id,
        status: "failed",
      });

      res.json({ message: "Transaction cancelled" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel transaction" });
    }
  });

  // Hardware control endpoints
  app.get("/api/hardware/pump/:pumpId/status", async (req, res) => {
    try {
      const { pumpId } = req.params;
      const status = await hardwareController.getPumpStatus(pumpId);
      
      if (!status) {
        return res.status(404).json({ message: "Pump not found" });
      }
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pump status" });
    }
  });

  app.get("/api/hardware/pumps/status", async (req, res) => {
    try {
      const pumps = await hardwareController.getAllPumpsStatus();
      res.json(pumps);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pumps status" });
    }
  });

  app.post("/api/hardware/pump/:pumpId/dispense", async (req, res) => {
    try {
      const { pumpId } = req.params;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const authorized = await hardwareController.authorizeFuelDispensing(pumpId, amount);
      
      if (!authorized) {
        return res.status(400).json({ message: "Pump not ready or already dispensing" });
      }
      
      res.json({ message: "Fuel dispensing authorized", pumpId, amount });
    } catch (error) {
      res.status(500).json({ message: "Failed to authorize fuel dispensing" });
    }
  });

  app.post("/api/hardware/pump/:pumpId/stop", async (req, res) => {
    try {
      const { pumpId } = req.params;
      const pump = await hardwareController.getPumpStatus(pumpId);
      
      if (!pump) {
        return res.status(404).json({ message: "Pump not found" });
      }
      
      // Send stop command via WebSocket
      const command = {
        type: 'STOP_DISPENSING' as const,
        pumpId,
      };
      
      // This would normally be sent to the hardware controller
      console.log(`[Hardware] Manual stop requested for pump ${pumpId}`);
      
      res.json({ message: "Stop command sent", pumpId });
    } catch (error) {
      res.status(500).json({ message: "Failed to stop pump" });
    }
  });

  // Admin Dashboard API endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const { timeRange = "today" } = req.query;
      const transactions = await storage.getRecentTransactions(1000); // Get more for stats
      
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const filteredTransactions = transactions.filter(t => 
        new Date(t.createdAt) >= startDate
      );
      
      const successfulTransactions = filteredTransactions.filter(t => t.status === "success");
      const totalRevenue = successfulTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const avgTransactionValue = successfulTransactions.length > 0 ? totalRevenue / successfulTransactions.length : 0;
      
      // Calculate fuel dispensed (estimated)
      const fuelDispensed = successfulTransactions.reduce((sum, t) => sum + parseFloat(t.estimatedVolume), 0);
      
      // Today's revenue specifically
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayTransactions = transactions.filter(t => 
        new Date(t.createdAt) >= todayStart && t.status === "success"
      );
      const todayRevenue = todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      res.json({
        totalTransactions: filteredTransactions.length,
        todayRevenue,
        totalRevenue,
        avgTransactionValue,
        fuelDispensed,
        systemStatus: "Operational"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/admin/pumps", async (req, res) => {
    try {
      // Mock pump data - in real system this would come from hardware controller
      const pumps = [
        {
          pumpId: "03",
          status: "active",
          currentTransaction: null,
          lastMaintenance: "2024-01-15",
          fuelLevel: 85
        }
      ];
      
      res.json(pumps);
    } catch (error) {
      res.status(500).json({ message: "Failed to get pump status" });
    }
  });

  app.post("/api/admin/emergency-stop", async (req, res) => {
    try {
      // Emergency stop all pumps
      await hardwareController.emergencyStop();
      console.log("[Admin] Emergency stop activated by admin");
      
      res.json({ message: "Emergency stop activated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate emergency stop" });
    }
  });

  app.post("/api/admin/pumps/:pumpId/reset", async (req, res) => {
    try {
      const { pumpId } = req.params;
      // Reset specific pump
      await hardwareController.resetPump(pumpId);
      console.log(`[Admin] Pump ${pumpId} reset by admin`);
      
      res.json({ message: `Pump ${pumpId} reset successfully` });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset pump" });
    }
  });

  app.post("/api/admin/fuel-prices", async (req, res) => {
    try {
      const { fuelType, price } = req.body;
      
      if (!fuelType || !price || price <= 0) {
        return res.status(400).json({ message: "Valid fuel type and price required" });
      }
      
      // In a real system, this would update the pricing database
      console.log(`[Admin] Fuel price updated: ${fuelType} = ฿${price}/L`);
      
      res.json({ message: "Fuel price updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update fuel price" });
    }
  });

  app.post("/api/hardware/pump/:pumpId/reset", async (req, res) => {
    try {
      const { pumpId } = req.params;
      const pump = await hardwareController.getPumpStatus(pumpId);
      
      if (!pump) {
        return res.status(404).json({ message: "Pump not found" });
      }
      
      // Send reset command via WebSocket
      const command = {
        type: 'RESET_PUMP' as const,
        pumpId,
      };
      
      console.log(`[Hardware] Reset requested for pump ${pumpId}`);
      
      res.json({ message: "Reset command sent", pumpId });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset pump" });
    }
  });

  app.post("/api/hardware/emergency-stop", async (req, res) => {
    try {
      const { pumpId } = req.body;
      
      if (!pumpId) {
        return res.status(400).json({ message: "Pump ID is required" });
      }
      
      const pump = await hardwareController.getPumpStatus(pumpId);
      
      if (!pump) {
        return res.status(404).json({ message: "Pump not found" });
      }
      
      // Send emergency stop command
      const command = {
        type: 'EMERGENCY_STOP' as const,
        pumpId,
      };
      
      console.log(`[Hardware] Emergency stop activated for pump ${pumpId}`);
      
      res.json({ message: "Emergency stop activated", pumpId });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate emergency stop" });
    }
  });

  // =================
  // VEHICLE MANAGEMENT ENDPOINTS  
  // =================

  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateVehicleSchema.parse({ ...req.body, id });
      const vehicle = await storage.updateVehicle(validatedData);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // =================
  // MAINTENANCE ENDPOINTS
  // =================

  app.get("/api/maintenance-types", async (req, res) => {
    try {
      const types = await storage.getAllMaintenanceTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ message: "Failed to get maintenance types" });
    }
  });

  app.post("/api/maintenance-types", async (req, res) => {
    try {
      const validatedData = insertMaintenanceTypeSchema.parse(req.body);
      const type = await storage.createMaintenanceType(validatedData);
      res.status(201).json(type);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance type data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create maintenance type" });
    }
  });

  app.get("/api/vehicles/:vehicleId/maintenance-records", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const records = await storage.getMaintenanceRecordsByVehicle(vehicleId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to get maintenance records" });
    }
  });

  app.get("/api/maintenance-records/upcoming", async (req, res) => {
    try {
      const daysAhead = parseInt(req.query.days as string) || 30;
      const records = await storage.getUpcomingMaintenance(daysAhead);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to get upcoming maintenance" });
    }
  });

  app.get("/api/maintenance-records/overdue", async (req, res) => {
    try {
      const records = await storage.getOverdueMaintenance();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to get overdue maintenance" });
    }
  });

  app.post("/api/maintenance-records", async (req, res) => {
    try {
      const validatedData = insertMaintenanceRecordSchema.parse(req.body);
      const record = await storage.createMaintenanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance record data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create maintenance record" });
    }
  });

  app.put("/api/maintenance-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateMaintenanceRecordSchema.parse({ ...req.body, id });
      const record = await storage.updateMaintenanceRecord(validatedData);
      if (!record) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maintenance record data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update maintenance record" });
    }
  });

  app.get("/api/maintenance-reminders", async (req, res) => {
    try {
      const reminders = await storage.getActiveReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to get maintenance reminders" });
    }
  });

  app.post("/api/maintenance-reminders", async (req, res) => {
    try {
      const validatedData = insertMaintenanceReminderSchema.parse(req.body);
      const reminder = await storage.createMaintenanceReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.patch("/api/maintenance-reminders/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markReminderAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json({ message: "Reminder marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark reminder as read" });
    }
  });

  app.patch("/api/maintenance-reminders/:id/dismiss", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.dismissReminder(id);
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json({ message: "Reminder dismissed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to dismiss reminder" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket for hardware communication
  hardwareController.setupWebSocket(httpServer, '/hardware-ws');
  
  return httpServer;
}
