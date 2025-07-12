import { EventEmitter } from 'events';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export interface HardwareConfig {
  pumpId: string;
  serialPort?: string;
  relayPin?: number;
  flowSensorPin?: number;
  emergencyStopPin?: number;
}

export interface PumpStatus {
  id: string;
  isReady: boolean;
  isDispensing: boolean;
  currentVolume: number;
  targetAmount: number;
  flowRate: number;
  lastUpdate: Date;
  error?: string;
}

export interface HardwareCommand {
  type: 'START_DISPENSING' | 'STOP_DISPENSING' | 'RESET_PUMP' | 'GET_STATUS' | 'EMERGENCY_STOP';
  pumpId: string;
  params?: {
    targetAmount?: number;
    maxVolume?: number;
    timeout?: number;
  };
}

export interface HardwareResponse {
  type: 'STATUS_UPDATE' | 'DISPENSING_COMPLETE' | 'ERROR' | 'EMERGENCY_STOP';
  pumpId: string;
  data?: any;
  timestamp: Date;
}

export class HardwareController extends EventEmitter {
  private pumps: Map<string, PumpStatus> = new Map();
  private wsServer?: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private config: HardwareConfig;
  private dispensingTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: HardwareConfig) {
    super();
    this.config = config;
    this.initializePump();
  }

  private initializePump() {
    const pumpStatus: PumpStatus = {
      id: this.config.pumpId,
      isReady: true,
      isDispensing: false,
      currentVolume: 0,
      targetAmount: 0,
      flowRate: 0,
      lastUpdate: new Date(),
    };
    
    this.pumps.set(this.config.pumpId, pumpStatus);
    console.log(`[Hardware] Pump ${this.config.pumpId} initialized`);
  }

  setupWebSocket(server: Server, path: string = '/hardware-ws') {
    this.wsServer = new WebSocketServer({ server, path });
    
    this.wsServer.on('connection', (ws) => {
      console.log('[Hardware] Hardware control client connected');
      this.clients.add(ws);
      
      // Send current pump status
      const pumpStatus = this.pumps.get(this.config.pumpId);
      if (pumpStatus) {
        this.sendToClient(ws, {
          type: 'STATUS_UPDATE',
          pumpId: this.config.pumpId,
          data: pumpStatus,
          timestamp: new Date(),
        });
      }
      
      ws.on('message', (data) => {
        try {
          const command: HardwareCommand = JSON.parse(data.toString());
          this.handleHardwareCommand(command);
        } catch (error) {
          console.error('[Hardware] Invalid command received:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('[Hardware] Hardware control client disconnected');
        this.clients.delete(ws);
      });
    });
  }

  private handleHardwareCommand(command: HardwareCommand) {
    console.log(`[Hardware] Received command: ${command.type} for pump ${command.pumpId}`);
    
    switch (command.type) {
      case 'START_DISPENSING':
        this.startDispensing(command.pumpId, command.params?.targetAmount || 0);
        break;
      case 'STOP_DISPENSING':
        this.stopDispensing(command.pumpId);
        break;
      case 'RESET_PUMP':
        this.resetPump(command.pumpId);
        break;
      case 'GET_STATUS':
        this.sendPumpStatus(command.pumpId);
        break;
      case 'EMERGENCY_STOP':
        this.emergencyStop(command.pumpId);
        break;
    }
  }

  private startDispensing(pumpId: string, targetAmount: number) {
    const pump = this.pumps.get(pumpId);
    if (!pump) {
      this.broadcastError(pumpId, 'Pump not found');
      return;
    }

    if (pump.isDispensing) {
      this.broadcastError(pumpId, 'Pump already dispensing');
      return;
    }

    if (!pump.isReady) {
      this.broadcastError(pumpId, 'Pump not ready');
      return;
    }

    // Start dispensing simulation
    pump.isDispensing = true;
    pump.targetAmount = targetAmount;
    pump.currentVolume = 0;
    pump.flowRate = 35.5; // Liters per minute
    pump.lastUpdate = new Date();

    console.log(`[Hardware] Starting dispensing on pump ${pumpId}, target: ${targetAmount} THB`);
    
    // Simulate dispensing with timer
    const simulateDispensing = () => {
      const pump = this.pumps.get(pumpId);
      if (!pump || !pump.isDispensing) return;

      // Calculate volume based on flow rate (simulate 1 second intervals)
      const volumePerSecond = pump.flowRate / 60; // Convert to liters per second
      const pricePerLiter = 35.50; // THB per liter
      const amountPerSecond = volumePerSecond * pricePerLiter;
      
      pump.currentVolume += amountPerSecond;
      pump.lastUpdate = new Date();

      // Check if target reached
      if (pump.currentVolume >= pump.targetAmount) {
        pump.currentVolume = pump.targetAmount;
        this.completeDispensing(pumpId);
        return;
      }

      // Broadcast status update
      this.broadcastStatusUpdate(pumpId, pump);
      
      // Continue dispensing
      const timer = setTimeout(simulateDispensing, 1000);
      this.dispensingTimers.set(pumpId, timer);
    };

    simulateDispensing();
    this.broadcastStatusUpdate(pumpId, pump);
  }

  private stopDispensing(pumpId: string) {
    const pump = this.pumps.get(pumpId);
    if (!pump) return;

    const timer = this.dispensingTimers.get(pumpId);
    if (timer) {
      clearTimeout(timer);
      this.dispensingTimers.delete(pumpId);
    }

    pump.isDispensing = false;
    pump.flowRate = 0;
    pump.lastUpdate = new Date();
    
    console.log(`[Hardware] Stopped dispensing on pump ${pumpId}`);
    this.broadcastStatusUpdate(pumpId, pump);
  }

  private completeDispensing(pumpId: string) {
    const pump = this.pumps.get(pumpId);
    if (!pump) return;

    const timer = this.dispensingTimers.get(pumpId);
    if (timer) {
      clearTimeout(timer);
      this.dispensingTimers.delete(pumpId);
    }

    pump.isDispensing = false;
    pump.flowRate = 0;
    pump.lastUpdate = new Date();
    
    console.log(`[Hardware] Completed dispensing on pump ${pumpId}: ${pump.currentVolume} THB`);
    
    this.broadcastToClients({
      type: 'DISPENSING_COMPLETE',
      pumpId,
      data: {
        actualAmount: pump.currentVolume,
        targetAmount: pump.targetAmount,
        completedAt: new Date(),
      },
      timestamp: new Date(),
    });
  }

  private resetPump(pumpId: string) {
    const pump = this.pumps.get(pumpId);
    if (!pump) return;

    this.stopDispensing(pumpId);
    
    pump.currentVolume = 0;
    pump.targetAmount = 0;
    pump.isReady = true;
    pump.error = undefined;
    pump.lastUpdate = new Date();
    
    console.log(`[Hardware] Reset pump ${pumpId}`);
    this.broadcastStatusUpdate(pumpId, pump);
  }

  private emergencyStop(pumpId: string) {
    const pump = this.pumps.get(pumpId);
    if (!pump) return;

    this.stopDispensing(pumpId);
    
    pump.isReady = false;
    pump.error = 'Emergency stop activated';
    pump.lastUpdate = new Date();
    
    console.log(`[Hardware] Emergency stop activated on pump ${pumpId}`);
    
    this.broadcastToClients({
      type: 'EMERGENCY_STOP',
      pumpId,
      data: { reason: 'Emergency stop activated' },
      timestamp: new Date(),
    });
  }

  private sendPumpStatus(pumpId: string) {
    const pump = this.pumps.get(pumpId);
    if (!pump) return;

    this.broadcastStatusUpdate(pumpId, pump);
  }

  private broadcastStatusUpdate(pumpId: string, pump: PumpStatus) {
    this.broadcastToClients({
      type: 'STATUS_UPDATE',
      pumpId,
      data: pump,
      timestamp: new Date(),
    });
  }

  private broadcastError(pumpId: string, error: string) {
    console.error(`[Hardware] Error on pump ${pumpId}: ${error}`);
    
    this.broadcastToClients({
      type: 'ERROR',
      pumpId,
      data: { error },
      timestamp: new Date(),
    });
  }

  private broadcastToClients(response: HardwareResponse) {
    const message = JSON.stringify(response);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private sendToClient(client: WebSocket, response: HardwareResponse) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  }

  // Public API for integration with payment system
  async authorizeFuelDispensing(pumpId: string, amount: number): Promise<boolean> {
    const pump = this.pumps.get(pumpId);
    if (!pump || !pump.isReady || pump.isDispensing) {
      return false;
    }

    console.log(`[Hardware] Authorizing fuel dispensing: ${amount} THB on pump ${pumpId}`);
    
    // Send command to start dispensing
    this.handleHardwareCommand({
      type: 'START_DISPENSING',
      pumpId,
      params: { targetAmount: amount }
    });
    
    return true;
  }

  async getPumpStatus(pumpId: string): Promise<PumpStatus | undefined> {
    return this.pumps.get(pumpId);
  }

  async getAllPumpsStatus(): Promise<PumpStatus[]> {
    return Array.from(this.pumps.values());
  }
}

// Hardware integration utilities
export class HardwareUtils {
  static validatePumpId(pumpId: string): boolean {
    return /^[0-9]{2}$/.test(pumpId);
  }

  static formatVolume(volume: number): string {
    return `${volume.toFixed(2)} L`;
  }

  static formatAmount(amount: number): string {
    return `${amount.toFixed(2)} THB`;
  }

  static calculateLiters(amount: number, pricePerLiter: number): number {
    return amount / pricePerLiter;
  }

  static calculateAmount(liters: number, pricePerLiter: number): number {
    return liters * pricePerLiter;
  }
}