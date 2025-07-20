import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolResult, CallToolRequest, ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { EspoCRMClient } from "../espocrm/client.js";
import { Config } from "../types.js";
import { Contact, Account, Opportunity, Meeting, User, Task, Lead, Team, Role, Call, Case, Note, Document, GenericEntity } from "../espocrm/types.js";
import { 
  formatContactResults, 
  formatContactDetails, 
  formatAccountResults, 
  formatAccountDetails,
  formatOpportunityResults,
  formatOpportunityDetails,
  formatMeetingResults,
  formatMeetingDetails,
  formatUserResults,
  formatUserDetails,
  formatTaskResults,
  formatTaskDetails,
  formatLeadResults,
  formatLeadDetails,
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
                createdFrom: { type: "string", description: "Filter by creation date from (YYYY-MM-DD format)" },
                createdTo: { type: "string", description: "Filter by creation date to (YYYY-MM-DD format)" },
                modifiedFrom: { type: "string", description: "Filter by modification date from (YYYY-MM-DD format)" },
                modifiedTo: { type: "string", description: "Filter by modification date to (YYYY-MM-DD format)" },
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
                createdFrom: { type: "string", description: "Filter by creation date from (YYYY-MM-DD format)" },
                createdTo: { type: "string", description: "Filter by creation date to (YYYY-MM-DD format)" },
                modifiedFrom: { type: "string", description: "Filter by modification date from (YYYY-MM-DD format)" },
                modifiedTo: { type: "string", description: "Filter by modification date to (YYYY-MM-DD format)" },
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
          // Meeting tools
          {
            name: "create_meeting",
            description: "Create a new meeting in EspoCRM",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Meeting name/title" },
                dateStart: { type: "string", description: "Start date and time in ISO format (YYYY-MM-DDTHH:mm:ss)" },
                dateEnd: { type: "string", description: "End date and time in ISO format (YYYY-MM-DDTHH:mm:ss)" },
                location: { type: "string", description: "Meeting location" },
                description: { type: "string", description: "Meeting description or agenda" },
                status: { type: "string", enum: ["Planned", "Held", "Not Held"], description: "Meeting status", default: "Planned" },
                parentType: { type: "string", description: "Related entity type (Account, Contact, etc.)" },
                parentId: { type: "string", description: "ID of related entity" },
                contactsIds: { type: "array", items: { type: "string" }, description: "Array of contact IDs to invite" },
                usersIds: { type: "array", items: { type: "string" }, description: "Array of user IDs to invite" },
              },
              required: ["name", "dateStart", "dateEnd"],
            },
          },
          {
            name: "search_meetings",
            description: "Search for meetings using flexible criteria",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Search by meeting name" },
                status: { type: "string", enum: ["Planned", "Held", "Not Held"], description: "Filter by meeting status" },
                dateFrom: { type: "string", description: "Start date range in YYYY-MM-DD format" },
                dateTo: { type: "string", description: "End date range in YYYY-MM-DD format" },
                assignedUserName: { type: "string", description: "Filter by assigned user" },
                location: { type: "string", description: "Filter by location" },
                limit: { type: "number", description: "Maximum number of results to return", default: 20 },
                offset: { type: "number", description: "Number of records to skip", default: 0 },
              },
              required: [],
            },
          },
          {
            name: "get_meeting",
            description: "Get detailed information about a specific meeting by ID",
            inputSchema: {
              type: "object",
              properties: {
                meetingId: { type: "string", description: "The unique ID of the meeting to retrieve" },
              },
              required: ["meetingId"],
            },
          },
          {
            name: "update_meeting",
            description: "Update an existing meeting in EspoCRM",
            inputSchema: {
              type: "object",
              properties: {
                meetingId: { type: "string", description: "The unique ID of the meeting to update" },
                name: { type: "string", description: "Meeting name/title" },
                dateStart: { type: "string", description: "Start date and time in ISO format" },
                dateEnd: { type: "string", description: "End date and time in ISO format" },
                location: { type: "string", description: "Meeting location" },
                description: { type: "string", description: "Meeting description or agenda" },
                status: { type: "string", enum: ["Planned", "Held", "Not Held"], description: "Meeting status" },
              },
              required: ["meetingId"],
            },
          },
          // User tools
          {
            name: "search_users",
            description: "Search for users in the EspoCRM system",
            inputSchema: {
              type: "object",
              properties: {
                userName: { type: "string", description: "Search by username" },
                emailAddress: { type: "string", description: "Search by email address" },
                firstName: { type: "string", description: "Search by first name" },
                lastName: { type: "string", description: "Search by last name" },
                isActive: { type: "boolean", description: "Filter by active status" },
                type: { type: "string", enum: ["admin", "regular", "portal", "api"], description: "Filter by user type" },
                limit: { type: "number", description: "Maximum number of results to return", default: 20 },
                offset: { type: "number", description: "Number of records to skip", default: 0 },
              },
              required: [],
            },
          },
          {
            name: "get_user_by_email",
            description: "Find a user by their email address",
            inputSchema: {
              type: "object",
              properties: {
                emailAddress: { type: "string", description: "Email address to search for" },
              },
              required: ["emailAddress"],
            },
          },
          // Task tools
          {
            name: "create_task",
            description: "Create a new task and assign it to a user with optional parent entity (Lead, Account, Contact, Opportunity)",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Task name/title" },
                assignedUserId: { type: "string", description: "ID of the user to assign this task to" },
                parentType: { type: "string", enum: ["Lead", "Account", "Contact", "Opportunity"], description: "Type of parent entity" },
                parentId: { type: "string", description: "ID of the parent entity" },
                status: { type: "string", enum: ["Not Started", "Started", "Completed", "Canceled", "Deferred"], description: "Task status", default: "Not Started" },
                priority: { type: "string", enum: ["Low", "Normal", "High", "Urgent"], description: "Task priority", default: "Normal" },
                dateEnd: { type: "string", description: "Due date in YYYY-MM-DD format" },
                description: { type: "string", description: "Task description" },
              },
              required: ["name"],
            },
          },
          {
            name: "search_tasks",
            description: "Search for tasks using flexible criteria",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Search by task name" },
                assignedUserId: { type: "string", description: "Filter by assigned user ID" },
                assignedUserName: { type: "string", description: "Filter by assigned user name" },
                status: { type: "string", enum: ["Not Started", "Started", "Completed", "Canceled", "Deferred"], description: "Filter by task status" },
                priority: { type: "string", enum: ["Low", "Normal", "High", "Urgent"], description: "Filter by task priority" },
                parentType: { type: "string", enum: ["Lead", "Account", "Contact", "Opportunity"], description: "Filter by parent entity type" },
                parentId: { type: "string", description: "Filter by parent entity ID" },
                dueDateFrom: { type: "string", description: "Filter by due date from (YYYY-MM-DD format)" },
                dueDateTo: { type: "string", description: "Filter by due date to (YYYY-MM-DD format)" },
                limit: { type: "number", description: "Maximum number of results to return", default: 20 },
                offset: { type: "number", description: "Number of records to skip", default: 0 },
              },
              required: [],
            },
          },
          {
            name: "get_task",
            description: "Get detailed information about a specific task by ID",
            inputSchema: {
              type: "object",
              properties: {
                taskId: { type: "string", description: "The unique ID of the task to retrieve" },
              },
              required: ["taskId"],
            },
          },
          {
            name: "update_task",
            description: "Update an existing task",
            inputSchema: {
              type: "object",
              properties: {
                taskId: { type: "string", description: "The unique ID of the task to update" },
                name: { type: "string", description: "Task name/title" },
                assignedUserId: { type: "string", description: "ID of the user to assign this task to" },
                status: { type: "string", enum: ["Not Started", "Started", "Completed", "Canceled", "Deferred"], description: "Task status" },
                priority: { type: "string", enum: ["Low", "Normal", "High", "Urgent"], description: "Task priority" },
                dateEnd: { type: "string", description: "Due date in YYYY-MM-DD format" },
                description: { type: "string", description: "Task description" },
              },
              required: ["taskId"],
            },
          },
          {
            name: "assign_task",
            description: "Assign or reassign a task to a specific user",
            inputSchema: {
              type: "object",
              properties: {
                taskId: { type: "string", description: "The unique ID of the task to assign" },
                assignedUserId: { type: "string", description: "ID of the user to assign this task to" },
              },
              required: ["taskId", "assignedUserId"],
            },
          },
          // Lead tools
          {
            name: "create_lead",
            description: "Create a new lead with full field support",
            inputSchema: {
              type: "object",
              properties: {
                firstName: { type: "string", description: "Lead's first name" },
                lastName: { type: "string", description: "Lead's last name" },
                emailAddress: { type: "string", description: "Lead's email address" },
                phoneNumber: { type: "string", description: "Lead's phone number" },
                accountName: { type: "string", description: "Company or organization name" },
                website: { type: "string", description: "Company website URL" },
                status: { type: "string", enum: ["New", "Assigned", "In Process", "Converted", "Recycled", "Dead"], description: "Lead status", default: "New" },
                source: { type: "string", enum: ["Call", "Email", "Existing Customer", "Partner", "Public Relations", "Web Site", "Campaign", "Other"], description: "Lead source" },
                industry: { type: "string", description: "Industry or business sector" },
                assignedUserId: { type: "string", description: "ID of the user to assign this lead to" },
                description: { type: "string", description: "Additional information about the lead" },
              },
              required: ["firstName", "lastName", "source"],
            },
          },
          {
            name: "search_leads",
            description: "Search for leads using flexible criteria",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Search by first name or last name" },
                emailAddress: { type: "string", description: "Filter by email address" },
                accountName: { type: "string", description: "Filter by company name" },
                status: { type: "string", enum: ["New", "Assigned", "In Process", "Converted", "Recycled", "Dead"], description: "Filter by lead status" },
                source: { type: "string", enum: ["Call", "Email", "Existing Customer", "Partner", "Public Relations", "Web Site", "Campaign", "Other"], description: "Filter by lead source" },
                assignedUserId: { type: "string", description: "Filter by assigned user ID" },
                assignedUserName: { type: "string", description: "Filter by assigned user name" },
                industry: { type: "string", description: "Filter by industry" },
                createdFrom: { type: "string", description: "Filter by creation date from (YYYY-MM-DD format)" },
                createdTo: { type: "string", description: "Filter by creation date to (YYYY-MM-DD format)" },
                limit: { type: "number", description: "Maximum number of results to return", default: 20 },
                offset: { type: "number", description: "Number of records to skip", default: 0 },
              },
              required: [],
            },
          },
          {
            name: "update_lead",
            description: "Update an existing lead",
            inputSchema: {
              type: "object",
              properties: {
                leadId: { type: "string", description: "The unique ID of the lead to update" },
                firstName: { type: "string", description: "Lead's first name" },
                lastName: { type: "string", description: "Lead's last name" },
                emailAddress: { type: "string", description: "Lead's email address" },
                phoneNumber: { type: "string", description: "Lead's phone number" },
                accountName: { type: "string", description: "Company or organization name" },
                status: { type: "string", enum: ["New", "Assigned", "In Process", "Converted", "Recycled", "Dead"], description: "Lead status" },
                source: { type: "string", enum: ["Call", "Email", "Existing Customer", "Partner", "Public Relations", "Web Site", "Campaign", "Other"], description: "Lead source" },
                assignedUserId: { type: "string", description: "ID of the user to assign this lead to" },
                description: { type: "string", description: "Additional information about the lead" },
              },
              required: ["leadId"],
            },
          },
          {
            name: "convert_lead",
            description: "Convert a lead to contact, account, and/or opportunity",
            inputSchema: {
              type: "object",
              properties: {
                leadId: { type: "string", description: "The unique ID of the lead to convert" },
                createContact: { type: "boolean", description: "Whether to create a contact", default: true },
                createAccount: { type: "boolean", description: "Whether to create an account", default: true },
                createOpportunity: { type: "boolean", description: "Whether to create an opportunity", default: false },
                opportunityName: { type: "string", description: "Name for the opportunity (if creating one)" },
                opportunityAmount: { type: "number", description: "Amount for the opportunity (if creating one)" },
              },
              required: ["leadId"],
            },
          },
          {
            name: "assign_lead",
            description: "Assign or reassign a lead to a specific user",
            inputSchema: {
              type: "object",
              properties: {
                leadId: { type: "string", description: "The unique ID of the lead to assign" },
                assignedUserId: { type: "string", description: "ID of the user to assign this lead to" },
              },
              required: ["leadId", "assignedUserId"],
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
              createdFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              createdTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              modifiedFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              modifiedTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
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
            
            if (validatedArgs.createdFrom) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'createdAt',
                value: validatedArgs.createdFrom + ' 00:00:00'
              });
            }
            
            if (validatedArgs.createdTo) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'createdAt',
                value: validatedArgs.createdTo + ' 23:59:59'
              });
            }
            
            if (validatedArgs.modifiedFrom) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'modifiedAt',
                value: validatedArgs.modifiedFrom + ' 00:00:00'
              });
            }
            
            if (validatedArgs.modifiedTo) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'modifiedAt',
                value: validatedArgs.modifiedTo + ' 23:59:59'
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
              createdFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              createdTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              modifiedFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              modifiedTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
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
            
            if (validatedArgs.createdFrom) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'createdAt',
                value: validatedArgs.createdFrom + ' 00:00:00'
              });
            }
            
            if (validatedArgs.createdTo) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'createdAt',
                value: validatedArgs.createdTo + ' 23:59:59'
              });
            }
            
            if (validatedArgs.modifiedFrom) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'modifiedAt',
                value: validatedArgs.modifiedFrom + ' 00:00:00'
              });
            }
            
            if (validatedArgs.modifiedTo) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'modifiedAt',
                value: validatedArgs.modifiedTo + ' 23:59:59'
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

          case "create_meeting": {
            const schema = z.object({
              name: z.string().min(1).max(255),
              dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid ISO datetime format"),
              dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid ISO datetime format"),
              location: z.string().max(255).optional(),
              description: z.string().max(1000).optional(),
              status: z.enum(['Planned', 'Held', 'Not Held']).default('Planned'),
              parentType: z.string().optional(),
              parentId: IdSchema.optional(),
              contactsIds: z.array(IdSchema).optional(),
              usersIds: z.array(IdSchema).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const sanitizedArgs = sanitizeInput(validatedArgs);
            const meeting = await client.post<Meeting>('Meeting', sanitizedArgs);
            
            // Link contacts and users if provided
            if (validatedArgs.contactsIds?.length) {
              await client.linkRecords('Meeting', meeting.id!, 'contacts', validatedArgs.contactsIds);
            }
            if (validatedArgs.usersIds?.length) {
              await client.linkRecords('Meeting', meeting.id!, 'users', validatedArgs.usersIds);
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully created meeting "${validatedArgs.name}" (${validatedArgs.status}) with ID: ${meeting.id}`
                }
              ]
            };
          }

          case "search_meetings": {
            const schema = z.object({
              name: z.string().optional(),
              status: z.enum(['Planned', 'Held', 'Not Held']).optional(),
              dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              assignedUserName: z.string().optional(),
              location: z.string().optional(),
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
            
            if (validatedArgs.status) {
              where.push({
                type: 'equals' as const,
                attribute: 'status',
                value: validatedArgs.status
              });
            }
            
            if (validatedArgs.dateFrom) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'dateStart',
                value: validatedArgs.dateFrom + ' 00:00:00'
              });
            }
            
            if (validatedArgs.dateTo) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'dateStart',
                value: validatedArgs.dateTo + ' 23:59:59'
              });
            }
            
            if (validatedArgs.assignedUserName) {
              where.push({
                type: 'contains' as const,
                attribute: 'assignedUserName',
                value: validatedArgs.assignedUserName
              });
            }
            
            if (validatedArgs.location) {
              where.push({
                type: 'contains' as const,
                attribute: 'location',
                value: validatedArgs.location
              });
            }
            
            const response = await client.search<Meeting>('Meeting', {
              where: where.length > 0 ? where : undefined,
              select: ['id', 'name', 'status', 'dateStart', 'dateEnd', 'location', 'assignedUserName'],
              maxSize: validatedArgs.limit,
              offset: validatedArgs.offset,
              orderBy: 'dateStart',
              order: 'asc'
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: "No meetings found matching the criteria." }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatLargeResultSet(response.list, formatMeetingResults, validatedArgs.limit)
                }
              ]
            };
          }

          case "get_meeting": {
            const schema = z.object({ meetingId: IdSchema });
            const validatedArgs = schema.parse(args);
            const meeting = await client.getById<Meeting>('Meeting', validatedArgs.meetingId);
            
            return {
              content: [
                {
                  type: "text",
                  text: formatMeetingDetails(meeting)
                }
              ]
            };
          }

          case "update_meeting": {
            const schema = z.object({
              meetingId: IdSchema,
              name: z.string().min(1).max(255).optional(),
              dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid ISO datetime format").optional(),
              dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid ISO datetime format").optional(),
              location: z.string().max(255).optional(),
              description: z.string().max(1000).optional(),
              status: z.enum(['Planned', 'Held', 'Not Held']).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const { meetingId, ...updateData } = validatedArgs;
            const sanitizedData = sanitizeInput(updateData);
            
            await client.put<Meeting>('Meeting', meetingId, sanitizedData);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully updated meeting with ID: ${meetingId}`
                }
              ]
            };
          }

          case "search_users": {
            const schema = z.object({
              userName: z.string().optional(),
              emailAddress: EmailSchema.optional(),
              firstName: z.string().optional(),
              lastName: z.string().optional(),
              isActive: z.boolean().optional(),
              type: z.enum(['admin', 'regular', 'portal', 'api']).optional(),
              limit: z.number().min(1).max(200).default(20),
              offset: z.number().min(0).default(0),
            });
            
            const validatedArgs = schema.parse(args);
            const where = [];
            
            if (validatedArgs.userName) {
              where.push({
                type: 'contains' as const,
                attribute: 'userName',
                value: validatedArgs.userName
              });
            }
            
            if (validatedArgs.emailAddress) {
              where.push({
                type: 'equals' as const,
                attribute: 'emailAddress',
                value: validatedArgs.emailAddress
              });
            }
            
            if (validatedArgs.firstName) {
              where.push({
                type: 'contains' as const,
                attribute: 'firstName',
                value: validatedArgs.firstName
              });
            }
            
            if (validatedArgs.lastName) {
              where.push({
                type: 'contains' as const,
                attribute: 'lastName',
                value: validatedArgs.lastName
              });
            }
            
            if (validatedArgs.isActive !== undefined) {
              where.push({
                type: 'equals' as const,
                attribute: 'isActive',
                value: validatedArgs.isActive
              });
            }
            
            if (validatedArgs.type) {
              where.push({
                type: 'equals' as const,
                attribute: 'type',
                value: validatedArgs.type
              });
            }
            
            const response = await client.search<User>('User', {
              where: where.length > 0 ? where : undefined,
              select: ['id', 'userName', 'firstName', 'lastName', 'emailAddress', 'type', 'isActive'],
              maxSize: validatedArgs.limit,
              offset: validatedArgs.offset,
              orderBy: 'userName',
              order: 'asc'
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: "No users found matching the criteria." }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatLargeResultSet(response.list, formatUserResults, validatedArgs.limit)
                }
              ]
            };
          }

          case "get_user_by_email": {
            const schema = z.object({ emailAddress: EmailSchema });
            const validatedArgs = schema.parse(args);
            
            const response = await client.search<User>('User', {
              where: [{
                type: 'equals' as const,
                attribute: 'emailAddress',
                value: validatedArgs.emailAddress
              }],
              maxSize: 1
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: `No user found with email: ${validatedArgs.emailAddress}` }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatUserDetails(response.list[0])
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
            const meetingTest = await client.search('Meeting', { maxSize: 1 });
            
            const result = `✓ EspoCRM connection healthy
✓ API authentication working
✓ Database accessible
✓ Contact API functional
✓ Account API functional
✓ Meeting API functional
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

          case "create_task": {
            const schema = z.object({
              name: z.string().min(1).max(255),
              assignedUserId: IdSchema.optional(),
              parentType: z.enum(['Lead', 'Account', 'Contact', 'Opportunity']).optional(),
              parentId: IdSchema.optional(),
              status: z.enum(['Not Started', 'Started', 'Completed', 'Canceled', 'Deferred']).default('Not Started'),
              priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
              dateEnd: DateSchema.optional(),
              description: z.string().max(1000).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const sanitizedArgs = sanitizeInput(validatedArgs);
            const task = await client.post<Task>('Task', sanitizedArgs);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully created task "${validatedArgs.name}" (ID: ${task.id})${validatedArgs.assignedUserId ? ` assigned to user ${validatedArgs.assignedUserId}` : ''}${validatedArgs.parentType ? ` linked to ${validatedArgs.parentType} ${validatedArgs.parentId}` : ''}`
                }
              ]
            };
          }

          case "search_tasks": {
            const schema = z.object({
              name: z.string().optional(),
              assignedUserId: IdSchema.optional(),
              assignedUserName: z.string().optional(),
              status: z.enum(['Not Started', 'Started', 'Completed', 'Canceled', 'Deferred']).optional(),
              priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).optional(),
              parentType: z.enum(['Lead', 'Account', 'Contact', 'Opportunity']).optional(),
              parentId: IdSchema.optional(),
              dueDateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              dueDateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
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
            
            if (validatedArgs.assignedUserId) {
              where.push({
                type: 'equals' as const,
                attribute: 'assignedUserId',
                value: validatedArgs.assignedUserId
              });
            }
            
            if (validatedArgs.assignedUserName) {
              where.push({
                type: 'contains' as const,
                attribute: 'assignedUserName',
                value: validatedArgs.assignedUserName
              });
            }
            
            if (validatedArgs.status) {
              where.push({
                type: 'equals' as const,
                attribute: 'status',
                value: validatedArgs.status
              });
            }
            
            if (validatedArgs.priority) {
              where.push({
                type: 'equals' as const,
                attribute: 'priority',
                value: validatedArgs.priority
              });
            }
            
            if (validatedArgs.parentType) {
              where.push({
                type: 'equals' as const,
                attribute: 'parentType',
                value: validatedArgs.parentType
              });
            }
            
            if (validatedArgs.parentId) {
              where.push({
                type: 'equals' as const,
                attribute: 'parentId',
                value: validatedArgs.parentId
              });
            }
            
            if (validatedArgs.dueDateFrom) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'dateEnd',
                value: validatedArgs.dueDateFrom
              });
            }
            
            if (validatedArgs.dueDateTo) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'dateEnd',
                value: validatedArgs.dueDateTo
              });
            }
            
            const response = await client.search<Task>('Task', {
              where: where.length > 0 ? where : undefined,
              select: ['id', 'name', 'status', 'priority', 'assignedUserName', 'parentType', 'parentName', 'dateEnd'],
              maxSize: validatedArgs.limit,
              offset: validatedArgs.offset,
              orderBy: 'dateEnd',
              order: 'asc'
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: "No tasks found matching the criteria." }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatLargeResultSet(response.list, formatTaskResults, validatedArgs.limit)
                }
              ]
            };
          }

          case "get_task": {
            const schema = z.object({ taskId: IdSchema });
            const validatedArgs = schema.parse(args);
            const task = await client.getById<Task>('Task', validatedArgs.taskId);
            
            return {
              content: [
                {
                  type: "text",
                  text: formatTaskDetails(task)
                }
              ]
            };
          }

          case "update_task": {
            const schema = z.object({
              taskId: IdSchema,
              name: z.string().min(1).max(255).optional(),
              assignedUserId: IdSchema.optional(),
              status: z.enum(['Not Started', 'Started', 'Completed', 'Canceled', 'Deferred']).optional(),
              priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).optional(),
              dateEnd: DateSchema.optional(),
              description: z.string().max(1000).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const { taskId, ...updateData } = validatedArgs;
            const sanitizedData = sanitizeInput(updateData);
            
            await client.put<Task>('Task', taskId, sanitizedData);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully updated task with ID: ${taskId}`
                }
              ]
            };
          }

          case "assign_task": {
            const schema = z.object({
              taskId: IdSchema,
              assignedUserId: IdSchema,
            });
            
            const validatedArgs = schema.parse(args);
            const updateData = { assignedUserId: validatedArgs.assignedUserId };
            
            await client.put<Task>('Task', validatedArgs.taskId, updateData);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully assigned task ${validatedArgs.taskId} to user ${validatedArgs.assignedUserId}`
                }
              ]
            };
          }

          case "create_lead": {
            const schema = z.object({
              firstName: NameSchema,
              lastName: NameSchema,
              emailAddress: EmailSchema.optional(),
              phoneNumber: PhoneSchema.optional(),
              accountName: z.string().max(255).optional(),
              website: UrlSchema.optional(),
              status: z.enum(['New', 'Assigned', 'In Process', 'Converted', 'Recycled', 'Dead']).default('New'),
              source: z.enum(['Call', 'Email', 'Existing Customer', 'Partner', 'Public Relations', 'Web Site', 'Campaign', 'Other']),
              industry: z.string().max(100).optional(),
              assignedUserId: IdSchema.optional(),
              description: z.string().max(1000).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const sanitizedArgs = sanitizeInput(validatedArgs);
            const lead = await client.post<Lead>('Lead', sanitizedArgs);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully created lead: ${validatedArgs.firstName} ${validatedArgs.lastName} (ID: ${lead.id})`
                }
              ]
            };
          }

          case "search_leads": {
            const schema = z.object({
              name: z.string().optional(),
              emailAddress: EmailSchema.optional(),
              accountName: z.string().optional(),
              status: z.enum(['New', 'Assigned', 'In Process', 'Converted', 'Recycled', 'Dead']).optional(),
              source: z.enum(['Call', 'Email', 'Existing Customer', 'Partner', 'Public Relations', 'Web Site', 'Campaign', 'Other']).optional(),
              assignedUserId: IdSchema.optional(),
              assignedUserName: z.string().optional(),
              industry: z.string().optional(),
              createdFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              createdTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, use YYYY-MM-DD").optional(),
              limit: z.number().min(1).max(200).default(20),
              offset: z.number().min(0).default(0),
            });
            
            const validatedArgs = schema.parse(args);
            const where = [];
            
            if (validatedArgs.name) {
              where.push({
                type: 'or' as const,
                value: [
                  { type: 'contains' as const, attribute: 'firstName', value: validatedArgs.name },
                  { type: 'contains' as const, attribute: 'lastName', value: validatedArgs.name }
                ]
              });
            }
            
            if (validatedArgs.emailAddress) {
              where.push({
                type: 'equals' as const,
                attribute: 'emailAddress',
                value: validatedArgs.emailAddress
              });
            }
            
            if (validatedArgs.accountName) {
              where.push({
                type: 'contains' as const,
                attribute: 'accountName',
                value: validatedArgs.accountName
              });
            }
            
            if (validatedArgs.status) {
              where.push({
                type: 'equals' as const,
                attribute: 'status',
                value: validatedArgs.status
              });
            }
            
            if (validatedArgs.source) {
              where.push({
                type: 'equals' as const,
                attribute: 'source',
                value: validatedArgs.source
              });
            }
            
            if (validatedArgs.assignedUserId) {
              where.push({
                type: 'equals' as const,
                attribute: 'assignedUserId',
                value: validatedArgs.assignedUserId
              });
            }
            
            if (validatedArgs.assignedUserName) {
              where.push({
                type: 'contains' as const,
                attribute: 'assignedUserName',
                value: validatedArgs.assignedUserName
              });
            }
            
            if (validatedArgs.industry) {
              where.push({
                type: 'contains' as const,
                attribute: 'industry',
                value: validatedArgs.industry
              });
            }
            
            if (validatedArgs.createdFrom) {
              where.push({
                type: 'greaterThanOrEquals' as const,
                attribute: 'createdAt',
                value: validatedArgs.createdFrom + ' 00:00:00'
              });
            }
            
            if (validatedArgs.createdTo) {
              where.push({
                type: 'lessThanOrEquals' as const,
                attribute: 'createdAt',
                value: validatedArgs.createdTo + ' 23:59:59'
              });
            }
            
            const response = await client.search<Lead>('Lead', {
              where: where.length > 0 ? where : undefined,
              select: ['id', 'firstName', 'lastName', 'emailAddress', 'accountName', 'status', 'source', 'assignedUserName'],
              maxSize: validatedArgs.limit,
              offset: validatedArgs.offset,
              orderBy: 'lastName',
              order: 'asc'
            });
            
            if (!response.list?.length) {
              return {
                content: [{ type: "text", text: "No leads found matching the criteria." }]
              };
            }
            
            return {
              content: [
                {
                  type: "text",
                  text: formatLargeResultSet(response.list, formatLeadResults, validatedArgs.limit)
                }
              ]
            };
          }

          case "update_lead": {
            const schema = z.object({
              leadId: IdSchema,
              firstName: NameSchema.optional(),
              lastName: NameSchema.optional(),
              emailAddress: EmailSchema.optional(),
              phoneNumber: PhoneSchema.optional(),
              accountName: z.string().max(255).optional(),
              status: z.enum(['New', 'Assigned', 'In Process', 'Converted', 'Recycled', 'Dead']).optional(),
              source: z.enum(['Call', 'Email', 'Existing Customer', 'Partner', 'Public Relations', 'Web Site', 'Campaign', 'Other']).optional(),
              assignedUserId: IdSchema.optional(),
              description: z.string().max(1000).optional(),
            });
            
            const validatedArgs = schema.parse(args);
            const { leadId, ...updateData } = validatedArgs;
            const sanitizedData = sanitizeInput(updateData);
            
            await client.put<Lead>('Lead', leadId, sanitizedData);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully updated lead with ID: ${leadId}`
                }
              ]
            };
          }

          case "convert_lead": {
            const schema = z.object({
              leadId: IdSchema,
              createContact: z.boolean().default(true),
              createAccount: z.boolean().default(true),
              createOpportunity: z.boolean().default(false),
              opportunityName: z.string().optional(),
              opportunityAmount: z.number().positive().optional(),
            });
            
            const validatedArgs = schema.parse(args);
            
            // This is a complex operation that requires multiple API calls
            // First get the lead details
            const lead = await client.getById<Lead>('Lead', validatedArgs.leadId);
            
            let contactId, accountId, opportunityId;
            const results = [];
            
            // Create Account if requested
            if (validatedArgs.createAccount && lead.accountName) {
              const account = await client.post<Account>('Account', {
                name: lead.accountName,
                website: lead.website,
                industry: lead.industry,
                assignedUserId: lead.assignedUserId,
              });
              accountId = account.id;
              results.push(`Created account: ${lead.accountName} (ID: ${account.id})`);
            }
            
            // Create Contact if requested
            if (validatedArgs.createContact) {
              const contact = await client.post<Contact>('Contact', {
                firstName: lead.firstName,
                lastName: lead.lastName,
                emailAddress: lead.emailAddress,
                phoneNumber: lead.phoneNumber,
                accountId: accountId,
                assignedUserId: lead.assignedUserId,
                description: lead.description,
              });
              contactId = contact.id;
              results.push(`Created contact: ${lead.firstName} ${lead.lastName} (ID: ${contact.id})`);
            }
            
            // Create Opportunity if requested
            if (validatedArgs.createOpportunity && accountId && validatedArgs.opportunityName) {
              const opportunity = await client.post<Opportunity>('Opportunity', {
                name: validatedArgs.opportunityName,
                accountId: accountId,
                stage: 'Prospecting',
                amount: validatedArgs.opportunityAmount,
                closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                assignedUserId: lead.assignedUserId,
              });
              opportunityId = opportunity.id;
              results.push(`Created opportunity: ${validatedArgs.opportunityName} (ID: ${opportunity.id})`);
            }
            
            // Update lead status to Converted
            await client.put<Lead>('Lead', validatedArgs.leadId, { status: 'Converted' });
            results.push(`Lead ${validatedArgs.leadId} marked as Converted`);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully converted lead ${validatedArgs.leadId}:\n${results.join('\n')}`
                }
              ]
            };
          }

          case "assign_lead": {
            const schema = z.object({
              leadId: IdSchema,
              assignedUserId: IdSchema,
            });
            
            const validatedArgs = schema.parse(args);
            const updateData = { assignedUserId: validatedArgs.assignedUserId };
            
            await client.put<Lead>('Lead', validatedArgs.leadId, updateData);
            
            return {
              content: [
                {
                  type: "text",
                  text: `Successfully assigned lead ${validatedArgs.leadId} to user ${validatedArgs.assignedUserId}`
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