#!/usr/bin/env node

import axios from 'axios';
import { readFileSync } from 'fs';

// Load environment variables
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
} catch (error) {
  console.log('No .env file found');
}

const ESPOCRM_URL = process.env.ESPOCRM_URL;
const ESPOCRM_API_KEY = process.env.ESPOCRM_API_KEY;

console.log('🔍 Testing EspoCRM Connection');
console.log(`URL: ${ESPOCRM_URL}`);
console.log(`API Key: ${ESPOCRM_API_KEY ? ESPOCRM_API_KEY.substring(0, 8) + '...' : 'Not set'}`);

async function testConnection() {
  console.log('\n📡 Testing basic connectivity...');
  
  // Test 1: Basic ping to the server
  try {
    const response = await axios.get(ESPOCRM_URL, { timeout: 5000 });
    console.log('✅ Server is reachable');
    console.log(`   Status: ${response.status}`);
    console.log(`   Headers: ${Object.keys(response.headers).join(', ')}`);
  } catch (error) {
    console.log('❌ Server unreachable:', error.message);
    return;
  }

  // Test 2: Try API endpoint discovery
  console.log('\n🔍 Testing API endpoint...');
  const apiEndpoints = [
    '/api/v1/',
    '/api/v1/App/user',
    '/api/v1/Contact?maxSize=1',
    '/espocrm/api/v1/',
    '/api/v1/App'
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const url = `${ESPOCRM_URL}${endpoint}`;
      console.log(`   Testing: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'X-Api-Key': ESPOCRM_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`✅ Success: ${endpoint}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      break;
      
    } catch (error) {
      console.log(`❌ Failed: ${endpoint} - ${error.response?.status || error.message}`);
    }
  }

  // Test 3: Test specific authentication
  console.log('\n🔐 Testing authentication...');
  try {
    const response = await axios.get(`${ESPOCRM_URL}/api/v1/App/user`, {
      headers: {
        'X-Api-Key': ESPOCRM_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Authentication successful');
    console.log('👤 User info:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Authentication failed');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
  }
}

testConnection().catch(console.error);