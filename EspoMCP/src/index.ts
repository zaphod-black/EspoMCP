#!/usr/bin/env node

// Load environment variables from .env file
try {
  const { readFileSync } = await import('fs');
  const envContent = readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=');
      }
    }
  });
  console.log('✓ Loaded .env file');
} catch (error) {
  console.log('ℹ No .env file found, using environment variables only');
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig, validateConfiguration } from "./config/index.js";
import { setupEspoCRMTools } from "./tools/index.js";
import logger from "./utils/logger.js";

async function main() {
  try {
    // Validate environment configuration
    const configErrors = validateConfiguration();
    if (configErrors.length > 0) {
      logger.error('Configuration validation failed', { errors: configErrors });
      console.error('Configuration errors:');
      configErrors.forEach(error => console.error(`  - ${error}`));
      console.error('\nPlease check your environment variables and try again.');
      console.error('See .env.example for required configuration.');
      process.exit(1);
    }
    
    // Load configuration
    const config = loadConfig();
    logger.info('Configuration loaded successfully', { 
      espoUrl: config.espocrm.baseUrl,
      authMethod: config.espocrm.authMethod,
      rateLimit: config.server.rateLimit 
    });
    
    // Create MCP server
    const server = new Server(
      {
        name: "EspoCRM Integration Server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    logger.info('MCP server created', { name: "EspoCRM Integration Server" });
    
    // Setup EspoCRM tools
    await setupEspoCRMTools(server, config);
    
    // Create transport
    const transport = new StdioServerTransport();
    logger.info('Starting MCP server with stdio transport');
    
    // Start server
    await server.connect(transport);
    
    logger.info('EspoCRM MCP Server started successfully');
    
  } catch (error: any) {
    logger.error('Failed to start EspoCRM MCP Server', { 
      error: error.message,
      stack: error.stack 
    });
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error: any) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

// Start the server
main().catch((error: any) => {
  logger.error('Fatal error during startup', { error: error.message, stack: error.stack });
  console.error('Fatal error:', error.message);
  process.exit(1);
});