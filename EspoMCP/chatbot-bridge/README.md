# 🤖 EspoCRM AI Chatbot Integration

A comprehensive AI-powered chatbot that integrates directly into your EspoCRM interface, leveraging all 47 MCP tools for intelligent CRM operations.

## ✨ Features

- **🎯 Smart CRM Operations**: Natural language interface for all EspoCRM functions
- **🔧 47 MCP Tools**: Complete integration with your EspoCRM MCP server
- **💬 Floating Chat Widget**: Non-intrusive bubble interface
- **🤖 AI-Powered**: Optional OpenAI integration for advanced natural language processing
- **🔒 Secure**: Rate limiting, CORS protection, input sanitization
- **🐳 Docker Ready**: Easy deployment alongside your EspoCRM container
- **📱 Responsive**: Works on desktop and mobile devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   EspoCRM UI    │────│  Chat Widget     │────│  Bridge Server  │────│   MCP Server     │
│                 │    │  (Frontend)      │    │  (Express.js)   │    │  (Your 47 tools)│
│ • Web Interface │    │ • Chat Bubble    │    │ • LLM Integration│    │ • EspoCRM API    │
│ • Custom Widget │    │ • Message UI     │    │ • Tool Routing   │    │ • All Phases     │
│ • JavaScript    │    │ • WebSocket      │    │ • WebSocket      │    │ • TypeScript     │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (optional but recommended)
- EspoCRM instance with API access
- Your 47-tool MCP server running

### 1. Install Dependencies

```bash
cd chatbot-bridge
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

Required configuration:
```env
CHATBOT_PORT=3001
ESPOCRM_URL=http://your-espocrm-instance
ESPOCRM_API_KEY=your-api-key
OPENAI_API_KEY=your-openai-key  # Optional
```

### 3. Start the Server

#### Option A: Development
```bash
npm run dev
```

#### Option B: Production
```bash
npm start
```

#### Option C: Docker
```bash
docker-compose up -d
```

### 4. Integrate with EspoCRM

Add this code to your EspoCRM footer template:

```html
<script>
  window.ESPOCRM_CHAT_SERVER = 'http://your-server:3001';
</script>
<script src="http://your-server:3001/socket.io/socket.io.js"></script>
<script src="http://your-server:3001/api/widget.js"></script>
```

## 💬 Usage Examples

The chatbot understands natural language commands for all CRM operations:

### Creating Records
- "Create a contact named John Smith with email john@example.com"
- "Add a new account called TechCorp in the software industry"
- "Create an opportunity for $50,000 closing next month"

### Searching & Finding
- "Find all contacts with email addresses containing 'gmail'"
- "Show me accounts in the technology sector"
- "Search for opportunities over $10,000"

### Task Management
- "Create a task to follow up with John Smith"
- "Assign the marketing task to user@example.com"
- "Show my open tasks"

### Scheduling
- "Schedule a meeting with the sales team tomorrow"
- "Create a call record for the client discussion"
- "Add a case for the technical support issue"

### Advanced Operations
- "Link this contact to the TechCorp account"
- "Get all opportunities for account ID 12345"
- "Show system health status"

## 🔧 Configuration

### Widget Customization

Modify `public/widget.js` to customize appearance:

```javascript
const CONFIG = {
  theme: {
    primaryColor: '#007bff',    // Your brand color
    backgroundColor: '#ffffff',  // Widget background
    textColor: '#333333'        // Text color
  },
  position: 'bottom-right',     // Widget position
  zIndex: 9999                  // Layer priority
};
```

### AI Behavior

Customize the AI assistant in `src/mcp-chatbot.js`:

```javascript
buildSystemPrompt() {
  return `You are an AI assistant for [Your Company Name]...`;
}
```

### Security Settings

Configure CORS, rate limiting, and authentication in `src/middleware/security.js`.

## 🐳 Docker Deployment

### Standalone Deployment

```bash
# Build and run
docker-compose up -d

