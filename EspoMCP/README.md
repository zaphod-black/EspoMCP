# EspoCRM MCP Server

A comprehensive Model Context Protocol (MCP) server for EspoCRM integration, enabling AI assistants to securely interact with EspoCRM data through authenticated API calls.

## Features

### 🔧 Core CRM Operations
- **Contact Management**: Create, search, update, and manage contacts with full relationship support
- **Account Management**: Handle companies and organizations with comprehensive business data
- **Opportunity Management**: Track sales pipeline with stage management and forecasting
- **System Tools**: Health checks, global search, and recent activity monitoring

### 🚀 Modern Architecture
- **FastMCP Framework**: Rapid development with simplified syntax and built-in features
- **TypeScript**: Full type safety and excellent developer experience
- **Comprehensive Error Handling**: Robust error management with detailed logging
- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Built-in protection against API abuse

### 🔐 Security Features
- **Multiple Authentication Methods**: API Key and HMAC-SHA256 support
- **Input Sanitization**: Automatic sanitization of all user inputs
- **Secure Configuration**: Environment-based configuration management
- **Audit Logging**: Comprehensive logging of all operations

## Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- EspoCRM instance with API access
- API key or HMAC credentials

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/your-username/espocrm-mcp-server.git
cd espocrm-mcp-server
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your EspoCRM details
```

3. **Build and run:**
```bash
npm run build
npm start
```

### Environment Configuration

Create a `.env` file with your EspoCRM configuration:

```env
# EspoCRM Configuration
ESPOCRM_URL=https://your-espocrm-instance.com
ESPOCRM_API_KEY=your-api-key-here
ESPOCRM_AUTH_METHOD=apikey

# Optional: HMAC Authentication
# ESPOCRM_SECRET_KEY=your-secret-key-for-hmac

# Server Configuration
MCP_TRANSPORT=stdio
RATE_LIMIT=100
REQUEST_TIMEOUT=30000
LOG_LEVEL=info
```

## Available Tools

### Contact Management
- `create_contact` - Create new contacts with validation
- `search_contacts` - Flexible contact search with multiple criteria
- `get_contact` - Retrieve detailed contact information
- `update_contact` - Update existing contact data
- `delete_contact` - Remove contacts from the system
- `link_contact_to_account` - Associate contacts with accounts
- `get_contact_opportunities` - View opportunities for a contact

### Account Management
- `create_account` - Create new companies/organizations
- `search_accounts` - Search accounts by name, type, industry
- `get_account` - Get comprehensive account details
- `update_account` - Update account information
- `delete_account` - Remove accounts from the system
- `get_account_contacts` - List all contacts for an account
- `get_account_opportunities` - View account sales pipeline
- `get_account_summary` - Complete account overview

### Opportunity Management
- `create_opportunity` - Create new sales opportunities
- `search_opportunities` - Advanced opportunity search and filtering
- `get_opportunity` - Detailed opportunity information
- `update_opportunity` - Update opportunity details
- `update_opportunity_stage` - Move opportunities through sales stages
- `delete_opportunity` - Remove opportunities
- `get_pipeline_summary` - Sales pipeline overview and metrics

### System Tools
- `health_check` - Verify system connectivity and status
- `get_system_info` - EspoCRM version and user information
- `search_global` - Search across multiple entity types
- `get_recent_activity` - View recent system activity

## Authentication Methods

### API Key Authentication (Recommended)
1. Create an API user in EspoCRM: Administration > API Users
2. Select "API Key" as the authentication method
3. Use the generated API key in your configuration

### HMAC Authentication (Enhanced Security)
1. Create an API user with "HMAC" authentication
2. Configure both API key and secret key
3. Requests are cryptographically signed for enhanced security

## Usage Examples

### Basic Contact Creation
```javascript
// Through MCP client
await mcp.callTool('create_contact', {
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'john.doe@example.com',
  accountId: 'account-id-here'
});
```

### Advanced Opportunity Search
```javascript
await mcp.callTool('search_opportunities', {
  stage: 'Qualification',
  minAmount: 10000,
  closeDateAfter: '2024-01-01',
  limit: 20
});
```

### Pipeline Analysis
```javascript
await mcp.callTool('get_pipeline_summary', {
  assignedUserId: 'user-id',
  includeClosed: false
});
```

## Development

### Project Structure
```
src/
├── index.ts              # Main server entry point
├── config/              # Configuration management
├── espocrm/             # EspoCRM API client
├── tools/               # MCP tool implementations
├── utils/               # Shared utilities
└── types.ts             # Global type definitions
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
npm run test:watch
```

### Development Mode
```bash
npm run dev
```

## Docker Deployment

### Build Image
```bash
docker build -t espocrm-mcp-server .
```

### Run Container
```bash
docker run -d \
  --name espocrm-mcp \
  --env-file .env \
  -p 3000:3000 \
  espocrm-mcp-server
```

### Docker Compose
```yaml
version: '3.8'
services:
  espocrm-mcp:
    build: .
    env_file: .env
    ports:
      - "3000:3000"
    restart: unless-stopped
```

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ESPOCRM_URL` | Yes | - | EspoCRM instance URL |
| `ESPOCRM_API_KEY` | Yes | - | API key for authentication |
| `ESPOCRM_AUTH_METHOD` | No | `apikey` | Authentication method (`apikey` or `hmac`) |
| `ESPOCRM_SECRET_KEY` | No | - | Secret key for HMAC authentication |
| `MCP_TRANSPORT` | No | `stdio` | Transport type (`stdio` or `http`) |
| `RATE_LIMIT` | No | `100` | Requests per minute per user |
| `REQUEST_TIMEOUT` | No | `30000` | Request timeout in milliseconds |
| `LOG_LEVEL` | No | `info` | Logging level (`error`, `warn`, `info`, `debug`) |

## Troubleshooting

### Common Issues

**Connection Failed**
- Verify ESPOCRM_URL is correct and accessible
- Check API key permissions in EspoCRM
- Ensure API user is active and not disabled

**Authentication Errors**
- Verify API key is correct
- Check API user permissions for required entities
- For HMAC, ensure secret key matches EspoCRM configuration

**Rate Limiting**
- Adjust RATE_LIMIT environment variable
- Implement backoff strategies in client code
- Consider using multiple API users for higher throughput

### Health Check
Use the built-in health check to verify connectivity:
```bash
# Test the health_check tool through your MCP client
health_check
```

### Logging
Logs are output to console by default. In production, logs are also written to:
- `logs/error.log` - Error messages only
- `logs/combined.log` - All log messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Add comprehensive error handling
- Include input validation for all tools
- Write tests for new functionality
- Update documentation for API changes

## License

MIT License - see LICENSE file for details.

## Support

- 📖 [EspoCRM API Documentation](https://docs.espocrm.com/development/api/)
- 🔧 [MCP Protocol Specification](https://modelcontextprotocol.io/docs/)
- 🐛 [Report Issues](https://github.com/your-username/espocrm-mcp-server/issues)

## Changelog

### v1.0.0
- Initial release
- Complete CRUD operations for Contacts, Accounts, Opportunities
- Multiple authentication methods
- Comprehensive error handling and logging
- Docker support
- Full TypeScript implementation