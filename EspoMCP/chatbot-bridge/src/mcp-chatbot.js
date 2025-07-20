import { spawn } from 'child_process';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export class MCPChatbot {
  constructor(options) {
    this.mcpServerPath = options.mcpServerPath;
    this.logger = options.logger;
    this.openai = options.openaiApiKey ? new OpenAI({
      apiKey: options.openaiApiKey
    }) : null;
    
    this.conversations = new Map(); // Store conversation history
    this.systemPrompt = this.buildSystemPrompt();
  }

  buildSystemPrompt() {
    return `You are an AI assistant integrated with EspoCRM through 47 specialized tools. You can help users with:

**CRM Operations:**
- Create, search, and manage Contacts, Accounts, Opportunities, Leads
- Schedule and track Meetings, Calls, and Tasks
- Manage Cases and add Notes to any record
- Handle Teams, Roles, and User permissions

**Your Capabilities:**
- Create business records (accounts, opportunities, leads, contacts)
- Search and retrieve information from the CRM
- Schedule activities and assign tasks
- Link related records together
- Generate reports and summaries
- Answer questions about CRM data

**Communication Style:**
- Be helpful, professional, and concise
- Always confirm before creating or modifying important records
- Provide specific details when creating records (IDs, names, etc.)
- Offer to perform related actions when relevant
- If unsure about user intent, ask clarifying questions

**Available Tools:** You have access to 47 MCP tools including create_contact, search_accounts, create_opportunity, create_task, search_leads, create_call, create_case, add_note, and many more.

When users ask for help, determine which tools would be most appropriate and use them to accomplish their goals. Always be transparent about what actions you're taking.`;
  }

  async processMessage(message, context = {}) {
    const { userId, sessionId } = context;
    const conversationId = sessionId || userId || 'default';

    try {
      // Get or create conversation history
      if (!this.conversations.has(conversationId)) {
        this.conversations.set(conversationId, []);
      }
      const conversation = this.conversations.get(conversationId);

      // Add user message to history
      conversation.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Keep conversation history manageable (last 20 messages)
      if (conversation.length > 20) {
        conversation.splice(0, conversation.length - 20);
      }

      this.logger.info('Processing message with AI', { 
        conversationId, 
        messageLength: message.length 
      });

      // Use OpenAI if available, otherwise fall back to simple processing
      let response;
      if (this.openai) {
        response = await this.processWithOpenAI(message, conversation);
      } else {
        response = await this.processWithFallback(message);
      }

      // Add assistant response to history
      conversation.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        toolsUsed: response.toolsUsed || []
      });

      return response;

    } catch (error) {
      this.logger.error('Error in message processing', {
        error: error.message,
        conversationId
      });
      
      return {
        message: 'I encountered an error processing your request. Please try again or rephrase your question.',
        type: 'error'
      };
    }
  }

  async processWithOpenAI(message, conversation) {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...conversation.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Check if the message requires MCP tool usage
    const needsTools = await this.analyzeForToolUsage(message);
    
    if (needsTools.requiresTools) {
      // Execute MCP tools and get results
      const toolResults = await this.executeMCPTools(needsTools.tools, needsTools.extractedData);
      
      // Generate response incorporating tool results
      const responseCompletion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          ...messages,
          {
            role: 'system',
            content: `Tool execution results: ${JSON.stringify(toolResults)}\n\nPlease provide a helpful response to the user based on these results.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return {
        message: responseCompletion.choices[0].message.content,
        type: 'success',
        toolsUsed: needsTools.tools,
        data: toolResults
      };
    } else {
      // Simple conversational response
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      });

      return {
        message: completion.choices[0].message.content,
        type: 'text'
      };
    }
  }

  async analyzeForToolUsage(message) {
    // Simple keyword-based analysis for tool usage
    const toolKeywords = {
      'create_contact': ['create contact', 'add contact', 'new contact'],
      'create_account': ['create account', 'add account', 'new account', 'new company'],
      'create_opportunity': ['create opportunity', 'add opportunity', 'new opportunity', 'new deal'],
      'create_lead': ['create lead', 'add lead', 'new lead'],
      'create_task': ['create task', 'add task', 'new task', 'assign task'],
      'create_meeting': ['create meeting', 'schedule meeting', 'new meeting'],
      'create_call': ['create call', 'log call', 'new call'],
      'create_case': ['create case', 'new case', 'add case'],
      'search_contacts': ['find contact', 'search contact', 'look for contact'],
      'search_accounts': ['find account', 'search account', 'look for account', 'find company'],
      'search_opportunities': ['find opportunity', 'search opportunity', 'find deal'],
      'search_leads': ['find lead', 'search lead', 'look for lead'],
      'search_tasks': ['find task', 'search task', 'my tasks'],
      'search_meetings': ['find meeting', 'search meeting', 'upcoming meetings'],
      'health_check': ['system status', 'health check', 'system health']
    };

    const lowercaseMessage = message.toLowerCase();
    const detectedTools = [];
    
    for (const [tool, keywords] of Object.entries(toolKeywords)) {
      if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
        detectedTools.push(tool);
      }
    }

    return {
      requiresTools: detectedTools.length > 0,
      tools: detectedTools,
      extractedData: this.extractDataFromMessage(message, detectedTools)
    };
  }

  extractDataFromMessage(message, tools) {
    // Simple extraction logic - in production, you'd want more sophisticated NLP
    const data = {};
    
    if (tools.some(tool => tool.includes('create'))) {
      // Extract common fields from create operations
      const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      const phoneMatch = message.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
      
      if (emailMatch) data.emailAddress = emailMatch[0];
      if (phoneMatch) data.phoneNumber = phoneMatch[0];
      
      // Extract names (simple heuristic)
      const nameMatch = message.match(/(?:name|called|contact)\s+(?:is\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
      if (nameMatch) {
        const [firstName, lastName] = nameMatch[1].split(' ');
        data.firstName = firstName;
        data.lastName = lastName;
      }
    }
    
    return data;
  }

  async executeMCPTools(tools, extractedData) {
    const results = [];
    
    for (const tool of tools) {
      try {
        let args = {};
        
        // Build arguments based on tool type and extracted data
        if (tool === 'create_contact' && extractedData.firstName) {
          args = {
            firstName: extractedData.firstName,
            lastName: extractedData.lastName || 'Unknown',
            emailAddress: extractedData.emailAddress,
            phoneNumber: extractedData.phoneNumber
          };
        } else if (tool === 'search_contacts') {
          args = {
            limit: 5,
            searchTerm: extractedData.firstName || extractedData.lastName || ''
          };
        } else if (tool === 'health_check') {
          args = {};
        } else {
          // Default search with minimal args
          args = { limit: 5 };
        }

        const result = await this.callMCPTool(tool, args);
        results.push({
          tool,
          args,
          result: result.success ? result.response : result.error,
          success: result.success
        });
        
      } catch (error) {
        this.logger.error(`Error executing tool ${tool}`, { error: error.message });
        results.push({
          tool,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }

  async callMCPTool(toolName, args) {
    return new Promise((resolve) => {
      const server = spawn('node', [this.mcpServerPath], {
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
          if (code === 0 && output.includes('result')) {
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
                response: result.result.content[0].text
              });
            } else {
              resolve({
                success: false,
                error: 'No valid response from MCP server'
              });
            }
          } else {
            resolve({
              success: false,
              error: errorOutput || 'MCP tool execution failed'
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: `Parse error: ${error.message}`
          });
        }
      });
      
      const request = {
        jsonrpc: "2.0",
        id: uuidv4(),
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
        resolve({
          success: false,
          error: 'Timeout'
        });
      }, 15000);
    });
  }

  async processWithFallback(message) {
    // Fallback processing without OpenAI
    const tools = await this.analyzeForToolUsage(message);
    
    if (tools.requiresTools) {
      const results = await this.executeMCPTools(tools.tools, tools.extractedData);
      const successfulResults = results.filter(r => r.success);
      
      if (successfulResults.length > 0) {
        return {
          message: `I executed ${successfulResults.length} operation(s) for you:\n\n${successfulResults.map(r => `• ${r.tool}: ${r.result}`).join('\n')}`,
          type: 'success',
          toolsUsed: tools.tools,
          data: results
        };
      } else {
        return {
          message: 'I tried to help but encountered some issues with the operations. Please try rephrasing your request.',
          type: 'error'
        };
      }
    } else {
      return {
        message: 'Hello! I\'m your EspoCRM assistant. I can help you create contacts, search accounts, manage opportunities, schedule meetings, and much more. What would you like me to help you with?',
        type: 'text'
      };
    }
  }
}