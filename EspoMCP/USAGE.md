# EspoCRM MCP Server Usage Guide

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your EspoCRM configuration
```

3. **Build the server:**
```bash
npm run build
```

## Configuration

Your `.env` file should contain:

```env
# EspoCRM Configuration
ESPOCRM_URL=https://your-espocrm-instance.com
ESPOCRM_API_KEY=your-api-key-here
ESPOCRM_AUTH_METHOD=apikey

# Optional settings
MCP_TRANSPORT=stdio
RATE_LIMIT=100
REQUEST_TIMEOUT=30000
LOG_LEVEL=info
```

## Running the Server

### Stdio Transport (Default)
```bash
npm start
```

### Development Mode
```bash
npm run dev
```

## Available Tools

### Contact Management
- `create_contact` - Create new contacts
- `search_contacts` - Search for contacts
- `get_contact` - Get contact details by ID
- `update_contact` - Update existing contacts
- `delete_contact` - Remove contacts

### Account Management  
- `create_account` - Create new companies/organizations
- `search_accounts` - Search for accounts
- `get_account` - Get account details
- `update_account` - Update account information
- `delete_account` - Remove accounts

### Opportunity Management
- `create_opportunity` - Create sales opportunities
- `search_opportunities` - Search opportunities with filters
- `get_opportunity` - Get opportunity details
- `update_opportunity` - Update opportunity information
- `delete_opportunity` - Remove opportunities

### System Tools
- `health_check` - Verify system connectivity

## Example Usage

### Creating a Contact
```json
{
  "tool": "create_contact",
  "arguments": {
    "firstName": "John",
    "lastName": "Doe", 
    "emailAddress": "john.doe@example.com",
    "phoneNumber": "+1-555-123-4567",
    "title": "Sales Manager"
  }
}
```

### Searching Contacts
```json
{
  "tool": "search_contacts",
  "arguments": {
    "searchTerm": "john",
    "limit": 10
  }
}
```

### Creating an Account
```json
{
  "tool": "create_account", 
  "arguments": {
    "name": "Acme Corporation",
    "type": "Customer",
    "industry": "Technology",
    "website": "https://acme.com"
  }
}
```

### Creating an Opportunity
```json
{
  "tool": "create_opportunity",
  "arguments": {
    "name": "Q1 2025 Enterprise Deal",
    "accountId": "account-id-here",
    "stage": "Qualification",
    "amount": 50000,
    "closeDate": "2025-03-31",
    "probability": 75
  }
}
```

## Testing Connection

Use the health check tool to verify your setup:

```json
{
  "tool": "health_check",
  "arguments": {}
}
```

This will return status information about your EspoCRM connection.

## Troubleshooting

### Connection Issues
- Verify `ESPOCRM_URL` is accessible
- Check API key permissions in EspoCRM
- Ensure API user is active

### Authentication Errors  
- Confirm API key is correct
- Verify API user has required entity permissions
- Check if API access is enabled in EspoCRM

### Rate Limiting
- Adjust `RATE_LIMIT` environment variable
- Consider using multiple API users for higher throughput

### Logging
Set `LOG_LEVEL=debug` for detailed logging information.

## Integration with Claude/ChatGPT

This MCP server can be integrated with AI assistants like Claude or ChatGPT to provide natural language access to your EspoCRM data. The AI can help you:

- Create and update CRM records
- Search for contacts and companies
- Track sales opportunities
- Generate reports and insights
- Automate routine CRM tasks

## Security Best Practices

- Use dedicated API users with minimal required permissions
- Regularly rotate API keys
- Monitor API usage and access logs
- Use HTTPS for all EspoCRM communications
- Keep the MCP server updated