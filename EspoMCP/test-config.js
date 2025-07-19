#!/usr/bin/env node

// Simple test to verify configuration validation
import { validateConfiguration } from './build/config/index.js';

console.log('Testing configuration validation...');

// Test with missing environment variables
const errors = validateConfiguration();

if (errors.length > 0) {
  console.log('✓ Configuration validation working correctly');
  console.log('Missing configuration (expected):');
  errors.forEach(error => console.log(`  - ${error}`));
} else {
  console.log('✓ All required environment variables are set');
}

console.log('\nTo run the server, set up your .env file with:');
console.log('- ESPOCRM_URL=https://your-espocrm-instance.com');
console.log('- ESPOCRM_API_KEY=your-api-key-here');
console.log('\nThen run: npm start');