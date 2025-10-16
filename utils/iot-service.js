const { logger } = require('./log');

class IoTService {
  constructor() {
    this.devices = new Map();
    this.sensors = new Map();
    this.dataStreams = new Map();
    this.alerts = [];
  }

  // Register IoT device
  registerDevice(deviceId, deviceType, metadata = {}) {
    try {
      const device = {
        id: deviceId,
        type: deviceType,
        status: 'active',
        registeredAt: new Date(),
        lastSeen: new Date(),
        metadata,
        sensors: [],
        metrics: {}
      };

      this.devices.set(deviceId, device);

      logger.info(`IoT device ${deviceId} registered`);

      return device;
    } catch (error) {
      logger.error('Register device error:', error);
      throw error;
    }
  }

  // Add sensor to device
  addSensor(deviceId, sensorId, sensorType, config = {}) {
    try {
      const device = this.devices.get(deviceId);

      if (!device) {
        return { success: false, error: 'Device not found' };
      }

      const sensor = {
        id: sensorId,
        type: sensorType,
        deviceId,
        config,
        readings: [],
        lastReading: null,
        status: 'active'
      };

      this.sensors.set(sensorId, sensor);
      device.sensors.push(sensorId);

      logger.info(`Sensor ${sensorId} added to device ${deviceId}`);

      return sensor;
    } catch (error) {
      logger.error('Add sensor error:', error);
      throw error;
    }
  }

  // Record sensor reading
  recordReading(sensorId, value, unit = '') {
    try {
      const sensor = this.sensors.get(sensorId);

      if (!sensor) {
        return { success: false, error: 'Sensor not found' };
      }

      const reading = {
        timestamp: new Date(),
        value,
        unit,
        id: `${sensorId}-${Date.now()}`
      };

      sensor.readings.push(reading);
      sensor.lastReading = reading;

      // Keep only last 1000 readings
      if (sensor.readings.length > 1000) {
        sensor.readings.shift();
      }

      // Check for anomalies
      this.checkAnomalies(sensor);

      return { success: true, reading };
    } catch (error) {
      logger.error('Record reading error:', error);
      throw error;
    }
  }

  // Check for anomalies
  checkAnomalies(sensor) {
    try {
      if (sensor.readings.length < 5) return;

      const recentReadings = sensor.readings.slice(-5).map(r => r.value);
      const avg = recentReadings.reduce((a, b) => a + b, 0) / recentReadings.length;
      const stdDev = Math.sqrt(
        recentReadings.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / recentReadings.length
      );

      const lastReading = sensor.lastReading.value;

      if (Math.abs(lastReading - avg) > 3 * stdDev) {
        this.createAlert({
          sensorId: sensor.id,
          type: 'anomaly',
          severity: 'high',
          message: `Anomalous reading detected: ${lastReading}`,
          value: lastReading
        });
      }
    } catch (error) {
      logger.error('Anomaly check error:', error);
    }
  }

  // Create alert
  createAlert(alertData) {
    try {
      const alert = {
        id: `alert-${Date.now()}`,
        ...alertData,
        createdAt: new Date(),
        acknowledged: false
      };

      this.alerts.push(alert);

      logger.warn(`Alert created:`, alert);

      return alert;
    } catch (error) {
      logger.error('Create alert error:', error);
      throw error;
    }
  }

  // Get sensor data stream
  getDataStream(sensorId, limit = 100) {
    try {
      const sensor = this.sensors.get(sensorId);

      if (!sensor) {
        return null;
      }

      return {
        sensorId,
        type: sensor.type,
        readings: sensor.readings.slice(-limit),
        lastReading: sensor.lastReading
      };
    } catch (error) {
      logger.error('Get data stream error:', error);
      return null;
    }
  }

