import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, updateTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
