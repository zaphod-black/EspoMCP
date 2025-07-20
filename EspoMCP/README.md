# EspoCRM MCP Server

A comprehensive Model Context Protocol (MCP) server for seamless integration with EspoCRM. This server enables AI assistants to interact with your EspoCRM instance through a standardized interface, providing complete CRUD operations for Contacts, Accounts, Opportunities, Meetings, Users, Tasks, Leads, and advanced system management capabilities.

**🤖 NEW: AI Chatbot Integration** - Now includes a complete chatbot interface that embeds directly into your EspoCRM, providing natural language access to all 47 MCP tools!

## Features

### Core Capabilities
- **Complete CRUD Operations** - Create, read, update, and delete entities
- **Multi-Entity Support** - Contacts, Accounts, Opportunities, Meetings, Users, Tasks, and Leads
- **Advanced Search & Filtering** - Flexible search with date ranges, pagination, and complex filters
- **Task Management** - Complete task lifecycle with parent relationships and user assignment
- **Lead Management** - Full lead pipeline from creation to conversion
- **Meeting Management** - Full calendar integration with attendee management
- **User Management** - Comprehensive user search and lookup capabilities
- **Real-time Validation** - Zod-based schema validation for all operations
- **Comprehensive Logging** - Winston-powered logging with multiple levels

### Authentication & Security
- **Multiple Auth Methods** - API Key and HMAC authentication support
- **Secure Configuration** - Environment-based configuration management
- **Rate Limiting** - Built-in rate limiting for API protection
- **Error Handling** - Robust error handling with detailed logging

### Calendar Integration
- **Meeting Operations** - Create, search, update, and manage meetings
- **Attendee Management** - Link contacts and users to meetings
- **Date/Time Filtering** - Advanced date range search capabilities
- **Google Calendar Sync Compatibility** - Designed for calendar synchronization workflows

### AI Chatbot Integration 🤖
- **Floating Chat Widget** - Beautiful, non-intrusive chat bubble interface
- **Natural Language Processing** - Chat in plain English to perform CRM operations
- **Real-time Communication** - WebSocket-powered instant responses
- **47 MCP Tools Access** - Complete CRM functionality via chat
- **EspoCRM Embedding** - Integrates directly into your EspoCRM interface
- **Mobile Responsive** - Works seamlessly on all devices

### Developer Experience
- **TypeScript** - Full TypeScript support with strict typing
- **Docker Support** - Containerized deployment ready
- **Comprehensive Testing** - Multiple test scripts and validation tools
- **MCP 2024/2025 Compliant** - Latest MCP specification support

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- EspoCRM instance with API access
- Valid API credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/zaphod-black/EspoMCP.git
cd EspoMCP
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your EspoCRM credentials
```

4. **Build the project**
```bash
npm run build
```

5. **Test the connection**
```bash
npm run test:config
```

## 🤖 AI Chatbot Quick Start

### Deploy Chatbot Interface

1. **Navigate to chatbot directory**
```bash
cd chatbot-bridge
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your EspoCRM settings
```

4. **Start chatbot server**
```bash
npm start
# Or with Docker: docker-compose up -d
```

5. **Integrate with EspoCRM**
Add to your EspoCRM footer template:
```html
<script>
  window.ESPOCRM_CHAT_SERVER = 'http://your-server:3001';
</script>
<script src="http://your-server:3001/socket.io/socket.io.js"></script>
<script src="http://your-server:3001/api/widget.js"></script>
```

6. **Try the Demo**
Visit `http://localhost:3001/widget` to see the chatbot in action!

### Environment Configuration

Create a `.env` file with your EspoCRM configuration:

```env
# EspoCRM Configuration
ESPOCRM_URL=https://your-espocrm-instance.com
ESPOCRM_API_KEY=your-api-key-here
ESPOCRM_AUTH_METHOD=apikey

# Optional: HMAC Authentication
# ESPOCRM_SECRET_KEY=your-secret-key
# ESPOCRM_AUTH_METHOD=hmac

# Server Configuration (Optional)
MCP_TRANSPORT=stdio
RATE_LIMIT=100
REQUEST_TIMEOUT=30000
LOG_LEVEL=info
```

