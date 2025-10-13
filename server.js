const cluster = require('cluster');
const os = require('os');
const dotenv = require('dotenv');
const { logger } = require('./utils/log');

// Load environment variables
dotenv.config();

const numCPUs = os.cpus().length;

// Beautiful ASCII Art Banner
const printBanner = () => {
  console.log('\n\x1b[36m╔════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║                                                                ║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    \x1b[33m███████╗ █████╗ ██████╗ ██╗██████╗                       \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    \x1b[33m██╔════╝██╔══██╗██╔══██╗██║██╔══██╗                      \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    \x1b[33m█████╗  ███████║██████╔╝██║██║  ██║                      \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    \x1b[33m██╔══╝  ██╔══██║██╔══██╗██║██║  ██║                      \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    \x1b[33m██║     ██║  ██║██║  ██║██║██████╔╝                      \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m    \x1b[33m╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═════╝                       \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║                                                                ║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m          \x1b[32m🎓 CADET ACADEMY API SERVER 🎓\x1b[0m                       \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║                                                                ║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m          \x1b[35mVersion:\x1b[0m 1.0.0                                    \x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m          \x1b[35mNode:\x1b[0m    ' + process.version.padEnd(33) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m          \x1b[35mCPUs:\x1b[0m    ' + (numCPUs + ' cores').padEnd(33) + '\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║                                                                ║\x1b[0m');
  console.log('\x1b[36m╚════════════════════════════════════════════════════════════════╝\x1b[0m\n');
};

if (cluster.isMaster) {
  printBanner();
  
  console.log('\x1b[32m🚀 Master process started\x1b[0m');
  console.log('\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
  
  logger.info(`🔧 Master process ${process.pid} initializing...`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  console.log(`\n\x1b[32m✨ Spawned ${numCPUs} worker processes\x1b[0m\n`);

  cluster.on('exit', (worker, code, signal) => {
    console.log(`\x1b[33m⚠️  Worker ${worker.process.pid} stopped - Respawning...\x1b[0m`);
    cluster.fork();
  });
} else {
  const app = require('./app');
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`\x1b[32m✓\x1b[0m Worker \x1b[36m${process.pid}\x1b[0m ready on \x1b[35mhttp://localhost:${PORT}\x1b[0m`);
  });
}