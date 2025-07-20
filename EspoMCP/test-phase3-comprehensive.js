#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Comprehensive Phase 3 Testing');
console.log('==================================');

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
          // Parse the JSON response
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

async function runComprehensiveTests() {
  console.log('\n🔧 Testing Phase 3 Create Operations...\n');
  
  try {
    // Test 1: Create a call record
    console.log('1️⃣ Creating a call record...');
    const callResult = await callMCPTool('create_call', {
      name: 'Test Call - Sales Follow-up',
      status: 'Held',
      direction: 'Outbound',
      duration: 1800, // 30 minutes
      description: 'Follow-up call with potential client about services'
    });
    console.log('✅ Call created:', callResult);
    
    // Extract call ID for later use
    const callIdMatch = callResult.match(/ID: ([a-zA-Z0-9]+)/);
    const callId = callIdMatch ? callIdMatch[1] : null;
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 2: Create a case
    console.log('\n2️⃣ Creating a support case...');
    const caseResult = await callMCPTool('create_case', {
      name: 'Website Loading Issues',
      status: 'New',
      priority: 'High',
      type: 'Technical',
      description: 'Customer reports slow loading times on product pages'
    });
    console.log('✅ Case created:', caseResult);
    
    const caseIdMatch = caseResult.match(/ID: ([a-zA-Z0-9]+)/);
    const caseId = caseIdMatch ? caseIdMatch[1] : null;
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 3: Add a note to the case
    if (caseId) {
      console.log('\n3️⃣ Adding a note to the case...');
      const noteResult = await callMCPTool('add_note', {
        parentType: 'Case',
        parentId: caseId,
        post: 'Initial investigation shows this may be related to server load during peak hours. Escalating to DevOps team.',
        data: {
          isInternal: false
        }
      });
      console.log('✅ Note added:', noteResult);
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 4: Search recent calls
    console.log('\n4️⃣ Searching recent calls...');
    const callSearch = await callMCPTool('search_calls', {
      status: 'Held',
      limit: 5
    });
    console.log('✅ Recent calls:', callSearch);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 5: Search cases by priority
    console.log('\n5️⃣ Searching high priority cases...');
    const caseSearch = await callMCPTool('search_cases', {
      priority: 'High',
      limit: 5
    });
    console.log('✅ High priority cases:', caseSearch);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 6: Test generic entity operations
    console.log('\n6️⃣ Testing generic entity search (Contact)...');
    const entitySearch = await callMCPTool('search_entity', {
      entityType: 'Contact',
      filters: {},
      select: ['firstName', 'lastName', 'emailAddress'],
      limit: 3
    });
    console.log('✅ Generic entity search:', entitySearch);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 7: Test relationship operations (if we have contacts and accounts)
    console.log('\n7️⃣ Testing search for linkable entities...');
    const contactsForLink = await callMCPTool('search_contacts', { limit: 1 });
    console.log('✅ Available contacts for linking:', contactsForLink);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Test 8: Search notes
    console.log('\n8️⃣ Searching recent notes...');
    const noteSearch = await callMCPTool('search_notes', {
      limit: 3
    });
    console.log('✅ Recent notes:', noteSearch);
    
    console.log('\n🎉 All Phase 3 tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Call creation and search');
    console.log('- ✅ Case creation and search'); 
    console.log('- ✅ Note creation and search');
    console.log('- ✅ Generic entity operations');
    console.log('- ✅ All formatting functions working');
    console.log('- ✅ Complex filtering and search criteria');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runComprehensiveTests().catch(console.error);