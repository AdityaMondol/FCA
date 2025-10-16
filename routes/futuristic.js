const express = require('express');
const { blockchainService, certificateService, smartContractService } = require('../utils/blockchain-service');
const { iotService, edgeComputingService } = require('../utils/iot-service');
const { verifyToken } = require('../utils/auth');
const { logger } = require('../utils/log');

const router = express.Router();

// ============ BLOCKCHAIN ============

router.post('/blockchain/mine', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can mine blocks' });
    }

    const block = blockchainService.mineBlock(req.user.id);

    res.json({
      message: 'Block mined successfully',
      block
    });
  } catch (error) {
    logger.error('Mine block error:', error);
    res.status(500).json({ error: 'Failed to mine block' });
  }
});

router.post('/blockchain/transaction', verifyToken, async (req, res) => {
  try {
    const { to, amount } = req.body;

    const result = blockchainService.addTransaction({
      from: req.user.id,
      to,
      amount,
      type: 'transfer'
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Add transaction error:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

router.get('/blockchain/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = blockchainService.getBalance(address);

    res.json({ address, balance });
  } catch (error) {
    logger.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

router.get('/blockchain/chain', async (req, res) => {
  try {
    const chain = blockchainService.getChain();
    const isValid = blockchainService.isChainValid();

    res.json({
      chain,
      isValid,
      length: chain.length
    });
  } catch (error) {
    logger.error('Get chain error:', error);
    res.status(500).json({ error: 'Failed to get chain' });
  }
});

// ============ CERTIFICATES ============

router.post('/certificates/issue', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can issue certificates' });
    }

    const { studentId, courseId, grade, completionDate } = req.body;

    const certificate = certificateService.issueCertificate(studentId, courseId, {
      grade,
      completionDate,
      issuedBy: req.user.id
    });

    res.status(201).json(certificate);
  } catch (error) {
    logger.error('Issue certificate error:', error);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

router.get('/certificates/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    const result = certificateService.verifyCertificate(certificateId);

    res.json(result);
  } catch (error) {
    logger.error('Verify certificate error:', error);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

router.get('/certificates/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const certificates = certificateService.getStudentCertificates(studentId);

    res.json(certificates);
  } catch (error) {
    logger.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to get certificates' });
  }
});

// ============ SMART CONTRACTS ============

router.post('/contracts/deploy', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can deploy contracts' });
    }

    const { code } = req.body;

    const contract = smartContractService.deployContract(code, req.user.id);

    res.status(201).json(contract);
  } catch (error) {
    logger.error('Deploy contract error:', error);
    res.status(500).json({ error: 'Failed to deploy contract' });
  }
});

router.post('/contracts/:contractId/execute', verifyToken, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { functionName, params } = req.body;

    const result = smartContractService.executeFunction(contractId, functionName, params);

    res.json(result);
  } catch (error) {
    logger.error('Execute function error:', error);
    res.status(500).json({ error: 'Failed to execute function' });
  }
});

// ============ IoT DEVICES ============

router.post('/iot/devices/register', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can register devices' });
    }

    const { deviceId, deviceType, metadata } = req.body;

    const device = iotService.registerDevice(deviceId, deviceType, metadata);

    res.status(201).json(device);
  } catch (error) {
    logger.error('Register device error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

router.post('/iot/devices/:deviceId/sensors', verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { sensorId, sensorType, config } = req.body;

    const sensor = iotService.addSensor(deviceId, sensorId, sensorType, config);

    res.status(201).json(sensor);
  } catch (error) {
    logger.error('Add sensor error:', error);
    res.status(500).json({ error: 'Failed to add sensor' });
  }
});

router.post('/iot/sensors/:sensorId/reading', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { value, unit } = req.body;

    const result = iotService.recordReading(sensorId, value, unit);

    res.json(result);
  } catch (error) {
    logger.error('Record reading error:', error);
    res.status(500).json({ error: 'Failed to record reading' });
  }
});

router.get('/iot/devices/:deviceId/metrics', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const metrics = iotService.getDeviceMetrics(deviceId);

    if (!metrics) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(metrics);
  } catch (error) {
    logger.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

router.get('/iot/alerts', async (req, res) => {
  try {
    const alerts = iotService.getActiveAlerts();

    res.json(alerts);
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

router.put('/iot/alerts/:alertId/acknowledge', verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;

    const result = iotService.acknowledgeAlert(alertId);

    res.json(result);
  } catch (error) {
    logger.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// ============ EDGE COMPUTING ============

router.post('/edge/nodes/register', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can register edge nodes' });
    }

    const { nodeId, location, capacity } = req.body;

    const node = edgeComputingService.registerEdgeNode(nodeId, location, capacity);

    res.status(201).json(node);
  } catch (error) {
    logger.error('Register edge node error:', error);
    res.status(500).json({ error: 'Failed to register edge node' });
  }
});

router.post('/edge/nodes/:nodeId/tasks', verifyToken, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { taskId, taskType, config } = req.body;

    const task = edgeComputingService.deployTask(nodeId, taskId, taskType, config);

    res.status(201).json(task);
  } catch (error) {
    logger.error('Deploy task error:', error);
    res.status(500).json({ error: 'Failed to deploy task' });
  }
});

router.post('/edge/nodes/:nodeId/process', async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { data } = req.body;

    const result = edgeComputingService.processAtEdge(nodeId, data, null);

    res.json(result);
  } catch (error) {
    logger.error('Process at edge error:', error);
    res.status(500).json({ error: 'Failed to process at edge' });
  }
});

router.get('/edge/nodes', async (req, res) => {
  try {
    const nodes = edgeComputingService.getAllEdgeNodes();

    res.json(nodes);
  } catch (error) {
    logger.error('Get edge nodes error:', error);
    res.status(500).json({ error: 'Failed to get edge nodes' });
  }
});

module.exports = router;
