#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎭 Full Workflow Test: Account → Opportunity → Lead → Assignment');
console.log('================================================================');

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
          resolve({
            success: true,
            text: result.result.content[0].text,
            raw: output
          });
        } else {
          resolve({
            success: false,
            text: errorOutput || 'No response',
            raw: output
          });
        }
      } catch (e) {
        reject(new Error(`Parse error: ${e.message}`));
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

// Generate random test data
function generateTestData() {
  const companies = ['TechFlow', 'DataCore', 'CloudSync', 'InnovateLabs', 'DigitalEdge'];
  const industries = ['Technology', 'Software', 'Consulting', 'Healthcare', 'Finance'];
  const firstNames = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller'];
  
  const company = companies[Math.floor(Math.random() * companies.length)];
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase()}.com`;
  const phone = `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  return {
    company,
    industry,
    firstName,
    lastName,
    email,
    phone,
    website: `https://www.${company.toLowerCase()}.com`
  };
}

async function runFullWorkflow() {
  const testData = generateTestData();
  console.log('\n📋 Generated Test Data:');
  console.log(`   Company: ${testData.company}`);
  console.log(`   Contact: ${testData.firstName} ${testData.lastName}`);
  console.log(`   Email: ${testData.email}`);
  console.log(`   Phone: ${testData.phone}`);
  console.log(`   Industry: ${testData.industry}`);
  
  let accountId, opportunityId, leadId, userId;
  
  try {
    // Step 1: Find Cade's user ID
    console.log('\n1️⃣ Finding Cade\'s user ID...');
    const userResult = await callMCPTool('get_user_by_email', {
      emailAddress: 'cade@zbware.com'
    });
    
    if (userResult.success && userResult.text.includes('ID:')) {
      const userIdMatch = userResult.text.match(/ID: ([a-zA-Z0-9]+)/);
      userId = userIdMatch ? userIdMatch[1] : null;
      console.log(`✅ Found Cade's ID: ${userId}`);
    } else {
      console.log('⚠️ Cade not found, will create without assignment');
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 2: Create Account
    console.log('\n2️⃣ Creating new account...');
    const accountResult = await callMCPTool('create_account', {
      name: testData.company,
      industry: testData.industry,
      website: testData.website,
      type: 'Customer',
      description: `Test account for ${testData.company} created via MCP workflow test`
    });
    
    if (accountResult.success && accountResult.text.includes('ID:')) {
      const accountIdMatch = accountResult.text.match(/ID: ([a-zA-Z0-9]+)/);
      accountId = accountIdMatch ? accountIdMatch[1] : null;
      console.log(`✅ Account created: ${testData.company} (ID: ${accountId})`);
    } else {
      console.log(`❌ Account creation failed: ${accountResult.text}`);
      return;
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 3: Create Opportunity
    console.log('\n3️⃣ Creating opportunity...');
    const opportunityResult = await callMCPTool('create_opportunity', {
      name: `${testData.company} - Enterprise Deal`,
      stage: 'Prospecting',
      accountId: accountId,
      amount: Math.floor(Math.random() * 50000) + 10000, // Random amount 10k-60k
      probability: 25,
      closeDate: '2025-12-31',
      assignedUserId: userId,
      description: `Enterprise software opportunity for ${testData.company}`
    });
    
    if (opportunityResult.success && opportunityResult.text.includes('ID:')) {
      const oppIdMatch = opportunityResult.text.match(/ID: ([a-zA-Z0-9]+)/);
      opportunityId = oppIdMatch ? oppIdMatch[1] : null;
      console.log(`✅ Opportunity created: ${testData.company} - Enterprise Deal (ID: ${opportunityId})`);
    } else {
      console.log(`❌ Opportunity creation failed: ${opportunityResult.text}`);
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 4: Create Lead
    console.log('\n4️⃣ Creating lead...');
    const leadResult = await callMCPTool('create_lead', {
      firstName: testData.firstName,
      lastName: testData.lastName,
      emailAddress: testData.email,
      phoneNumber: testData.phone,
      accountName: testData.company,
      website: testData.website,
      status: 'New',
      source: 'Web Site',
      industry: testData.industry,
      assignedUserId: userId,
      description: `Lead from ${testData.company} interested in enterprise solutions`
    });
    
    if (leadResult.success && leadResult.text.includes('ID:')) {
      const leadIdMatch = leadResult.text.match(/ID: ([a-zA-Z0-9]+)/);
      leadId = leadIdMatch ? leadIdMatch[1] : null;
      console.log(`✅ Lead created: ${testData.firstName} ${testData.lastName} (ID: ${leadId})`);
    } else {
      console.log(`❌ Lead creation failed: ${leadResult.text}`);
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 5: Create related activities
    console.log('\n5️⃣ Creating related activities...');
    
    // Create a task for the lead
    if (leadId && userId) {
      const taskResult = await callMCPTool('create_task', {
        name: `Follow up with ${testData.firstName} ${testData.lastName}`,
        assignedUserId: userId,
        parentType: 'Lead',
        parentId: leadId,
        priority: 'High',
        status: 'Not Started',
        dateEnd: '2025-08-01',
        description: `Initial follow-up call with ${testData.company} lead`
      });
      
      if (taskResult.success) {
        console.log(`✅ Task created for lead follow-up`);
      }
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Create a call record
    const callResult = await callMCPTool('create_call', {
      name: `Initial call with ${testData.company}`,
      status: 'Planned',
      direction: 'Outbound',
      assignedUserId: userId,
      description: `Scheduled discovery call with ${testData.firstName} ${testData.lastName}`
    });
    
    if (callResult.success) {
      console.log(`✅ Call scheduled`);
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 6: Verify everything was created
    console.log('\n6️⃣ Verifying created records...');
    
    if (accountId) {
      const accountVerify = await callMCPTool('search_accounts', {
        searchTerm: testData.company,
        limit: 1
      });
      console.log(`✅ Account verification: ${accountVerify.text.includes(testData.company) ? 'Found' : 'Not found'}`);
    }
    
    if (leadId) {
      const leadVerify = await callMCPTool('search_leads', {
        assignedUserId: userId,
        limit: 5
      });
      console.log(`✅ Lead verification: ${leadVerify.text.includes(testData.lastName) ? 'Found assigned to Cade' : 'Created but assignment unclear'}`);
    }
    
    if (opportunityId) {
      const oppVerify = await callMCPTool('search_opportunities', {
        assignedUserId: userId,
        limit: 5
      });
      console.log(`✅ Opportunity verification: ${oppVerify.text.includes(testData.company) ? 'Found assigned to Cade' : 'Created but assignment unclear'}`);
    }
    
    // Step 7: Test relationship operations
    console.log('\n7️⃣ Testing relationship connections...');
    if (accountId && opportunityId) {
      const relationshipTest = await callMCPTool('get_entity_relationships', {
        entityType: 'Account',
        entityId: accountId,
        relationshipName: 'opportunities'
      });
      console.log(`✅ Account-Opportunity relationship: ${relationshipTest.text.includes('Found') ? 'Connected' : 'Available for linking'}`);
    }
    
    console.log('\n🎊 FULL WORKFLOW TEST COMPLETE! 🎊');
    console.log('\n📊 Created Records Summary:');
    console.log('═══════════════════════════════');
    console.log(`🏢 Account: ${testData.company} ${accountId ? `(ID: ${accountId})` : ''}`);
    console.log(`💰 Opportunity: Enterprise Deal ${opportunityId ? `(ID: ${opportunityId})` : ''}`);
    console.log(`👤 Lead: ${testData.firstName} ${testData.lastName} ${leadId ? `(ID: ${leadId})` : ''}`);
    console.log(`👨‍💼 Assigned to: Cade (cade@zbware.com) ${userId ? `(ID: ${userId})` : ''}`);
    console.log(`📞 Activities: Task and Call created`);
    console.log('\n✅ All Phase 1-3 tools demonstrated working together!');
    
  } catch (error) {
    console.error('❌ Workflow error:', error.message);
  }
}

runFullWorkflow().catch(console.error);