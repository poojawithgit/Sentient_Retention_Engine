const app = require('./src/app');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server, path: '/api/v1/ws' });

// Attach WSS to app for broadcasting
app.set('wss', wss);

// Connection tracking
let activeConnections = 0;
const MAX_CONNECTIONS = 1000; // Limit concurrent connections

wss.on('connection', (ws, req) => {
    // Check connection limit
    if (activeConnections >= MAX_CONNECTIONS) {
        ws.close(1013, 'Server is at capacity'); // Try again later
        return;
    }

    activeConnections++;
    console.log(`New client connected to Dashboard WebSocket. Active connections: ${activeConnections}`);

    ws.send(JSON.stringify({ type: 'CONNECTION_ESTABLISHED', message: 'Sentient Real-time Stream Active' }));

    // Heartbeat mechanism
    const heartbeat = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        }
    }, 30000); // Ping every 30 seconds

    ws.on('pong', () => {
        // Client is alive
    });

    ws.on('close', () => {
        activeConnections--;
        clearInterval(heartbeat);
        console.log(`Client disconnected from WebSocket. Active connections: ${activeConnections}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        activeConnections--;
        clearInterval(heartbeat);
    });

    // Handle incoming messages (for future use)
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // Process client messages if needed
        } catch (err) {
            console.error('Invalid WebSocket message:', err);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Sentient Backend Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
});

process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
});

