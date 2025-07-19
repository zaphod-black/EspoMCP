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

function generateRandomContact() {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Helen', 'Ian', 'Julia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
  const companies = ['TechCorp', 'InnovateLtd', 'FutureSys', 'DigitalSol', 'SmartInd', 'CloudTech', 'DataFlow', 'NetSys'];
  const titles = ['Sales Manager', 'Software Engineer', 'Marketing Director', 'Product Manager', 'CEO', 'CTO', 'Designer', 'Analyst'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  return {
    firstName,
    lastName,
    emailAddress: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase()}.com`,
    phoneNumber: `+1-555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    title,
    description: `Random test contact generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
  };
}

async function createRandomContact() {
  console.log('🎲 Generating Random Contact...\n');
  
  const contact = generateRandomContact();
  
  console.log('📋 Generated Contact:');
  console.log(`   Name: ${contact.firstName} ${contact.lastName}`);
  console.log(`   Email: ${contact.emailAddress}`);
  console.log(`   Phone: ${contact.phoneNumber}`);
  console.log(`   Title: ${contact.title}`);
  console.log(`   Company: ${contact.emailAddress.split('@')[1].split('.')[0]}`);
  
  console.log('\n📤 Creating contact in EspoCRM...');
  
  try {
    const response = await axios.post(`${ESPOCRM_URL}/api/v1/Contact`, contact, {
      headers: {
        'X-Api-Key': ESPOCRM_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Contact created successfully!');
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Created: ${response.data.createdAt}`);
    console.log(`   Full Name: ${response.data.firstName} ${response.data.lastName}`);
    
    // Also search for the contact to verify
    console.log('\n🔍 Verifying contact was created...');
    const searchResponse = await axios.get(`${ESPOCRM_URL}/api/v1/Contact`, {
      headers: {
        'X-Api-Key': ESPOCRM_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        where: JSON.stringify([{
          type: 'equals',
          attribute: 'id',
          value: response.data.id
        }]),
        maxSize: 1
      }
    });
    
    if (searchResponse.data.list && searchResponse.data.list.length > 0) {
      const foundContact = searchResponse.data.list[0];
      console.log('✅ Contact verified in database:');
      console.log(`   ${foundContact.firstName} ${foundContact.lastName} (${foundContact.emailAddress})`);
    }
    
  } catch (error) {
    console.log('❌ Failed to create contact:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

createRandomContact().catch(console.error);