# View logs
docker logs -f espocrm-chatbot-bridge

# Check health
curl http://localhost:3001/health
```

### Integrated with EspoCRM

Add to your existing EspoCRM docker-compose.yml:

```yaml
services:
  espocrm-chatbot:
    build: ./chatbot-bridge
    ports:
      - "3001:3001"
    environment:
      - ESPOCRM_URL=http://espocrm
      - ESPOCRM_API_KEY=${ESPOCRM_API_KEY}
    networks:
      - espocrm-network
    depends_on:
      - espocrm
```

## 🧪 Testing

### Run Test Suite

```bash
# Install test dependencies
npm install axios socket.io-client

# Run comprehensive tests
node test-chatbot.js
```

### Manual Testing

1. **Health Check**: `curl http://localhost:3001/health`
2. **Widget Demo**: Visit `http://localhost:3001/widget`
3. **WebSocket**: Test chat functionality
4. **MCP Integration**: Try "What's the system status?"

## 🔒 Security

### Built-in Security Features

- **Rate Limiting**: 30 chat messages per minute per IP
- **Input Sanitization**: XSS protection and message validation
- **CORS Protection**: Configurable origin restrictions
- **WebSocket Security**: Connection authentication and validation
- **Content Security Policy**: Prevents script injection

### Production Security Checklist

- [ ] Configure CORS origins to your EspoCRM domain only
- [ ] Use HTTPS in production
- [ ] Set strong API keys
- [ ] Enable rate limiting
- [ ] Monitor logs for suspicious activity
- [ ] Use dedicated API user with minimal permissions

## 📊 Monitoring

### Health Monitoring

```bash
# Server health
curl http://your-server:3001/health

# Container status
docker ps | grep chatbot

# Real-time logs
docker logs -f espocrm-chatbot-bridge
```

### Performance Metrics

- WebSocket connection count
- Message processing time
- MCP tool execution time
- Error rates and types

## 🚨 Troubleshooting

### Common Issues

#### Chat Widget Not Loading
1. Check browser console for errors
2. Verify server URL in configuration
3. Ensure chatbot server is running: `curl http://server:3001/health`
4. Check network connectivity and CORS settings

#### MCP Tools Not Working
1. Verify EspoCRM API key and permissions
2. Check MCP server is accessible
3. Test individual MCP tools with test scripts
4. Review server logs: `docker logs espocrm-chatbot-bridge`

#### WebSocket Connection Issues
1. Check firewall settings for port 3001
2. Verify WebSocket support in proxy/load balancer
3. Test direct connection: `wscat -c ws://server:3001`

### Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

View debug logs:
```bash
tail -f logs/chatbot-bridge.log
```

## 🔄 Updates

To update the chatbot:

```bash
# Pull latest changes
git pull

# Update dependencies
npm install

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## 📈 Roadmap

### Planned Features

- **Voice Input**: Speech-to-text integration
- **File Uploads**: Attach documents to cases/notes
- **Workflow Automation**: Multi-step CRM processes
- **Analytics Dashboard**: Chat and tool usage metrics
- **Multi-language**: Internationalization support
- **Mobile App**: Dedicated mobile interface

### Integration Opportunities

- **Slack/Teams**: Extend chat to messaging platforms
- **Email**: Process incoming emails as chat messages
- **Calendars**: Advanced meeting scheduling
- **Third-party APIs**: Expand tool capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines

- Follow existing code style
- Add comprehensive error handling
- Include unit tests
- Update documentation
- Test with real EspoCRM data

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: See `espocrm-integration/install-instructions.md`
- **EspoCRM API**: [Official API Docs](https://docs.espocrm.com/development/api/)
- **MCP Specification**: [MCP Documentation](https://spec.modelcontextprotocol.io/)

---

**🎉 Your EspoCRM now has a powerful AI assistant with access to all 47 MCP tools!**