### Required Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ESPOCRM_URL` | Your EspoCRM instance URL | Yes | - |
| `ESPOCRM_API_KEY` | API key for authentication | Yes | - |
| `ESPOCRM_AUTH_METHOD` | Authentication method (`apikey` or `hmac`) | Yes | `apikey` |
| `ESPOCRM_SECRET_KEY` | Secret key for HMAC auth | No | - |
| `MCP_TRANSPORT` | MCP transport method | No | `stdio` |
| `RATE_LIMIT` | Requests per minute limit | No | `100` |
| `REQUEST_TIMEOUT` | Request timeout in milliseconds | No | `30000` |
| `LOG_LEVEL` | Logging level | No | `info` |

## Available Tools

The MCP server provides 47 comprehensive tools for EspoCRM integration:

### Contact Management
- **`create_contact`** - Create new contacts with full field support
- **`search_contacts`** - Search and filter contacts with date range filtering
- **`get_contact`** - Retrieve specific contact by ID

### Account Management  
- **`create_account`** - Create new company/organization accounts
- **`search_accounts`** - Search and filter accounts with date range filtering

### Opportunity Management
- **`create_opportunity`** - Create new sales opportunities
- **`search_opportunities`** - Search opportunities with advanced filters including amount ranges

### Meeting Management
- **`create_meeting`** - Create meetings with attendee management and calendar integration
- **`search_meetings`** - Search meetings with date ranges, status, and location filters
- **`get_meeting`** - Retrieve detailed meeting information including attendees
- **`update_meeting`** - Update existing meetings with support for all meeting fields

### User Management
- **`search_users`** - Search users by username, email, name, type, and status
- **`get_user_by_email`** - Direct email-based user lookup for calendar sync operations

### Task Management
- **`create_task`** - Create tasks with parent entity support (Lead, Account, Contact, Opportunity)
- **`search_tasks`** - Search tasks by assignee, status, priority, parent entity, and due dates
- **`get_task`** - Retrieve detailed task information including relationships
- **`update_task`** - Update task properties including status, priority, and due date
- **`assign_task`** - Assign or reassign tasks to specific users

### Lead Management
- **`create_lead`** - Create new leads with full field support and validation
- **`search_leads`** - Search leads by status, source, assignee, and date ranges
- **`update_lead`** - Update lead properties and status
- **`convert_lead`** - Convert leads to contacts, accounts, and/or opportunities
- **`assign_lead`** - Assign or reassign leads to specific users

### Team & Role Management
- **`add_user_to_team`** - Add users to teams with optional position assignment
- **`remove_user_from_team`** - Remove users from teams
- **`assign_role_to_user`** - Assign roles to users for permissions management
- **`get_user_teams`** - Get all teams that a user belongs to
- **`get_team_members`** - Get all members of a specific team
- **`search_teams`** - Search teams by name and description
- **`get_user_permissions`** - Get effective permissions for a user based on roles

### Generic Entity Operations
- **`create_entity`** - Create records for any entity type (including custom entities)
- **`search_entity`** - Search any entity type with flexible filters and field selection
- **`update_entity`** - Update any entity record by ID with flexible data
- **`delete_entity`** - Delete any entity record by ID
- **`get_entity`** - Get specific entity records with optional field selection

### Relationship Management
- **`link_entities`** - Create relationships between any two entity records
- **`unlink_entities`** - Remove relationships between entity records
- **`get_entity_relationships`** - Get all related records for an entity with relationship details

### Communication Tools
- **`create_call`** - Create call records with status, direction, and duration tracking
- **`search_calls`** - Search calls by status, direction, contact, and date ranges
- **`create_case`** - Create support cases with priority, type, and account linking
- **`search_cases`** - Search cases by status, priority, type, and assignment
- **`add_note`** - Add notes to any entity record for documentation and follow-up
- **`search_notes`** - Search notes by parent entity, author, and date ranges
- **`create_document`** - Create document records with file attachments and metadata

### System Tools
- **`health_check`** - Verify server and EspoCRM connectivity across all entities

## Enhanced Search Capabilities