  // Get device metrics
  getDeviceMetrics(deviceId) {
    try {
      const device = this.devices.get(deviceId);

      if (!device) {
        return null;
      }

      const metrics = {
        deviceId,
        status: device.status,
        sensorCount: device.sensors.length,
        sensors: {}
      };

      device.sensors.forEach(sensorId => {
        const sensor = this.sensors.get(sensorId);
        if (sensor && sensor.readings.length > 0) {
          const values = sensor.readings.map(r => r.value);
          metrics.sensors[sensorId] = {
            type: sensor.type,
            lastReading: sensor.lastReading.value,
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values)
          };
        }
      });

      return metrics;
    } catch (error) {
      logger.error('Get device metrics error:', error);
      return null;
    }
  }

  // Get active alerts
  getActiveAlerts() {
    return this.alerts.filter(a => !a.acknowledged);
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    try {
      const alert = this.alerts.find(a => a.id === alertId);

      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();
      }

      return { success: true };
    } catch (error) {
      logger.error('Acknowledge alert error:', error);
      throw error;
    }
  }

  // Update device status
  updateDeviceStatus(deviceId, status) {
    try {
      const device = this.devices.get(deviceId);

      if (device) {
        device.status = status;
        device.lastSeen = new Date();
      }

      return { success: true };
    } catch (error) {
      logger.error('Update device status error:', error);
      throw error;
    }
  }

  // Get all devices
  getAllDevices() {
    const devices = [];
    this.devices.forEach(device => {
      devices.push(device);
    });
    return devices;
  }
}

class EdgeComputingService {
  constructor() {
    this.edgeNodes = new Map();
    this.computations = [];
  }

  // Register edge node
  registerEdgeNode(nodeId, location, capacity = {}) {
    try {
      const node = {
        id: nodeId,
        location,
        capacity: {
          cpu: capacity.cpu || 100,
          memory: capacity.memory || 1024,
          storage: capacity.storage || 10240
        },
        registeredAt: new Date(),
        status: 'active',
        tasks: [],
        utilization: {
          cpu: 0,
          memory: 0,
          storage: 0
        }
      };

      this.edgeNodes.set(nodeId, node);

      logger.info(`Edge node ${nodeId} registered at ${location}`);

      return node;
    } catch (error) {
      logger.error('Register edge node error:', error);
      throw error;
    }
  }

  // Deploy computation task
  deployTask(nodeId, taskId, taskType, config = {}) {
    try {
      const node = this.edgeNodes.get(nodeId);

      if (!node) {
        return { success: false, error: 'Edge node not found' };
      }

      const task = {
        id: taskId,
        nodeId,
        type: taskType,
        config,
        deployedAt: new Date(),
        status: 'running',
        results: null
      };

      node.tasks.push(taskId);
      this.computations.push(task);

      logger.info(`Task ${taskId} deployed on edge node ${nodeId}`);

      return task;
    } catch (error) {
      logger.error('Deploy task error:', error);
      throw error;
    }
  }

  // Process data at edge
  processAtEdge(nodeId, data, processingFunction) {
    try {
      const node = this.edgeNodes.get(nodeId);

      if (!node) {
        return { success: false, error: 'Edge node not found' };
      }

      // Simulate processing
      const result = {
        nodeId,
        processedAt: new Date(),
        inputSize: JSON.stringify(data).length,
        outputSize: 0,
        processingTime: Math.random() * 100
      };

      return { success: true, result };
    } catch (error) {
      logger.error('Process at edge error:', error);
      throw error;
    }
  }

  // Get edge node status
  getEdgeNodeStatus(nodeId) {
    return this.edgeNodes.get(nodeId) || null;
  }

  // Get all edge nodes
  getAllEdgeNodes() {
    const nodes = [];
    this.edgeNodes.forEach(node => {
      nodes.push(node);
    });
    return nodes;
  }

  // Get computation results
  getComputationResults(taskId) {
    return this.computations.find(c => c.id === taskId) || null;
  }
}

const iotService = new IoTService();
const edgeComputingService = new EdgeComputingService();

module.exports = {
  iotService,
  edgeComputingService,
  IoTService,
  EdgeComputingService
};
