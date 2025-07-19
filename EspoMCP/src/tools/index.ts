import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolResult, CallToolRequest, ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { EspoCRMClient } from "../espocrm/client.js";
import { Config } from "../types.js";
import { Contact, Account, Opportunity } from "../espocrm/types.js";
import { 
  formatContactResults, 
  formatContactDetails, 
  formatAccountResults, 
  formatAccountDetails,
  formatOpportunityResults,
  formatOpportunityDetails,
  formatLargeResultSet 
} from "../utils/formatting.js";
import { NameSchema, EmailSchema, PhoneSchema, IdSchema, DateSchema, UrlSchema, sanitizeInput, validateAmount, validateProbability } from "../utils/validation.js";
import logger from "../utils/logger.js";

export async function setupEspoCRMTools(server: Server, config: Config): Promise<void> {
  logger.info('Setting up EspoCRM tools', { 
    baseUrl: config.espocrm.baseUrl,
    authMethod: config.espocrm.authMethod 
  });
  
  try {
    // Initialize EspoCRM client
    const client = new EspoCRMClient(config.espocrm);
    
    // Test connection before setting up tools
    const connectionTest = await client.testConnection();
    if (!connectionTest.success) {
      throw new Error("Failed to connect to EspoCRM. Please check your configuration.");
    }
    
    logger.info('EspoCRM connection verified', { 
      version: connectionTest.version,
      user: connectionTest.user?.userName 
    });
    
    // Register tools list handler
    server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      return {
        tools: [
          // Contact tools
          {
            name: "create_contact",
            description: "Create a new contact in EspoCRM with validation",
            inputSchema: {
              type: "object",
              properties: {
                firstName: { type: "string", description: "Contact's first name" },
                lastName: { type: "string", description: "Contact's last name" },
                emailAddress: { type: "string", description: "Contact's email address" },
                phoneNumber: { type: "string", description: "Contact's phone number" },
                accountId: { type: "string", description: "ID of the account this contact belongs to" },
                title: { type: "string", description: "Job title or position" },
                department: { type: "string", description: "Department within the organization" },
                description: { type: "string", description: "Additional notes about the contact" },
              },
              required: ["firstName", "lastName"],
            },
          },
          {
            name: "search_contacts",
            description: "Search for contacts using flexible criteria",
            inputSchema: {
              type: "object",
              properties: {
                searchTerm: { type: "string", description: "Search in first name, last name, and email address" },
                accountName: { type: "string", description: "Filter by account/company name" },
                emailAddress: { type: "string", description: "Filter by email address" },
                phoneNumber: { type: "string", description: "Filter by phone number" },
                limit: { type: "number", description: "Maximum number of results to return", default: 20 },
                offset: { type: "number", description: "Number of records to skip", default: 0 },
              },
              required: [],
            },
          },
          {
            name: "get_contact",
            description: "Get detailed information about a specific contact by ID",
            inputSchema: {
              type: "object",
              properties: {
                contactId: { type: "string", description: "The unique ID of the contact to retrieve" },
              },
              required: ["contactId"],
            },
          },
          // Account tools
          {
            name: "create_account",
            description: "Create a new account/company in EspoCRM",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Company or organization name" },
                type: { type: "string", enum: ["Customer", "Investor", "Partner", "Reseller"], description: "Type of business relationship" },
                industry: { type: "string", description: "Industry or business sector" },
                website: { type: "string", description: "Company website URL" },
                emailAddress: { type: "string", description: "Main company email address" },
                phoneNumber: { type: "string", description: "Main company phone number" },
                description: { type: "string", description: "Additional information about the company" },
              },
              required: ["name"],
            },
          },
          {
            name: "search_accounts",
            description: "Search for accounts/companies using flexible criteria",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Search by company name" },
                type: { type: "string", enum: ["Customer", "Investor", "Partner", "Reseller"], description: "Filter by account type" },
                industry: { type: "string", description: "Filter by industry" },
                limit: { type: "number", description: "Maximum number of results to return", default: 20 },
                offset: { type: "number", description: "Number of records to skip", default: 0 },
              },
              required: [],
            },
          },
          // Opportunity tools
          {
            name: "create_opportunity",
            description: "Create a new sales opportunity in EspoCRM",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Name/title of the opportunity" },
                accountId: { type: "string", description: "ID of the account this opportunity belongs to" },
                stage: { 
                  type: "string", 
                  enum: ["Prospecting", "Qualification", "Needs Analysis", "Value Proposition", "Id. Decision Makers", "Perception Analysis", "Proposal/Price Quote", "Closed Won", "Closed Lost"],
                  description: "Current sales stage of the opportunity"
                },
                amount: { type: "number", description: "Expected revenue amount" },
                closeDate: { type: "string", description: "Expected close date in YYYY-MM-DD format" },
                probability: { type: "number", description: "Probability of closing (0-100%)" },
                description: { type: "string", description: "Additional details about the opportunity" },
              },
              required: ["name", "accountId", "stage", "closeDate"],
            },
          },
          {
            name: "search_opportunities",
            description: "Search for sales opportunities using flexible criteria",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Search by opportunity name" },
                accountName: { type: "string", description: "Filter by account/company name" },
                stage: { 
                  type: "string", 
                  enum: ["Prospecting", "Qualification", "Needs Analysis", "Value Proposition", "Id. Decision Makers", "Perception Analysis", "Proposal/Price Quote", "Closed Won", "Closed Lost"],
                  description: "Filter by current sales stage"
                },
                minAmount: { type: "number", description: "Minimum opportunity value" },
                maxAmount: { type: "number", description: "Maximum opportunity value" },
                limit: { type: "number", description: "Maximum number of results to return", default: 20 },
                offset: { type: "number", description: "Number of records to skip", default: 0 },
              },
              required: [],
            },
          },
          // System tools
          {
            name: "health_check",
            description: "Check EspoCRM connection and API status",
            inputSchema: {
              type: "object",
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    // Register tool call handler
    server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "create_contact": {
            const schema = z.object({
              firstName: NameSchema,
              lastName: NameSchema,
              emailAddress: EmailSchema.optional(),
              phoneNumber: PhoneSchema.optional(),
              accountId: IdSchema.optional(),
              title: z.string().max(100).optional(),
              department: z.string().max(100).optional(),
              description: z.string().max(1000).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const sanitizedArgs = sanitizeInput(validatedArgs);
            const contact = await client.post<Contact>('Contact', sanitizedArgs);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully created contact: ${validatedArgs.firstName} ${validatedArgs.lastName} (ID: ${contact.id})`
                }
              ]
            };
          }

          case "search_contacts": {
            const schema = z.object({
              searchTerm: z.string().optional(),
              accountName: z.string().optional(),
              emailAddress: z.string().optional(),
              phoneNumber: z.string().optional(),
              limit: z.number().min(1).max(200).default(20),
              offset: z.number().min(0).default(0),
            });
            
            const validatedArgs = schema.parse(args);
            const where = [];
            
            if (validatedArgs.searchTerm) {
              where.push({
                type: 'or' as const,
                value: [
                  { type: 'contains' as const, attribute: 'firstName', value: validatedArgs.searchTerm },
                  { type: 'contains' as const, attribute: 'lastName', value: validatedArgs.searchTerm },
                  { type: 'contains' as const, attribute: 'emailAddress', value: validatedArgs.searchTerm }
                ]
              });
            }
            
            if (validatedArgs.accountName) {
              where.push({
                type: 'contains' as const,
                attribute: 'accountName',
                value: validatedArgs.accountName
              });
            }
            
            const response = await client.search<Contact>('Contact', {
              where: where.length > 0 ? where : undefined,
              select: ['id', 'firstName', 'lastName', 'emailAddress', 'phoneNumber', 'accountName', 'title'],
              maxSize: validatedArgs.limit,
              offset: validatedArgs.offset,
              orderBy: 'lastName',
              order: 'asc'
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: "No contacts found matching the criteria." }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatLargeResultSet(response.list, formatContactResults, validatedArgs.limit)
                }
              ]
            };
          }

          case "get_contact": {
            const schema = z.object({ contactId: IdSchema });
            const validatedArgs = schema.parse(args);
            const contact = await client.getById<Contact>('Contact', validatedArgs.contactId);
            
            return {
              content: [
                {
                  type: "text",
                  text: formatContactDetails(contact)
                }
              ]
            };
          }

          case "create_account": {
            const schema = z.object({
              name: z.string().min(1).max(255),
              type: z.enum(['Customer', 'Investor', 'Partner', 'Reseller']).optional(),
              industry: z.string().max(100).optional(),
              website: UrlSchema.optional(),
              emailAddress: EmailSchema.optional(),
              phoneNumber: PhoneSchema.optional(),
              description: z.string().max(1000).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const sanitizedArgs = sanitizeInput(validatedArgs);
            const account = await client.post<Account>('Account', sanitizedArgs);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully created account "${validatedArgs.name}" with ID: ${account.id}`
                }
              ]
            };
          }

          case "search_accounts": {
            const schema = z.object({
              name: z.string().optional(),
              type: z.enum(['Customer', 'Investor', 'Partner', 'Reseller']).optional(),
              industry: z.string().optional(),
              limit: z.number().min(1).max(200).default(20),
              offset: z.number().min(0).default(0),
            });
            
            const validatedArgs = schema.parse(args);
            const where = [];
            
            if (validatedArgs.name) {
              where.push({
                type: 'contains' as const,
                attribute: 'name',
                value: validatedArgs.name
              });
            }
            
            if (validatedArgs.type) {
              where.push({
                type: 'equals' as const,
                attribute: 'type',
                value: validatedArgs.type
              });
            }
            
            if (validatedArgs.industry) {
              where.push({
                type: 'contains' as const,
                attribute: 'industry',
                value: validatedArgs.industry
              });
            }
            
            const response = await client.search<Account>('Account', {
              where: where.length > 0 ? where : undefined,
              select: ['id', 'name', 'type', 'industry', 'website', 'emailAddress', 'phoneNumber'],
              maxSize: validatedArgs.limit,
              offset: validatedArgs.offset,
              orderBy: 'name',
              order: 'asc'
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: "No accounts found matching the criteria." }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatLargeResultSet(response.list, formatAccountResults, validatedArgs.limit)
                }
              ]
            };
          }

          case "create_opportunity": {
            const schema = z.object({
              name: z.string().min(1).max(255),
              accountId: IdSchema,
              stage: z.enum(['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Id. Decision Makers', 'Perception Analysis', 'Proposal/Price Quote', 'Closed Won', 'Closed Lost']),
              amount: z.number().positive().optional(),
              closeDate: DateSchema,
              probability: z.number().min(0).max(100).optional(),
              description: z.string().max(1000).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            
            if (validatedArgs.amount) {
              validateAmount(validatedArgs.amount);
            }
            if (validatedArgs.probability !== undefined) {
              validateProbability(validatedArgs.probability);
            }
            
            const sanitizedArgs = sanitizeInput(validatedArgs);
            const opportunity = await client.post<Opportunity>('Opportunity', sanitizedArgs);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully created opportunity "${validatedArgs.name}" (${validatedArgs.stage}) with ID: ${opportunity.id}`
                }
              ]
            };
          }

          case "search_opportunities": {
            const schema = z.object({
              name: z.string().optional(),
              accountName: z.string().optional(),
              stage: z.enum(['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Id. Decision Makers', 'Perception Analysis', 'Proposal/Price Quote', 'Closed Won', 'Closed Lost']).optional(),
              minAmount: z.number().positive().optional(),
              maxAmount: z.number().positive().optional(),
              limit: z.number().min(1).max(200).default(20),
              offset: z.number().min(0).default(0),
            });
            
            const validatedArgs = schema.parse(args);
            const where = [];
            
            if (validatedArgs.name) {
              where.push({
                type: 'contains' as const,
                attribute: 'name',
                value: validatedArgs.name
              });
            }
            
            if (validatedArgs.accountName) {
              where.push({
                type: 'contains' as const,
                attribute: 'accountName',
                value: validatedArgs.accountName
              });
            }
            
            if (validatedArgs.stage) {
              where.push({
                type: 'equals' as const,
                attribute: 'stage',
                value: validatedArgs.stage
              });
            }
            
            if (validatedArgs.minAmount) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'amount',
                value: validatedArgs.minAmount
              });
            }
            
            if (validatedArgs.maxAmount) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'amount',
                value: validatedArgs.maxAmount
              });
            }
            
            const response = await client.search<Opportunity>('Opportunity', {
              where: where.length > 0 ? where : undefined,
              select: ['id', 'name', 'stage', 'amount', 'closeDate', 'probability', 'accountName'],
              maxSize: validatedArgs.limit,
              offset: validatedArgs.offset,
              orderBy: 'closeDate',
              order: 'asc'
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: "No opportunities found matching the criteria." }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatLargeResultSet(response.list, formatOpportunityResults, validatedArgs.limit)
                }
              ]
            };
          }

          case "health_check": {
            const connectionTest = await client.testConnection();
            
            if (!connectionTest.success) {
              throw new Error("Connection test failed");
            }
            
            const contactTest = await client.search('Contact', { maxSize: 1 });
            const accountTest = await client.search('Account', { maxSize: 1 });
            
            const result = `✓ EspoCRM connection healthy
✓ API authentication working
✓ Database accessible
✓ Contact API functional
✓ Account API functional
Server version: ${connectionTest.version || 'Unknown'}
User: ${connectionTest.user?.userName || 'Unknown'}
Current time: ${new Date().toISOString()}`;

            return {
              content: [
                {
                  type: "text",
                  text: result
                }
              ]
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        logger.error(`Tool ${name} failed`, { error: error.message, args });
        throw error;
      }
    });
    
    logger.info('EspoCRM tools setup completed successfully');
  } catch (error: any) {
    logger.error('Failed to setup EspoCRM tools', { error: error.message });
    throw error;
  }
}