All search tools now support advanced filtering options:

### Date Range Filtering
- **`createdFrom`** / **`createdTo`** - Filter by creation date range
- **`modifiedFrom`** / **`modifiedTo`** - Filter by modification date range
- **`dateFrom`** / **`dateTo`** - Filter meetings by date range

### Meeting-Specific Filters
- **`status`** - Filter by meeting status (Planned, Held, Not Held)
- **`location`** - Filter by meeting location
- **`assignedUserName`** - Filter by assigned user

### User-Specific Filters
- **`userName`** - Search by username
- **`emailAddress`** - Search by email address
- **`firstName`** / **`lastName`** - Search by name components
- **`isActive`** - Filter by active status
- **`type`** - Filter by user type (admin, regular, portal, api)

## Usage Examples

### Task Management

```javascript
// Create a task assigned to a user with parent relationship
await client.callTool('create_task', {
  name: 'Follow up on lead discussion',
  assignedUserId: 'user123',
  parentType: 'Lead',
  parentId: 'lead456',
  priority: 'High',
  status: 'Not Started',
  dateEnd: '2025-08-15',
  description: 'Contact lead about pricing questions'
});

// Search tasks by assignee and status
await client.callTool('search_tasks', {
  assignedUserId: 'user123',
  status: 'Started',
  priority: 'High',
  dueDateFrom: '2025-08-01',
  dueDateTo: '2025-08-31'
});

// Assign task to different user
await client.callTool('assign_task', {
  taskId: 'task789',
  assignedUserId: 'user456'
});
```

### Lead Management

```javascript
// Create a new lead
await client.callTool('create_lead', {
  firstName: 'John',
  lastName: 'Smith',
  emailAddress: 'john.smith@example.com',
  accountName: 'Smith Industries',
  source: 'Web Site',
  status: 'New',
  assignedUserId: 'user123',
  description: 'Interested in enterprise solution'
});

// Search leads by status and source
await client.callTool('search_leads', {
  status: 'In Process',
  source: 'Web Site',
  assignedUserName: 'Sales Rep',
  createdFrom: '2025-08-01',
  limit: 20
});

// Convert lead to contact and account
await client.callTool('convert_lead', {
  leadId: 'lead123',
  createContact: true,
  createAccount: true,
  createOpportunity: true,
  opportunityName: 'Smith Industries - Enterprise Deal',
  opportunityAmount: 50000
});
```

### Team & Role Management

```javascript
// Add user to team with position
await client.callTool('add_user_to_team', {
  userId: 'user123',
  teamId: 'sales-team',
  position: 'Sales Manager'
});

// Get all members of a team
await client.callTool('get_team_members', {
  teamId: 'sales-team',
  limit: 50
});

// Assign role to user for permissions
await client.callTool('assign_role_to_user', {
  userId: 'user123',
  roleId: 'manager-role'
});

// Search teams by criteria
await client.callTool('search_teams', {
  name: 'Sales',
  description: 'revenue'
});

// Get user's effective permissions
await client.callTool('get_user_permissions', {
  userId: 'user123'
});
```

### Generic Entity Operations

```javascript
// Create any entity type (including custom entities)
await client.callTool('create_entity', {
  entityType: 'CustomProduct',
  data: {
    name: 'Premium Widget',
    price: 199.99,
    category: 'Electronics',
    inStock: true
  }
});

// Search any entity with flexible filters
await client.callTool('search_entity', {
  entityType: 'CustomOrder',
  filters: {
    status: 'pending',
    totalAmount: 1000,
    customerType: 'enterprise'
  },
  select: ['id', 'orderNumber', 'customerName', 'totalAmount'],
  orderBy: 'createdAt',
  order: 'desc'
});

// Update any entity record
await client.callTool('update_entity', {
  entityType: 'CustomProduct',
  entityId: 'prod123',
  data: {
    price: 179.99,
    inStock: false,
    lastModified: '2025-07-20T10:30:00Z'
  }
});

// Delete any entity record
await client.callTool('delete_entity', {
  entityType: 'CustomProduct',
  entityId: 'prod123'
});

// Get specific entity with field selection
await client.callTool('get_entity', {
  entityType: 'CustomOrder',
  entityId: 'order456',
  select: ['orderNumber', 'customerName', 'items', 'totalAmount']
});
```

