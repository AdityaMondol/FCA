const cluster = require('cluster');
const os = require('os');
const { logger } = require('./utils/log');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  logger.info(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = require('./app');
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    logger.info(`Worker ${process.pid} started, listening on port ${PORT}`);
  });
}