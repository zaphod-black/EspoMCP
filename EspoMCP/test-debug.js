#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Debug Testing: User Lookup and Lead Creation');
console.log('===============================================');

const serverPath = path.join(__dirname, 'build', 'index.js');

function callMCPTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    server.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    server.on('close', (code) => {
      resolve({
        code,
        output,
        errorOutput
      });
    });
    
    const request = {
      jsonrpc: "2.0",
      id: Math.random().toString(36),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };
    
    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
    
    setTimeout(() => {
      server.kill();
      resolve({ code: -1, output: 'Timeout', errorOutput: 'Timeout' });
    }, 15000);
  });
}

async function debugTests() {
  console.log('\n1️⃣ Testing user search by email...');
  const userTest = await callMCPTool('get_user_by_email', {
    emailAddress: 'cade@zbware.com'
  });
  console.log('User search result:', userTest.code === 0 ? 'Success' : 'Failed');
  if (userTest.output.includes('result')) {
    try {
      const lines = userTest.output.split('\n');
      const resultLine = lines.find(line => line.includes('"result"'));
      if (resultLine) {
        const result = JSON.parse(resultLine);
        console.log('User data:', result.result.content[0].text);
      }
    } catch (e) {
      console.log('Raw output:', userTest.output.slice(-200));
    }
  }
  
  console.log('\n2️⃣ Testing general user search...');
  const usersTest = await callMCPTool('search_users', {
    emailAddress: 'cade@zbware.com',
    limit: 1
  });
  console.log('Users search result:', usersTest.code === 0 ? 'Success' : 'Failed');
  if (usersTest.output.includes('result')) {
    try {
      const lines = usersTest.output.split('\n');
      const resultLine = lines.find(line => line.includes('"result"'));
      if (resultLine) {
        const result = JSON.parse(resultLine);
        console.log('Users found:', result.result.content[0].text);
      }
    } catch (e) {
      console.log('Raw output:', usersTest.output.slice(-200));
    }
  }
  
  console.log('\n3️⃣ Testing simple lead creation...');
  const leadTest = await callMCPTool('create_lead', {
    firstName: 'Test',
    lastName: 'Lead',
    emailAddress: 'test.lead@example.com',
    source: 'Web Site',
    status: 'New'
  });
  console.log('Lead creation result:', leadTest.code === 0 ? 'Success' : 'Failed');
  console.log('Output:', leadTest.output.slice(-300));
  console.log('Error:', leadTest.errorOutput.slice(-200));
}

debugTests().catch(console.error);