### Relationship Management

```javascript
// Link entities together (e.g., link contact to account)
await client.callTool('link_entities', {
  entityType: 'Contact',
  entityId: 'contact123',
  relatedEntityType: 'Account',
  relatedEntityId: 'account456',
  relationshipName: 'accounts'
});

// Get all relationships for an entity
await client.callTool('get_entity_relationships', {
  entityType: 'Contact',
  entityId: 'contact123',
  relationshipName: 'opportunities'
});

// Remove relationship between entities
await client.callTool('unlink_entities', {
  entityType: 'Contact',
  entityId: 'contact123',
  relatedEntityType: 'Account',
  relatedEntityId: 'account456',
  relationshipName: 'accounts'
});
```

### Communication Tools

```javascript
// Create a call record
await client.callTool('create_call', {
  name: 'Follow-up call with John Smith',
  status: 'Held',
  direction: 'Outbound',
  duration: 1800, // 30 minutes in seconds
  parentType: 'Contact',
  parentId: 'contact123',
  description: 'Discussed pricing options and next steps'
});

// Search calls by criteria
await client.callTool('search_calls', {
  status: 'Held',
  direction: 'Outbound',
  dateFrom: '2025-07-01',
  dateTo: '2025-07-31',
  limit: 20
});

// Create a support case
await client.callTool('create_case', {
  name: 'Login Issues',
  status: 'New',
  priority: 'High',
  type: 'Technical',
  accountId: 'account123',
  description: 'Customer unable to login to portal'
});

// Add a note to any entity
await client.callTool('add_note', {
  parentType: 'Lead',
  parentId: 'lead123',
  post: 'Customer expressed interest in enterprise features. Schedule demo next week.',
  data: {
    isInternal: false
  }
});

// Search notes by parent entity
await client.callTool('search_notes', {
  parentType: 'Lead',
  parentId: 'lead123',
  createdFrom: '2025-07-01',
  limit: 10
});
```

### AI Chatbot Usage

The embedded chatbot understands natural language and can perform any CRM operation:

```javascript
// Natural language examples users can type:
"Create a contact named Sarah Johnson with email sarah@techcorp.com"
"Find all accounts in the software industry"
"Show me opportunities over $50,000"
"Create a task to follow up with lead John Smith"
"Schedule a meeting for tomorrow at 2 PM"
"What's the system health status?"
"Link contact ID 123 to account TechCorp"
"Add a note to case #456 saying 'Customer satisfied with resolution'"
```

### Meeting Management

```javascript
// Create a meeting with attendees
await client.callTool('create_meeting', {
  name: 'Project Kickoff Meeting',
  dateStart: '2025-08-01T10:00:00',
  dateEnd: '2025-08-01T11:00:00',
  location: 'Conference Room A',
  description: 'Initial project planning session',
  status: 'Planned',
  contactsIds: ['contact123', 'contact456'],
  usersIds: ['user789']
});

// Search meetings by date range
await client.callTool('search_meetings', {
  dateFrom: '2025-08-01',
  dateTo: '2025-08-31',
  status: 'Planned',
  limit: 20
});
```

### User Management

```javascript
// Find user by email
await client.callTool('get_user_by_email', {
  emailAddress: 'john.doe@company.com'
});

// Search active users
await client.callTool('search_users', {
  isActive: true,
  type: 'regular',
  limit: 50
});
```

### Advanced Contact Search with Date Filtering

```javascript
// Search contacts created in the last week
await client.callTool('search_contacts', {
  searchTerm: 'manager',
  createdFrom: '2025-07-13',
  createdTo: '2025-07-20',
  limit: 10
});
```

### Calendar Integration Workflow

```javascript
// Complete workflow for calendar sync
const meetings = await client.callTool('search_meetings', {
  dateFrom: '2025-08-01',
  dateTo: '2025-08-31'
});

const user = await client.callTool('get_user_by_email', {
  emailAddress: 'calendar@company.com'
});

const newMeeting = await client.callTool('create_meeting', {
  name: 'Synced from Google Calendar',
  dateStart: '2025-08-15T14:00:00',
  dateEnd: '2025-08-15T15:00:00',
  googleEventId: 'google_event_123'
});
```

