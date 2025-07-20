#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Phase 3 MCP Tools');
console.log('================================');

// Test with the MCP server using our built JavaScript version
const serverPath = path.join(__dirname, 'build', 'index.js');

function testTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing tool: ${toolName}`);
    console.log(`Arguments: ${JSON.stringify(args, null, 2)}`);
    
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
        console.log(`✅ ${toolName} completed successfully`);
        console.log(`Output: ${output.slice(-200)}...`); // Show last 200 chars
        resolve(output);
      } else {
        console.log(`❌ ${toolName} failed with code ${code}`);
        console.log(`Error: ${errorOutput}`);
        reject(new Error(`Tool failed: ${errorOutput}`));
      }
    });
    
    // Send the MCP request
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
    
    // Timeout after 30 seconds
    setTimeout(() => {
      server.kill();
      reject(new Error('Timeout'));
    }, 30000);
  });
}

async function runTests() {
  const tests = [
    // Basic connectivity test
    { tool: 'health_check', args: {} },
    
    // Search existing data
    { tool: 'search_contacts', args: { limit: 3 } },
    { tool: 'search_accounts', args: { limit: 2 } },
    { tool: 'search_users', args: { limit: 2 } },
    
    // Test Phase 1 tools
    { tool: 'search_leads', args: { limit: 2 } },
    { tool: 'search_tasks', args: { limit: 2 } },
    
    // Test Phase 2 tools
    { tool: 'search_teams', args: { limit: 2 } },
    { tool: 'search_entity', args: { entityType: 'Contact', filters: {}, limit: 2 } },
    
    // Test Phase 3 tools
    { tool: 'search_calls', args: { limit: 2 } },
    { tool: 'search_cases', args: { limit: 2 } },
    { tool: 'search_notes', args: { limit: 2 } }
  ];

  for (const test of tests) {
    try {
      await testTool(test.tool, test.args);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between tests
    } catch (error) {
      console.log(`⚠️  Test failed but continuing: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Phase 3 testing completed!');
  console.log('All major tool categories have been tested.');
}

// Run the tests
runTests().catch(console.error);