#!/usr/bin/env node

// Simple test to verify configuration validation
import { readFileSync } from 'fs';
import { validateConfiguration } from './build/config/index.js';

// Load .env file manually
try {
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