## Testing

### Automated Testing

The project includes comprehensive testing tools:

```bash
# Test configuration and connectivity
npm run test:config

# Test MCP client functionality
npm run test:client

# Run unit tests
npm test
```

### Manual Testing Scripts

#### Connection Testing
```bash
node test-connection.js
```
Tests basic connectivity, API endpoints, and authentication.

#### Enhanced Tools Testing
```bash
node test-enhanced-tools.js
```
Comprehensive test of all enhanced features including meetings and users.

#### Random Contact Generation
```bash
node create-random-contact.js
```
Creates a random test contact to verify CRUD operations.

## Development

### Project Structure

```
EspoMCP/
├── src/                     # Source code
│   ├── config/             # Configuration management
│   ├── espocrm/           # EspoCRM API client and types
│   │   ├── client.ts      # HTTP client with authentication
│   │   └── types.ts       # TypeScript interfaces for all entities
│   ├── tools/             # MCP tool implementations
│   ├── utils/             # Utility functions and formatting
│   │   ├── errors.ts      # Error handling utilities
│   │   ├── formatting.ts  # Entity formatting functions
│   │   ├── logger.ts      # Winston logger configuration
│   │   └── validation.ts  # Zod schema validation
│   └── index.ts           # Main server entry point
├── tests/                  # Test files
├── build/                  # Compiled JavaScript
├── logs/                   # Application logs
└── docs/                   # Documentation
```

### Key Components

#### MCP Server (`src/index.ts`)
Main server implementation with environment loading, graceful shutdown handling, and MCP protocol compliance.

#### EspoCRM Client (`src/espocrm/client.ts`)
HTTP client with authentication, error handling, logging, and comprehensive CRUD operations.

#### Entity Types (`src/espocrm/types.ts`)
Complete TypeScript interfaces for Contact, Account, Opportunity, Meeting, User, and related entities.

#### Tool Registry (`src/tools/index.ts`)
Central registry for all MCP tools with proper type safety, validation, and error handling.

#### Formatting Utilities (`src/utils/formatting.ts`)
Professional formatting functions for all entity types with consistent output formatting.

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Build the project** with `npm run build`
3. **Test changes** with `npm run test:config`
4. **Test enhanced features** with `npm run test:client`
5. **Lint code** with `npm run lint`

## Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
npm run docker:build

# Run with environment file
npm run docker:run
```

### Docker Compose

```yaml
version: '3.8'
services:
  espocrm-mcp:
    build: .
    environment:
      - ESPOCRM_URL=${ESPOCRM_URL}
      - ESPOCRM_API_KEY=${ESPOCRM_API_KEY}
      - ESPOCRM_AUTH_METHOD=apikey
      - MCP_TRANSPORT=stdio
      - RATE_LIMIT=100
      - LOG_LEVEL=info
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

## Calendar Sync Integration

This MCP server is specifically designed to work seamlessly with calendar synchronization systems:

### Google Calendar Sync Compatibility
- Meeting entities include `googleEventId` field for sync tracking
- User lookup by email for attendee management
- Date range filtering for efficient sync operations
- Attendee linking through `contactsIds` and `usersIds`

### Sync Prevention Features
- Comprehensive entity tracking to prevent duplicate creation
- Support for external system identifiers
- Robust error handling for sync operations

### Workflow Integration
```javascript
// Typical calendar sync workflow
const existingMeetings = await client.callTool('search_meetings', {
  dateFrom: syncStartDate,
  dateTo: syncEndDate
});

const user = await client.callTool('get_user_by_email', {
  emailAddress: assignedUserEmail
});

// Create meetings from external calendar
for (const externalEvent of externalEvents) {
  await client.callTool('create_meeting', {
    name: externalEvent.title,
    dateStart: externalEvent.start,
    dateEnd: externalEvent.end,
    googleEventId: externalEvent.id,
    description: externalEvent.description
  });
}
```

