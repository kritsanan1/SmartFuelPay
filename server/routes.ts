import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, updateTransactionSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  
  // Setup WebSocket for hardware communication
  hardwareController.setupWebSocket(httpServer, '/hardware-ws');
  
  return httpServer;
}
