/**
 * Agent OS Unified Dashboard WebSocket Server
 * Provides real-time updates for compliance, lessons learned, and performance metrics
 */

import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import DashboardController from '../api/dashboard-controller.js';

class DashboardWebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.wss = null;
        this.httpServer = null;
        this.dashboardController = new DashboardController();
        this.clients = new Set();
        this.updateInterval = null;
        this.isRunning = false;
    }

    /**
     * Start the WebSocket server
     */
    start() {
        try {
            // Create HTTP server
            this.httpServer = createServer((req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Agent OS Dashboard WebSocket Server');
            });

            // Create WebSocket server
            this.wss = new WebSocketServer({ server: this.httpServer });

            // Set up WebSocket event handlers
            this.setupWebSocketHandlers();

            // Start the server
            this.httpServer.listen(this.port, () => {
                console.log(`🤖 Agent OS Dashboard WebSocket Server running on port ${this.port}`);
                this.isRunning = true;
                
                // Start periodic updates
                this.startPeriodicUpdates();
            });

        } catch (error) {
            console.error('Error starting WebSocket server:', error);
            throw error;
        }
    }

    /**
     * Stop the WebSocket server
     */
    stop() {
        try {
            this.isRunning = false;
            
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            
            if (this.wss) {
                this.wss.close();
                this.wss = null;
            }
            
            if (this.httpServer) {
                this.httpServer.close();
                this.httpServer = null;
            }
            
            console.log('🤖 Agent OS Dashboard WebSocket Server stopped');
        } catch (error) {
            console.error('Error stopping WebSocket server:', error);
        }
    }

    /**
     * Set up WebSocket event handlers
     */
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws, req) => {
            console.log(`🔌 New WebSocket connection from ${req.socket.remoteAddress}`);
            
            // Add client to set
            this.clients.add(ws);
            
            // Send initial data
            this.sendInitialData(ws);
            
            // Set up client event handlers
            this.setupClientHandlers(ws);
            
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                message: 'Connected to Agent OS Dashboard WebSocket Server',
                timestamp: new Date().toISOString()
            }));
        });

        this.wss.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });

        this.wss.on('close', () => {
            console.log('WebSocket server closed');
        });
    }

    /**
     * Set up handlers for individual client connections
     */
    setupClientHandlers(ws) {
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                this.handleClientMessage(ws, data);
            } catch (error) {
                console.error('Error parsing client message:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format',
                    timestamp: new Date().toISOString()
                }));
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            this.clients.delete(ws);
        });

        ws.on('error', (error) => {
            console.error('Client WebSocket error:', error);
            this.clients.delete(ws);
        });
    }

    /**
     * Handle client messages
     */
    handleClientMessage(ws, data) {
        switch (data.type) {
            case 'subscribe':
                this.handleSubscribe(ws, data);
                break;
            case 'unsubscribe':
                this.handleUnsubscribe(ws, data);
                break;
            case 'request_data':
                this.handleRequestData(ws, data);
                break;
            case 'ping':
                ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: new Date().toISOString()
                }));
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Unknown message type',
                    timestamp: new Date().toISOString()
                }));
        }
    }

    /**
     * Handle subscription requests
     */
    handleSubscribe(ws, data) {
        const { channels = [] } = data;
        
        // Store subscription preferences
        ws.subscriptions = channels;
        
        ws.send(JSON.stringify({
            type: 'subscription_confirmed',
            channels: channels,
            timestamp: new Date().toISOString()
        }));
        
        console.log(`📡 Client subscribed to channels: ${channels.join(', ')}`);
    }

    /**
     * Handle unsubscription requests
     */
    handleUnsubscribe(ws, data) {
        const { channels = [] } = data;
        
        if (ws.subscriptions) {
            ws.subscriptions = ws.subscriptions.filter(channel => !channels.includes(channel));
        }
        
        ws.send(JSON.stringify({
            type: 'unsubscription_confirmed',
            channels: channels,
            timestamp: new Date().toISOString()
        }));
        
        console.log(`📡 Client unsubscribed from channels: ${channels.join(', ')}`);
    }

    /**
     * Handle data requests
     */
    handleRequestData(ws, data) {
        const { dataType } = data;
        
        let responseData = null;
        
        switch (dataType) {
            case 'compliance':
                responseData = this.dashboardController.getComplianceData();
                break;
            case 'lessons':
                responseData = this.dashboardController.getLessonsData();
                break;
            case 'metrics':
                responseData = this.dashboardController.getMetricsData();
                break;
            case 'unified':
                responseData = this.dashboardController.getUnifiedData();
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Unknown data type requested',
                    timestamp: new Date().toISOString()
                }));
                return;
        }
        
        ws.send(JSON.stringify({
            type: 'data_response',
            dataType: dataType,
            data: responseData,
            timestamp: new Date().toISOString()
        }));
    }

    /**
     * Send initial data to new client
     */
    sendInitialData(ws) {
        // Send unified data by default
        const unifiedData = this.dashboardController.getUnifiedData();
        
        ws.send(JSON.stringify({
            type: 'initial_data',
            data: unifiedData,
            timestamp: new Date().toISOString()
        }));
    }

    /**
     * Start periodic updates
     */
    startPeriodicUpdates() {
        this.updateInterval = setInterval(() => {
            if (this.isRunning && this.clients.size > 0) {
                this.broadcastUpdates();
            }
        }, 30000); // Update every 30 seconds
    }

    /**
     * Broadcast updates to all connected clients
     */
    broadcastUpdates() {
        try {
            const complianceData = this.dashboardController.getComplianceData();
            const lessonsData = this.dashboardController.getLessonsData();
            const metricsData = this.dashboardController.getMetricsData();
            
            const updateMessage = {
                type: 'update',
                timestamp: new Date().toISOString(),
                data: {
                    compliance: complianceData,
                    lessons: lessonsData,
                    metrics: metricsData
                }
            };
            
            this.clients.forEach(client => {
                if (client.readyState === 1) { // WebSocket.OPEN
                    // Check if client has subscriptions
                    if (client.subscriptions && client.subscriptions.length > 0) {
                        // Send only subscribed data
                        const filteredData = {};
                        client.subscriptions.forEach(channel => {
                            switch (channel) {
                                case 'compliance':
                                    filteredData.compliance = complianceData;
                                    break;
                                case 'lessons':
                                    filteredData.lessons = lessonsData;
                                    break;
                                case 'metrics':
                                    filteredData.metrics = metricsData;
                                    break;
                            }
                        });
                        
                        if (Object.keys(filteredData).length > 0) {
                            client.send(JSON.stringify({
                                ...updateMessage,
                                data: filteredData
                            }));
                        }
                    } else {
                        // Send all data if no specific subscriptions
                        client.send(JSON.stringify(updateMessage));
                    }
                }
            });
            
            console.log(`📡 Broadcasted updates to ${this.clients.size} clients`);
            
        } catch (error) {
            console.error('Error broadcasting updates:', error);
        }
    }

    /**
     * Send specific data type to all clients
     */
    broadcastDataType(dataType, data) {
        const message = {
            type: 'data_update',
            dataType: dataType,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        this.clients.forEach(client => {
            if (client.readyState === 1) {
                // Check if client is subscribed to this data type
                if (!client.subscriptions || client.subscriptions.includes(dataType)) {
                    client.send(JSON.stringify(message));
                }
            }
        });
    }

    /**
     * Get server status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.port,
            connectedClients: this.clients.size,
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Force update all data
     */
    forceUpdate() {
        this.dashboardController.updateAllData();
        this.broadcastUpdates();
    }

    /**
     * Get connected clients info
     */
    getConnectedClients() {
        const clients = [];
        this.clients.forEach(client => {
            clients.push({
                readyState: client.readyState,
                subscriptions: client.subscriptions || [],
                url: client.url
            });
        });
        return clients;
    }
}

// Export the WebSocket server
export default DashboardWebSocketServer;

// Example usage:
// const server = new DashboardWebSocketServer(8080);
// server.start();