## Troubleshooting

### Common Issues

#### Connection Failures
```bash
# Test basic connectivity
node test-connection.js

# Check environment variables
npm run test:config

# Test specific endpoints
curl -H "X-Api-Key: YOUR_API_KEY" http://your-espocrm.com/api/v1/App/user
```

#### Authentication Issues
- Verify API key is correct and active
- Check user permissions in EspoCRM
- Ensure API access is enabled for the user
- Verify the correct API endpoint format

#### Meeting Creation Issues
- Ensure required fields (name, dateStart, dateEnd) are provided
- Verify date format is ISO 8601 (YYYY-MM-DDTHH:mm:ss)
- Check user permissions for meeting creation
- Validate contact and user IDs exist before linking

#### User Search Issues
- Verify user has permission to access User entity
- Check if users exist in the system
- Ensure email addresses are correctly formatted

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
```

View detailed logs:
```bash
tail -f logs/espocrm-mcp.log
```

### Connection Diagnostics

Test specific API endpoints:
```bash
# Test user endpoint
curl -H "X-Api-Key: YOUR_KEY" http://your-espocrm.com/api/v1/App/user

# Test meeting search
curl -H "X-Api-Key: YOUR_KEY" "http://your-espocrm.com/api/v1/Meeting?maxSize=1"

# Test user search  
curl -H "X-Api-Key: YOUR_KEY" "http://your-espocrm.com/api/v1/User?maxSize=1"
```

## API Reference

### Tool Schemas

All tools use Zod schemas for validation. Key schemas include:

#### Contact Schema
```typescript
{
  firstName: string,
  lastName: string,
  emailAddress?: string,
  phoneNumber?: string,
  title?: string,
  department?: string,
  accountId?: string,
  description?: string
}
```

#### Meeting Schema
```typescript
{
  name: string,
  dateStart: string,        // ISO 8601 format
  dateEnd: string,          // ISO 8601 format
  location?: string,
  description?: string,
  status?: 'Planned' | 'Held' | 'Not Held',
  parentType?: string,
  parentId?: string,
  contactsIds?: string[],   // Array of contact IDs
  usersIds?: string[],      // Array of user IDs
  googleEventId?: string    // For calendar sync
}
```

#### User Schema
```typescript
{
  userName: string,
  firstName?: string,
  lastName?: string,
  emailAddress?: string,
  phoneNumber?: string,
  isActive?: boolean,
  type?: 'admin' | 'regular' | 'portal' | 'api'
}
```

#### Task Schema
```typescript
{
  name: string,
  assignedUserId?: string,
  parentType?: 'Lead' | 'Account' | 'Contact' | 'Opportunity',
  parentId?: string,
  status?: 'Not Started' | 'Started' | 'Completed' | 'Canceled' | 'Deferred',
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent',
  dateEnd?: string,         // Due date in YYYY-MM-DD format
  description?: string
}
```

#### Lead Schema
```typescript
{
  firstName: string,
  lastName: string,
  emailAddress?: string,
  phoneNumber?: string,
  accountName?: string,     // Company name
  website?: string,
  status?: 'New' | 'Assigned' | 'In Process' | 'Converted' | 'Recycled' | 'Dead',
  source: 'Call' | 'Email' | 'Existing Customer' | 'Partner' | 'Public Relations' | 'Web Site' | 'Campaign' | 'Other',
  industry?: string,
  assignedUserId?: string,
  description?: string
}
```

#### Team Schema
```typescript
{
  name: string,
  description?: string,
  positionList?: string[],  // Available positions in the team
}
```

#### Generic Entity Schema
```typescript
{
  entityType: string,       // Entity type name (e.g., 'Contact', 'CustomProduct')
  data: {                   // Flexible key-value pairs
    [key: string]: any
  },
  // Optional for search/get operations
  filters?: {
    [field: string]: any
  },
  select?: string[],        // Fields to retrieve
  orderBy?: string,
  order?: 'asc' | 'desc'
}
```

#### Call Schema
```typescript
{
  name: string,
  status?: 'Planned' | 'Held' | 'Not Held',
  direction?: 'Inbound' | 'Outbound',
  duration?: number,        // Duration in seconds
  parentType?: string,      // Related entity type
  parentId?: string,        // Related entity ID
  assignedUserId?: string,
  description?: string
}
```

#### Case Schema
```typescript
{
  name: string,
  status?: 'New' | 'Assigned' | 'Pending' | 'Closed' | 'Rejected' | 'Duplicate',
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent',
  type?: string,            // Case type
  accountId?: string,       // Related account
  contactId?: string,       // Related contact
  assignedUserId?: string,
  description?: string
}
```

#### Note Schema
```typescript
{
  parentType: string,       // Entity type the note is attached to
  parentId: string,         // Entity ID the note is attached to
  post: string,             // Note content
  data?: {                  // Additional note data
    isInternal?: boolean,   // Internal note flag
    [key: string]: any
  }
}
```

#### Relationship Schema
```typescript
{
  entityType: string,       // Source entity type
  entityId: string,         // Source entity ID
  relatedEntityType: string, // Target entity type
  relatedEntityId: string,  // Target entity ID
  relationshipName: string  // Relationship field name
}
```

#### Team Management Operations
```typescript
// Add user to team
{
  userId: string,
  teamId: string,
  position?: string         // Optional position within team
}

