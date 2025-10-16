const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const router = express.Router();

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../docs/openapi.yaml');
let swaggerSpec;

try {
  const openApiFile = fs.readFileSync(openApiPath, 'utf8');
  swaggerSpec = yaml.load(openApiFile);
} catch (error) {
  console.error('Failed to load OpenAPI spec:', error);
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Farid Cadet Academy API',
      version: '1.0.0'
    },
    paths: {}
  };
}

// Swagger UI setup
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/api/docs/spec',
    persistAuthorization: true,
    displayOperationId: true,
    filter: true,
    showExtensions: true,
    deepLinking: true
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Farid Cadet Academy API Documentation'
}));

// Serve raw OpenAPI spec
router.get('/spec', (req, res) => {
  res.setHeader('Content-Type', 'application/yaml');
  res.send(swaggerSpec);
});

// API documentation endpoint
router.get('/info', (req, res) => {
  res.json({
    title: swaggerSpec.info.title,
    version: swaggerSpec.info.version,
    description: swaggerSpec.info.description,
    contact: swaggerSpec.info.contact,
    servers: swaggerSpec.servers,
    paths: Object.keys(swaggerSpec.paths || {}).length,
    components: Object.keys(swaggerSpec.components?.schemas || {}).length
  });
});

module.exports = router;
