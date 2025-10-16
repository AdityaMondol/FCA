const crypto = require('crypto');
const { logger } = require('./log');

class BlockchainService {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 4;
    this.minerReward = 10;
    this.initializeChain();
  }

  // Initialize blockchain with genesis block
  initializeChain() {
    const genesisBlock = this.createBlock(0, '0');
    this.chain.push(genesisBlock);
  }

  // Create new block
  createBlock(previousHash, nonce) {
    const block = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      transactions: this.pendingTransactions,
      previousHash: previousHash,
      nonce: nonce,
      hash: ''
    };

    block.hash = this.calculateHash(block);
    this.pendingTransactions = [];

    return block;
  }

  // Calculate block hash
  calculateHash(block) {
    const blockString = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      previousHash: block.previousHash,
      nonce: block.nonce
    });

    return crypto.createHash('sha256').update(blockString).digest('hex');
  }

  // Mine new block (Proof of Work)
  mineBlock(minerAddress) {
    try {
      const previousBlock = this.chain[this.chain.length - 1];
      let nonce = 0;
      let hash = '';

      while (!hash.startsWith('0'.repeat(this.difficulty))) {
        nonce++;
        const block = {
          index: this.chain.length,
          timestamp: new Date().toISOString(),
          transactions: this.pendingTransactions,
          previousHash: previousBlock.hash,
          nonce: nonce
        };

        hash = this.calculateHash(block);
      }

      const newBlock = this.createBlock(previousBlock.hash, nonce);
      this.chain.push(newBlock);

      // Add miner reward
      this.addTransaction({
        from: 'system',
        to: minerAddress,
        amount: this.minerReward,
        type: 'reward'
      });

      logger.info(`Block ${newBlock.index} mined by ${minerAddress}`);

      return newBlock;
    } catch (error) {
      logger.error('Mining error:', error);
      throw error;
    }
  }

  // Add transaction
  addTransaction(transaction) {
    try {
      if (!transaction.from || !transaction.to || !transaction.amount) {
        return { success: false, error: 'Invalid transaction' };
      }

      const transactionWithHash = {
        ...transaction,
        id: this.calculateHash(transaction),
        timestamp: new Date().toISOString()
      };

      this.pendingTransactions.push(transactionWithHash);

      return { success: true, transactionId: transactionWithHash.id };
    } catch (error) {
      logger.error('Add transaction error:', error);
      throw error;
    }
  }

  // Get balance
  getBalance(address) {
    try {
      let balance = 0;

      this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
          if (transaction.from === address) {
            balance -= transaction.amount;
          }
          if (transaction.to === address) {
            balance += transaction.amount;
          }
        });
      });

      return balance;
    } catch (error) {
      logger.error('Get balance error:', error);
      return 0;
    }
  }

  // Validate chain
  isChainValid() {
    try {
      for (let i = 1; i < this.chain.length; i++) {
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i - 1];

        if (currentBlock.hash !== this.calculateHash(currentBlock)) {
          return false;
        }

        if (currentBlock.previousHash !== previousBlock.hash) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Chain validation error:', error);
      return false;
    }
  }

  // Get chain
  getChain() {
    return this.chain;
  }

  // Get pending transactions
  getPendingTransactions() {
    return this.pendingTransactions;
  }

  // Get block by index
  getBlock(index) {
    return this.chain[index] || null;
  }

  // Get transaction history
  getTransactionHistory(address) {
    try {
      const transactions = [];

      this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
          if (transaction.from === address || transaction.to === address) {
            transactions.push(transaction);
          }
        });
      });

      return transactions;
    } catch (error) {
      logger.error('Get transaction history error:', error);
      return [];
    }
  }
}

class CertificateService {
  constructor() {
    this.certificates = new Map();
  }

  // Issue certificate
  issueCertificate(studentId, courseId, certificateData) {
    try {
      const certificateId = crypto.randomBytes(16).toString('hex');
      const certificate = {
        id: certificateId,
        studentId,
        courseId,
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        hash: this.generateCertificateHash(certificateData),
        ...certificateData,
        verified: true
      };

      this.certificates.set(certificateId, certificate);

      logger.info(`Certificate ${certificateId} issued to ${studentId}`);

      return certificate;
    } catch (error) {
      logger.error('Issue certificate error:', error);
      throw error;
    }
  }

  // Verify certificate
  verifyCertificate(certificateId) {
    try {
      const certificate = this.certificates.get(certificateId);

      if (!certificate) {
        return { valid: false, error: 'Certificate not found' };
      }

      const isExpired = new Date() > certificate.expiryDate;

      return {
        valid: !isExpired && certificate.verified,
        certificate: isExpired ? null : certificate,
        expiryDate: certificate.expiryDate
      };
    } catch (error) {
      logger.error('Verify certificate error:', error);
      throw error;
    }
  }

  // Generate certificate hash
  generateCertificateHash(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  // Get student certificates
  getStudentCertificates(studentId) {
    try {
      const certificates = [];

      this.certificates.forEach((cert, id) => {
        if (cert.studentId === studentId) {
          certificates.push(cert);
        }
      });

      return certificates;
    } catch (error) {
      logger.error('Get student certificates error:', error);
      return [];
    }
  }

  // Revoke certificate
  revokeCertificate(certificateId, reason) {
    try {
      const certificate = this.certificates.get(certificateId);

      if (certificate) {
        certificate.verified = false;
        certificate.revokedAt = new Date();
        certificate.revocationReason = reason;

        logger.info(`Certificate ${certificateId} revoked: ${reason}`);

        return { success: true };
      }

      return { success: false, error: 'Certificate not found' };
    } catch (error) {
      logger.error('Revoke certificate error:', error);
      throw error;
    }
  }
}

class SmartContractService {
  constructor() {
    this.contracts = new Map();
  }

  // Deploy contract
  deployContract(contractCode, owner) {
    try {
      const contractId = crypto.randomBytes(16).toString('hex');
      const contract = {
        id: contractId,
        code: contractCode,
        owner,
        deployedAt: new Date(),
        state: {},
        transactions: [],
        active: true
      };

      this.contracts.set(contractId, contract);

      logger.info(`Contract ${contractId} deployed by ${owner}`);

      return contract;
    } catch (error) {
      logger.error('Deploy contract error:', error);
      throw error;
    }
  }

  // Execute contract function
  executeFunction(contractId, functionName, params) {
    try {
      const contract = this.contracts.get(contractId);

      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      if (!contract.active) {
        return { success: false, error: 'Contract is not active' };
      }

      const transaction = {
        id: crypto.randomBytes(16).toString('hex'),
        contractId,
        function: functionName,
        params,
        timestamp: new Date(),
        status: 'executed'
      };

      contract.transactions.push(transaction);

      logger.info(`Function ${functionName} executed on contract ${contractId}`);

      return { success: true, transaction };
    } catch (error) {
      logger.error('Execute function error:', error);
      throw error;
    }
  }

  // Get contract
  getContract(contractId) {
    return this.contracts.get(contractId) || null;
  }

  // Get contract transactions
  getContractTransactions(contractId) {
    try {
      const contract = this.contracts.get(contractId);
      return contract ? contract.transactions : [];
    } catch (error) {
      logger.error('Get contract transactions error:', error);
      return [];
    }
  }
}

const blockchainService = new BlockchainService();
const certificateService = new CertificateService();
const smartContractService = new SmartContractService();

module.exports = {
  blockchainService,
  certificateService,
  smartContractService,
  BlockchainService,
  CertificateService,
  SmartContractService
};