// Role assignment
{
  userId: string,
  roleId: string
}
```

#### Search Parameters
```typescript
{
  searchTerm?: string,
  limit?: number,           // Default: 20, Max: 200
  offset?: number,          // Default: 0
  createdFrom?: string,     // YYYY-MM-DD format
  createdTo?: string,       // YYYY-MM-DD format
  modifiedFrom?: string,    // YYYY-MM-DD format
  modifiedTo?: string,      // YYYY-MM-DD format
  // Entity-specific filters...
}
```

### Response Formats

#### Standard List Response
```json
{
  "total": 150,
  "list": [
    {
      "id": "entity123",
      "name": "Entity Name",
      "createdAt": "2025-07-20T10:30:00Z",
      "modifiedAt": "2025-07-20T15:45:00Z"
    }
  ]
}
```

#### Meeting Response
```json
{
  "id": "meeting123",
  "name": "Project Meeting",
  "status": "Planned",
  "dateStart": "2025-08-01T10:00:00Z",
  "dateEnd": "2025-08-01T11:00:00Z",
  "location": "Conference Room A",
  "assignedUserName": "John Doe",
  "contacts": ["contact1", "contact2"],
  "googleEventId": "google_event_123"
}
```

## Performance Considerations

### Pagination
- Default limit: 20 results
- Maximum limit: 200 results
- Use offset for pagination through large datasets

### Rate Limiting
- Default: 100 requests per minute
- Configurable via RATE_LIMIT environment variable
- Implements exponential backoff for rate limit handling

### Caching
- No built-in caching (recommended to implement at application level)
- EspoCRM API responses are not cached to ensure data freshness

### Bulk Operations
- Individual entity operations only
- For bulk operations, iterate through arrays at the application level
- Consider rate limiting when processing large datasets

## Security Best Practices

### API Key Management
- Store API keys in environment variables only
- Rotate API keys regularly
- Use dedicated API users with minimal required permissions
- Monitor API usage logs

### Network Security
- Use HTTPS for all EspoCRM connections
- Consider VPN or private networks for sensitive data
- Implement IP whitelisting if supported by your EspoCRM instance

### Data Validation
- All inputs are validated using Zod schemas
- Sanitization is applied to prevent injection attacks
- Error messages do not expose sensitive system information

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/enhanced-search`)
3. Commit your changes (`git commit -m 'Add enhanced search capabilities'`)
4. Push to the branch (`git push origin feature/enhanced-search`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices with strict typing
- Add comprehensive tests for new functionality
- Update documentation for any new features
- Ensure all tests pass before submitting
- Follow existing code formatting and structure
- Add appropriate error handling and logging

### Testing Requirements

- Unit tests for new functionality
- Integration tests with mock EspoCRM responses
- Manual testing with real EspoCRM instances
- Documentation updates for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/zaphod-black/EspoMCP/issues)
- **Documentation**: Check the `docs/` directory for additional documentation
- **EspoCRM API**: [Official EspoCRM API Documentation](https://docs.espocrm.com/development/api/)
- **MCP Specification**: [Model Context Protocol Documentation](https://spec.modelcontextprotocol.io/)

## Changelog

### Version 2.0.0 - AI Chatbot Integration 🤖
- **Complete Chatbot Interface**: Floating chat bubble that embeds in EspoCRM
- **Natural Language Processing**: Chat in plain English to perform CRM operations
- **WebSocket Communication**: Real-time bidirectional communication
- **47 MCP Tools Access**: Full CRM functionality via conversational interface
- **Security & Rate Limiting**: Production-ready security with input validation
- **Docker Deployment**: Containerized chatbot server alongside MCP server
- **Mobile Responsive**: Beautiful interface that works on all devices
- **EspoCRM Integration**: Simple 3-line integration with existing EspoCRM instances
- **AI-Powered**: Optional OpenAI integration for advanced natural language understanding
- **Production Testing**: Comprehensive test suite and demo interface

### Version 1.5.0 - Phase 3 Complete Communication & Relationship Management
- **Relationship Management**: 3 new tools for linking/unlinking entities and managing relationships
- **Communication Tools**: 7 new tools for calls, cases, notes, and document management
- **Entity Relationship Operations**: Link/unlink any entities, get relationship details
- **Call Management**: Create and search call records with duration and direction tracking
- **Case Management**: Create and search support cases with priority and type categorization
- **Note System**: Add notes to any entity with internal/external visibility control
- **Document Management**: Create document records with file attachment support
- **Advanced Formatting**: Added specialized formatting for calls, cases, and notes
- **Tool Count**: Expanded from 39 to 47 comprehensive tools (+8 new tools)

### Version 1.4.0 - Phase 2 Complete Enterprise Solution
- **Team & Role Management**: 7 new tools for complete user/team/role administration
- **Generic Entity Operations**: 5 new tools for manipulating any EspoCRM entity (including custom entities)
- **Team Administration**: Add/remove users from teams, assign positions, get team members
- **Role Assignment**: Assign roles to users and get effective permissions
- **Universal Entity Support**: Create, read, update, delete, and search any entity type
- **Custom Entity Support**: Full support for custom EspoCRM entities and fields
- **Enhanced Type Safety**: Added Team, Role, and GenericEntity TypeScript interfaces
- **Tool Count**: Expanded from 27 to 39 comprehensive tools (+12 new tools)

### Version 1.3.0 - Phase 1 Expansion
- **Task Management**: Complete task lifecycle with 5 new tools (create, search, get, update, assign)
- **Lead Management**: Full lead pipeline with 5 new tools (create, search, update, convert, assign)
- **Parent Relationships**: Tasks can be linked to Leads, Accounts, Contacts, or Opportunities
- **Lead Conversion**: Convert leads to contacts, accounts, and opportunities in one operation
- **Advanced Task Features**: Priority levels, due dates, status tracking, and user assignment
- **Expanded Search**: Task and lead search with comprehensive filtering options
- **Type Safety**: Enhanced TypeScript interfaces for all new entities
- **Tool Count**: Expanded from 17 to 27 comprehensive tools

### Version 1.2.0
- **Enhanced Meeting Management**: Complete CRUD operations for meetings
- **User Management**: Search and lookup functionality for users
- **Advanced Date Filtering**: Date range support for all search operations
- **Calendar Sync Compatibility**: Google Calendar integration support
- **Improved Error Handling**: Better error messages and debugging
- **Connection Fix**: Resolved API endpoint compatibility issues

### Version 1.1.0
- **Extended Entity Support**: Added comprehensive type definitions
- **Enhanced Search**: Advanced filtering capabilities
- **Performance Improvements**: Optimized API client and error handling

### Version 1.0.0
- Initial release with full MCP 2024/2025 support
- Complete CRUD operations for Contacts, Accounts, Opportunities
- Docker support and comprehensive testing
- Multiple authentication methods
- Production-ready logging and error handling

---

**Enterprise-grade EspoCRM integration for modern AI applications**