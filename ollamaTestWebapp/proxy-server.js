const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const TARGET_URL = 'http://100.119.156.58:5678/webhook/30c46d87-72bb-4e8e-ba81-e57a385429e2/chat';

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Only handle POST requests to /chat
    if (req.method !== 'POST' || req.url !== '/chat') {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }
    
    // Collect request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        // Parse the target URL
        const targetUrl = new URL(TARGET_URL);
        
        // Prepare options for the outgoing request
        const options = {
            hostname: targetUrl.hostname,
            port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
            path: targetUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        
        // Make the request to the target server
        const protocol = targetUrl.protocol === 'https:' ? https : http;
        const proxyReq = protocol.request(options, (proxyRes) => {
            // Forward the response status and headers
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            
            // Pipe the response back to the client
            proxyRes.pipe(res);
        });
        
        // Handle errors
        proxyReq.on('error', (err) => {
            console.error('Proxy request error:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
        });
        
        // Send the request body
        proxyReq.write(body);
        proxyReq.end();
    });
});

server.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`Proxying requests to: ${TARGET_URL}`);
});