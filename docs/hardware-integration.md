# Hardware Integration Documentation

## Overview
This document describes the hardware integration system for the automated fuel dispensing system, including pump control, safety mechanisms, and communication protocols.

## Hardware Components

### Fuel Pump Controller
- **Model**: Industrial fuel pump with electronic control
- **Control Method**: Serial communication via RS-485 or USB
- **Features**: 
  - Flow rate monitoring
  - Volume measurement
  - Emergency stop capability
  - Status reporting

### GPIO Pins (for Raspberry Pi/Arduino)
- **Relay Pin (18)**: Controls pump activation
- **Flow Sensor Pin (24)**: Monitors fuel flow
- **Emergency Stop Pin (25)**: Emergency shutdown input
- **Status LED Pin (16)**: Visual status indicator

### Safety Systems
- **Emergency Stop Button**: Physical button for immediate shutdown
- **Flow Sensor**: Monitors fuel flow rate and detects blockages
- **Pressure Sensor**: Monitors fuel pressure
- **Safety Relay**: Fail-safe pump shutdown mechanism

## Communication Protocol

### WebSocket Connection
```
Endpoint: ws://localhost:5000/hardware-ws
Protocol: JSON-based command/response
```

### Command Types
1. **START_DISPENSING**: Begin fuel dispensing
2. **STOP_DISPENSING**: Stop fuel dispensing
3. **RESET_PUMP**: Reset pump to ready state
4. **GET_STATUS**: Request current pump status
5. **EMERGENCY_STOP**: Emergency shutdown

### Response Types
1. **STATUS_UPDATE**: Pump status information
2. **DISPENSING_COMPLETE**: Fuel dispensing completed
3. **ERROR**: Error condition detected
4. **EMERGENCY_STOP**: Emergency shutdown activated

## API Endpoints

### Pump Status
- `GET /api/hardware/pump/:pumpId/status` - Get pump status
- `GET /api/hardware/pumps/status` - Get all pumps status

### Pump Control
- `POST /api/hardware/pump/:pumpId/dispense` - Start fuel dispensing
- `POST /api/hardware/pump/:pumpId/stop` - Stop fuel dispensing
- `POST /api/hardware/pump/:pumpId/reset` - Reset pump
- `POST /api/hardware/emergency-stop` - Emergency stop

## Hardware Setup

### Physical Connections
```
Raspberry Pi GPIO:
- Pin 18 (GPIO 18) → Pump Relay Control
- Pin 24 (GPIO 24) → Flow Sensor Input
- Pin 25 (GPIO 25) → Emergency Stop Input
- Pin 16 (GPIO 16) → Status LED Output
```

### Serial Connection
```
Device: /dev/ttyUSB0
Baud Rate: 9600
Data Bits: 8
Stop Bits: 1
Parity: None
```

### Power Requirements
- 12V DC for pump relay
- 5V DC for sensors
- 3.3V DC for GPIO signals

## Safety Features

### Emergency Stop
- Immediate pump shutdown
- All dispensing operations halt
- System enters safe state
- Manual reset required

### Flow Monitoring
- Continuous flow rate monitoring
- Automatic stop on flow anomalies
- Leak detection capabilities
- Volume verification

### Pressure Monitoring
- System pressure monitoring
- Overpressure protection
- Underpressure detection
- Automatic pressure relief

## Integration Flow

### Payment → Hardware Flow
1. Customer completes payment
2. System verifies payment success
3. Hardware controller receives dispensing authorization
4. Pump activates and begins dispensing
5. Real-time monitoring of dispensing process
6. Automatic stop when target amount reached
7. Status update sent to system

### Error Handling
1. Hardware errors trigger immediate stop
2. Error status broadcasted to all clients
3. System logs error details
4. Manual intervention required for reset

## Maintenance

### Regular Checks
- Flow sensor calibration
- Pressure sensor verification
- Relay contact inspection
- Emergency stop testing

### Calibration
- Flow rate calibration monthly
- Pressure sensor calibration quarterly
- Volume measurement verification

### Logging
- All hardware operations logged
- Error conditions recorded
- Performance metrics tracked
- Maintenance schedules maintained

## Troubleshooting

### Common Issues
1. **Pump Not Starting**: Check relay connection and power
2. **Inaccurate Flow**: Calibrate flow sensor
3. **Communication Error**: Verify serial connection
4. **Emergency Stop Active**: Check emergency stop button

### Diagnostic Commands
```bash
# Check pump status
curl GET http://localhost:5000/api/hardware/pump/03/status

# Test pump activation
curl POST http://localhost:5000/api/hardware/pump/03/dispense -d '{"amount": 100}'

# Reset pump
curl POST http://localhost:5000/api/hardware/pump/03/reset
```

## Security Considerations

### Physical Security
- Secure hardware enclosure
- Tamper detection
- Access control to hardware components

### Communication Security
- Encrypted WebSocket connections
- Authentication for hardware commands
- Command validation and sanitization

### Safety Interlocks
- Multiple safety systems
- Redundant sensors
- Fail-safe design principles

## Performance Specifications

### Response Times
- Command acknowledgment: < 100ms
- Status updates: Every 1 second
- Emergency stop: < 50ms

### Accuracy
- Flow measurement: ±0.5%
- Volume dispensing: ±1%
- Pressure monitoring: ±2%

### Reliability
- Uptime target: 99.9%
- Mean time between failures: > 8760 hours
- Maintenance interval: Monthly

## Future Enhancements

### Planned Features
- Multiple pump support
- Advanced diagnostics
- Predictive maintenance
- Remote monitoring capabilities
- Integration with fuel management systems

### Scalability
- Support for up to 8 pumps per controller
- Network-based communication
- Cloud-based monitoring
- Mobile maintenance app