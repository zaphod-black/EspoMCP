# EspoCRM MCP Server

A comprehensive Model Context Protocol (MCP) server for seamless integration with EspoCRM. This server enables AI assistants to interact with your EspoCRM instance through a standardized interface, providing full CRUD operations for Contacts, Accounts, Opportunities, and system management.

## Features

### Core Capabilities
- **Complete CRUD Operations** - Create, read, update, and delete entities
- **Multi-Entity Support** - Contacts, Accounts, Opportunities, and more
- **Advanced Search** - Flexible search with filtering and pagination
- **Real-time Validation** - Zod-based schema validation for all operations
- **Comprehensive Logging** - Winston-powered logging with multiple levels

### Authentication & Security
- **Multiple Auth Methods** - API Key and HMAC authentication support
- **Secure Configuration** - Environment-based configuration management
- **Rate Limiting** - Built-in rate limiting for API protection
- **Error Handling** - Robust error handling with detailed logging

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
SERVER_RATE_LIMIT=100
LOG_LEVEL=info
```

### Required Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ESPOCRM_URL` | Your EspoCRM instance URL | Yes | - |
| `ESPOCRM_API_KEY` | API key for authentication | Yes | - |
| `ESPOCRM_AUTH_METHOD` | Authentication method (`apikey` or `hmac`) | Yes | `apikey` |
| `ESPOCRM_SECRET_KEY` | Secret key for HMAC auth | No | - |
| `SERVER_RATE_LIMIT` | Requests per minute limit | No | `100` |
| `LOG_LEVEL` | Logging level | No | `info` |

## Available Tools

The MCP server provides 11 comprehensive tools for EspoCRM integration:

### Contact Management
- **`create_contact`** - Create new contacts with full field support
- **`search_contacts`** - Search and filter contacts with pagination
- **`get_contact`** - Retrieve specific contact by ID
- **`update_contact`** - Update existing contact information
- **`delete_contact`** - Remove contacts from the system

### Account Management  
- **`create_account`** - Create new company/organization accounts
- **`search_accounts`** - Search and filter accounts
- **`get_account`** - Retrieve specific account details
- **`update_account`** - Update account information
- **`delete_account`** - Remove accounts

### Opportunity Management
- **`create_opportunity`** - Create new sales opportunities
- **`search_opportunities`** - Search opportunities with advanced filters
- **`get_opportunity`** - Retrieve opportunity details
- **`update_opportunity`** - Update opportunity information
- **`delete_opportunity`** - Remove opportunities

### System Tools
- **`health_check`** - Verify server and EspoCRM connectivity
- **`get_metadata`** - Retrieve entity metadata and field definitions

## Usage Examples

### Basic Contact Creation

```javascript
// Using the MCP client
await client.callTool('create_contact', {
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'john.doe@example.com',
  phoneNumber: '+1-555-123-4567',
  title: 'Sales Manager'
});
```

### Advanced Contact Search

```javascript
// Search with filters
await client.callTool('search_contacts', {
  searchTerm: 'manager',
  filters: {
    accountType: 'Customer',
    industry: 'Technology'
  },
  limit: 10,
  offset: 0
});
```

### Account Management

```javascript
// Create a new account
await client.callTool('create_account', {
  name: 'Tech Corp Inc',
  type: 'Customer',
  industry: 'Technology',
  website: 'https://techcorp.com',
  description: 'Leading technology solutions provider'
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

#### Random Contact Generation
```bash
node create-random-contact.js
```
Creates a random test contact to verify CRUD operations.

#### Full MCP Server Test
```bash
node test-client.js
```
Comprehensive test suite covering all MCP tools and functionality.

## Development

### Project Structure

```
EspoMCP/
├── src/                     # Source code
│   ├── config/             # Configuration management
│   ├── espocrm/           # EspoCRM API client
│   ├── tools/             # MCP tool implementations
│   ├── utils/             # Utility functions
│   └── index.ts           # Main server entry point
├── test/                   # Test files
├── build/                  # Compiled JavaScript
├── logs/                   # Application logs
├── docker/                 # Docker configuration
└── docs/                   # Documentation
```

### Key Components

#### MCP Server (`src/index.ts`)
Main server implementation with environment loading and graceful shutdown handling.

#### EspoCRM Client (`src/espocrm/client.ts`)
HTTP client with authentication, error handling, and logging.

#### Tool Registry (`src/tools/index.ts`)
Central registry for all MCP tools with proper type safety.

#### Configuration (`src/config/index.ts`)
Environment-based configuration with validation.

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Build the project** with `npm run build`
3. **Test changes** with `npm run test:config`
4. **Run full tests** with `npm run test:client`
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
    volumes:
      - ./logs:/app/logs
```

## Troubleshooting

### Common Issues

#### Connection Failures
```bash
# Test basic connectivity
node test-connection.js

# Check environment variables
npm run test:config
```

#### Authentication Issues
- Verify API key is correct and active
- Check user permissions in EspoCRM
- Ensure API access is enabled for the user

#### Build Errors
```bash
# Clean and rebuild
rm -rf build/
npm run build
```

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
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
  description?: string
}
```

#### Account Schema
```typescript
{
  name: string,
  type?: string,
  industry?: string,
  website?: string,
  description?: string
}
```

#### Search Parameters
```typescript
{
  searchTerm?: string,
  filters?: Record<string, any>,
  limit?: number,
  offset?: number
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

## Security

- **Never commit** API keys or secrets to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys
- Monitor access logs for suspicious activity

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/zaphod-black/EspoMCP/issues)
- **Documentation**: Check the `docs/` directory
- **EspoCRM API**: [Official EspoCRM API Documentation](https://docs.espocrm.com/development/api/)

## Changelog

### Version 1.0.0
- Initial release with full MCP 2024/2025 support
- Complete CRUD operations for Contacts, Accounts, Opportunities
- Docker support and comprehensive testing
- Multiple authentication methods
- Production-ready logging and error handling

---

**Built for the EspoCRM and MCP communities**
