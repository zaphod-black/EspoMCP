# EspoCRM MCP Server

A comprehensive Model Context Protocol (MCP) server for seamless integration with EspoCRM. This server enables AI assistants to interact with your EspoCRM instance through a standardized interface, providing complete CRUD operations for Contacts, Accounts, Opportunities, Meetings, Users, and advanced system management capabilities.

## Features

### Core Capabilities
- **Complete CRUD Operations** - Create, read, update, and delete entities
- **Multi-Entity Support** - Contacts, Accounts, Opportunities, Meetings, and Users
- **Advanced Search & Filtering** - Flexible search with date ranges, pagination, and complex filters
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

The MCP server provides 17 comprehensive tools for EspoCRM integration:

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