# EspoCRM Chat Widget Integration Guide

## 🚀 Quick Setup Instructions

### Method 1: Simple HTML Integration (Recommended)

Add this code to your EspoCRM footer template:

1. **Edit your EspoCRM template** (usually in `application/Espo/Resources/templates/` or custom templates)

2. **Add to the footer or layout file**:

```html
<!-- EspoCRM AI Chat Assistant -->
<script>
  // Configure the chat server URL (update with your server)
  window.ESPOCRM_CHAT_SERVER = 'http://your-server-ip:3001';
  
  // Pass EspoCRM user context
  window.ESPOCRM_USER_CONTEXT = {
    userId: '{$user.id}',
    userName: '{$user.userName}',
    userEmail: '{$user.emailAddress}',
    userRole: '{$user.type}'
  };
</script>
<script src="http://your-server-ip:3001/socket.io/socket.io.js"></script>
<script src="http://your-server-ip:3001/api/widget.js"></script>
```

### Method 2: EspoCRM Extension (Advanced)

1. **Copy the extension file**:
   ```bash
   cp espocrm-integration/chat-widget-extension.js /path/to/espocrm/custom/Espo/Custom/Resources/scripts/
   ```

2. **Register the script in EspoCRM**:
   Edit `custom/Espo/Custom/Resources/metadata/app/client.json`:
   ```json
   {
     "scriptList": [
       "__APPEND__",
       "custom:chat-widget-extension"
     ]
   }
   ```

3. **Clear cache and rebuild**:
   ```bash
   php clear_cache.php
   php rebuild.php
   ```

## 🐳 Docker Deployment

### Option 1: Standalone Deployment

1. **Navigate to the chatbot directory**:
   ```bash
   cd EspoMCP/chatbot-bridge
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the chatbot server**:
   ```bash
   docker-compose up -d
   ```

### Option 2: Integrated with EspoCRM Container

Add this service to your existing EspoCRM docker-compose.yml:

```yaml
version: '3.8'

services:
  # Your existing EspoCRM service
  espocrm:
    # ... your EspoCRM configuration

  # Add the chatbot service
  espocrm-chatbot:
    build: ./chatbot-bridge
    container_name: espocrm-chatbot
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - CHATBOT_PORT=3001
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ESPOCRM_URL=http://espocrm
      - ESPOCRM_API_KEY=${ESPOCRM_API_KEY}
    volumes:
      - ./chatbot-bridge/logs:/app/logs
    networks:
      - espocrm-network
    depends_on:
      - espocrm

networks:
  espocrm-network:
    external: true
```

## ⚙️ Configuration

### Environment Variables

```bash
# Required
CHATBOT_PORT=3001
ESPOCRM_URL=http://your-espocrm-instance
ESPOCRM_API_KEY=your-api-key

# Optional (enables advanced AI features)
OPENAI_API_KEY=your-openai-key

# Security
CORS_ORIGINS=http://your-espocrm-domain
```

### EspoCRM API Setup

1. **Create API User**:
   - Go to Administration → Users
   - Create new user with type "API"
   - Generate API key
   - Assign appropriate permissions

2. **Required Permissions**:
   - Contacts: Create, Read, Edit, Delete
   - Accounts: Create, Read, Edit, Delete  
   - Opportunities: Create, Read, Edit, Delete
   - Leads: Create, Read, Edit, Delete
   - Tasks: Create, Read, Edit, Delete
   - Meetings: Create, Read, Edit, Delete
   - Calls: Create, Read, Edit, Delete
   - Cases: Create, Read, Edit, Delete

## 🔧 Customization

### Widget Appearance

Modify the widget styles in `public/widget.js`:

```javascript
const CONFIG = {
  theme: {
    primaryColor: '#your-brand-color',
    backgroundColor: '#ffffff',
    textColor: '#333333'
  }
};
```

### AI Behavior

Customize the AI prompts in `src/mcp-chatbot.js`:

```javascript
buildSystemPrompt() {
  return `You are an AI assistant for [Your Company Name]...`;
}
```

### Supported Commands

The chatbot understands natural language for:

- **Creating records**: "Create a contact named John Smith"
- **Searching data**: "Find all accounts in technology"
- **Managing tasks**: "Assign task to user@example.com"
- **Scheduling**: "Create meeting for tomorrow"
- **Reporting**: "Show me open opportunities"

## 🔒 Security Considerations

1. **CORS Configuration**: Restrict origins to your EspoCRM domain
2. **Rate Limiting**: Configure appropriate limits
3. **API Permissions**: Use dedicated API user with minimal permissions
4. **HTTPS**: Use SSL certificates in production
5. **Network Security**: Run on private network if possible

## 🚨 Troubleshooting

### Chat Widget Not Loading

1. Check browser console for errors
2. Verify server URL in configuration
3. Ensure chatbot server is running
4. Check network connectivity

### MCP Tools Not Working

1. Verify EspoCRM API key and permissions
2. Check server logs: `docker logs espocrm-chatbot`
3. Test MCP server directly
4. Verify EspoCRM URL accessibility

### Connection Issues

1. Check firewall settings
2. Verify port 3001 is accessible
3. Test health endpoint: `http://your-server:3001/health`

## 📊 Monitoring

### Health Checks

```bash
# Check chatbot server health
curl http://your-server:3001/health

# Check container status
docker ps | grep chatbot

# View logs
docker logs -f espocrm-chatbot
```

### Performance

- Monitor WebSocket connections
- Check response times
- Monitor MCP tool execution times
- Track error rates

## 🆕 Updates

To update the chatbot:

```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose build

# Restart services
docker-compose restart
```

## 📞 Support

- Check logs for detailed error information
- Verify all environment variables are set correctly
- Ensure EspoCRM instance is accessible from chatbot server
- Test individual MCP tools using the test scripts provided