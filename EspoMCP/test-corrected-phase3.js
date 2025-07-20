#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Testing Phase 3 with Corrected Values');
console.log('=========================================');

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
      if (code === 0) {
        try {
          const lines = output.trim().split('\n');
          const jsonResponse = lines.find(line => {
            try {
              const parsed = JSON.parse(line);
              return parsed.result && parsed.result.content;
            } catch { return false; }
          });
          
          if (jsonResponse) {
            const result = JSON.parse(jsonResponse);
            resolve(result.result.content[0].text);
          } else {
            resolve(output);
          }
        } catch (e) {
          resolve(output);
        }
      } else {
        reject(new Error(`Tool failed: ${errorOutput}`));
      }
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
      reject(new Error('Timeout'));
    }, 30000);
  });
}

async function testCorrectedValues() {
  try {
    // Test 1: Create case with correct type
    console.log('\n1️⃣ Creating case with correct type...');
    const caseResult = await callMCPTool('create_case', {
      name: 'Website Performance Issue',
      status: 'New',
      priority: 'High',
      type: 'Incident',  // Using valid enum value
      description: 'Customer reports slow loading times on product pages'
    });
    console.log('✅ Case created:', caseResult);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 2: Create call with minimal required fields first
    console.log('\n2️⃣ Creating call with minimal fields...');
    const callResult = await callMCPTool('create_call', {
      name: 'Sales Follow-up Call',
      status: 'Planned'  // Using minimal required fields
    });
    console.log('✅ Call result:', callResult);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 3: Create a simple note
    console.log('\n3️⃣ Creating a simple note...');
    const noteResult = await callMCPTool('add_note', {
      parentType: 'Case',
      parentId: '689f92e90e5ca0dcc', // Using an existing case ID from search results
      post: 'This is a test note added via MCP Phase 3 tools. Working great!'
    });
    console.log('✅ Note result:', noteResult);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 4: Test relationship operations
    console.log('\n4️⃣ Testing relationship operations...');
    const relationshipResult = await callMCPTool('get_entity_relationships', {
      entityType: 'Contact',
      entityId: '687d536cc024f7572', // Charlie Miller contact we created
      relationshipName: 'cases'
    });
    console.log('✅ Relationships:', relationshipResult);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 5: Create document
    console.log('\n5️⃣ Creating a document...');
    const docResult = await callMCPTool('create_document', {
      name: 'Phase 3 Test Document',
      status: 'Active',
      type: 'Test',
      description: 'Document created during Phase 3 testing'
    });
    console.log('✅ Document result:', docResult);
    
    console.log('\n🎉 Corrected Phase 3 tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCorrectedValues().catch(console.error);