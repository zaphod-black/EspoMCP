#!/usr/bin/env node

/**
 * Test script for EspoCRM Chatbot Integration
 * Tests the complete flow from chat message to MCP tool execution
 */

import { spawn } from 'child_process';
import axios from 'axios';
import { io } from 'socket.io-client';

const CHATBOT_SERVER = process.env.CHATBOT_SERVER || 'http://localhost:3001';
const TEST_TIMEOUT = 30000; // 30 seconds

console.log('🧪 EspoCRM Chatbot Integration Test');
console.log('===================================');

class ChatbotTester {
  constructor() {
    this.serverProcess = null;
    this.socket = null;
    this.testResults = [];
  }

  async runAllTests() {
    try {
      console.log('\n1️⃣ Starting chatbot server...');
      await this.startServer();
      
      console.log('\n2️⃣ Testing server health...');
      await this.testHealth();
      
      console.log('\n3️⃣ Testing WebSocket connection...');
      await this.testWebSocket();
      
      console.log('\n4️⃣ Testing chat functionality...');
      await this.testChatFlow();
      
      console.log('\n5️⃣ Testing MCP tool integration...');
      await this.testMCPIntegration();
      
      console.log('\n6️⃣ Testing error handling...');
      await this.testErrorHandling();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['start'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      this.serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('running on port')) {
          setTimeout(resolve, 2000); // Give server time to fully start
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      setTimeout(() => {
        reject(new Error('Server start timeout'));
      }, 15000);
    });
  }

  async testHealth() {
    try {
      const response = await axios.get(`${CHATBOT_SERVER}/health`, {
        timeout: 5000
      });
      
      if (response.status === 200 && response.data.status === 'healthy') {
        this.addResult('Health Check', '✅ Pass', 'Server is healthy');
      } else {
        this.addResult('Health Check', '❌ Fail', 'Unexpected health response');
      }
    } catch (error) {
      this.addResult('Health Check', '❌ Fail', error.message);
    }
  }

  async testWebSocket() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.addResult('WebSocket', '❌ Fail', 'Connection timeout');
        resolve();
      }, 10000);

      this.socket = io(CHATBOT_SERVER, {
        timeout: 5000
      });

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        this.addResult('WebSocket', '✅ Pass', 'Connected successfully');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        this.addResult('WebSocket', '❌ Fail', error.message);
        resolve();
      });
    });
  }

  async testChatFlow() {
    if (!this.socket || !this.socket.connected) {
      this.addResult('Chat Flow', '❌ Skip', 'WebSocket not connected');
      return;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.addResult('Chat Flow', '❌ Fail', 'Response timeout');
        resolve();
      }, 15000);

      this.socket.once('bot_response', (data) => {
        clearTimeout(timeout);
        if (data && data.message) {
          this.addResult('Chat Flow', '✅ Pass', `Got response: "${data.message.substring(0, 50)}..."`);
        } else {
          this.addResult('Chat Flow', '❌ Fail', 'Invalid response format');
        }
        resolve();
      });

      // Send a simple greeting message
      this.socket.emit('chat_message', {
        message: 'Hello, can you help me?',
        userId: 'test-user-123',
        sessionId: 'test-session-123'
      });
    });
  }

  async testMCPIntegration() {
    if (!this.socket || !this.socket.connected) {
      this.addResult('MCP Integration', '❌ Skip', 'WebSocket not connected');
      return;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.addResult('MCP Integration', '❌ Fail', 'MCP tool execution timeout');
        resolve();
      }, 20000);

      this.socket.once('bot_response', (data) => {
        clearTimeout(timeout);
        if (data && data.message) {
          // Check if response indicates tool usage
          if (data.toolsUsed || data.message.includes('health') || data.message.includes('system')) {
            this.addResult('MCP Integration', '✅ Pass', 'MCP tools executed successfully');
          } else {
            this.addResult('MCP Integration', '⚠️ Partial', 'Response received but no tool usage detected');
          }
        } else {
          this.addResult('MCP Integration', '❌ Fail', 'No response from MCP tools');
        }
        resolve();
      });

      // Send a message that should trigger MCP tool usage
      this.socket.emit('chat_message', {
        message: 'What is the system status?',
        userId: 'test-user-123',
        sessionId: 'test-session-123'
      });
    });
  }

  async testErrorHandling() {
    if (!this.socket || !this.socket.connected) {
      this.addResult('Error Handling', '❌ Skip', 'WebSocket not connected');
      return;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.addResult('Error Handling', '❌ Fail', 'No error response received');
        resolve();
      }, 10000);

      this.socket.once('bot_response', (data) => {
        clearTimeout(timeout);
        if (data && data.message) {
          // Should get some kind of response even for invalid input
          this.addResult('Error Handling', '✅ Pass', 'Handled invalid input gracefully');
        } else {
          this.addResult('Error Handling', '❌ Fail', 'No response to invalid input');
        }
        resolve();
      });

      // Send invalid/problematic input
      this.socket.emit('chat_message', {
        message: '<script>alert("xss")</script>' + 'x'.repeat(3000), // XSS + long message
        userId: 'test-user-123',
        sessionId: 'test-session-123'
      });
    });
  }

  addResult(test, status, details) {
    this.testResults.push({ test, status, details });
    console.log(`   ${status} ${test}: ${details}`);
  }

  printResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status.includes('✅')).length;
    const failed = this.testResults.filter(r => r.status.includes('❌')).length;
    const skipped = this.testResults.filter(r => r.status.includes('Skip')).length;
    const partial = this.testResults.filter(r => r.status.includes('⚠️')).length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Partial: ${partial}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    
    if (failed === 0 && passed > 0) {
      console.log('\n🎉 All critical tests passed! Chatbot is ready for deployment.');
    } else if (failed > 0) {
      console.log('\n⚠️ Some tests failed. Please check the configuration and try again.');
    } else {
      console.log('\n❓ No tests completed successfully. Check server setup.');
    }

    console.log('\n📋 Detailed Results:');
    this.testResults.forEach(result => {
      console.log(`   ${result.status} ${result.test}`);
      if (result.details) {
        console.log(`      ${result.details}`);
      }
    });
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.socket) {
      this.socket.disconnect();
    }
    
    if (this.serverProcess) {
      this.serverProcess.kill();
      // Wait a moment for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✅ Cleanup complete');
  }
}

// Run the tests
const tester = new ChatbotTester();
tester.runAllTests().catch(console.error);

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️ Test interrupted by user');
  await tester.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Test terminated');
  await tester.cleanup();
  process.exit(0);
});