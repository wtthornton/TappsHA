#!/usr/bin/env node

/**
 * Agent OS Unified Dashboard Startup Script
 * Launches the WebSocket server and serves the dashboard HTML
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import DashboardWebSocketServer from './websocket/dashboard-websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class DashboardServer {
    constructor(port = 3000) {
        this.port = port;
        this.wsPort = port + 1;
        this.httpServer = null;
        this.wsServer = null;
        this.isRunning = false;
    }

    /**
     * Start the dashboard server
     */
    start() {
        try {
            console.log('🤖 Starting Agent OS Unified Dashboard...');
            
            // Start WebSocket server
            this.startWebSocketServer();
            
            // Start HTTP server
            this.startHttpServer();
            
            this.isRunning = true;
            
            console.log(`🌐 Dashboard available at: http://localhost:${this.port}`);
            console.log(`🔌 WebSocket server running on port: ${this.wsPort}`);
            console.log('📊 Real-time updates enabled');
            
        } catch (error) {
            console.error('Error starting dashboard server:', error);
            process.exit(1);
        }
    }

    /**
     * Start WebSocket server
     */
    startWebSocketServer() {
        try {
            this.wsServer = new DashboardWebSocketServer(this.wsPort);
            this.wsServer.start();
            
            console.log(`🔌 WebSocket server started on port ${this.wsPort}`);
        } catch (error) {
            console.error('Error starting WebSocket server:', error);
            throw error;
        }
    }

    /**
     * Start HTTP server
     */
    startHttpServer() {
        try {
            this.httpServer = createServer((req, res) => {
                this.handleRequest(req, res);
            });

            this.httpServer.listen(this.port, () => {
                console.log(`🌐 HTTP server started on port ${this.port}`);
            });

            this.httpServer.on('error', (error) => {
                console.error('HTTP server error:', error);
            });

        } catch (error) {
            console.error('Error starting HTTP server:', error);
            throw error;
        }
    }

    /**
     * Handle HTTP requests
     */
    handleRequest(req, res) {
        const url = req.url;
        
        try {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            
            // Handle different routes
            if (url === '/' || url === '/index.html') {
                this.serveDashboard(req, res);
            } else if (url.startsWith('/api/')) {
                this.handleApiRequest(req, res);
            } else if (url.startsWith('/static/')) {
                this.serveStaticFile(req, res);
            } else {
                this.serve404(req, res);
            }
            
        } catch (error) {
            console.error('Error handling request:', error);
            this.serveError(req, res, 500, 'Internal Server Error');
        }
    }

    /**
     * Serve the main dashboard HTML
     */
    serveDashboard(req, res) {
        try {
            const dashboardPath = join(__dirname, 'unified-dashboard.html');
            
            if (!existsSync(dashboardPath)) {
                this.serveError(req, res, 404, 'Dashboard file not found');
                return;
            }
            
            const content = readFileSync(dashboardPath, 'utf8');
            
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            });
            
            res.end(content);
            
        } catch (error) {
            console.error('Error serving dashboard:', error);
            this.serveError(req, res, 500, 'Error loading dashboard');
        }
    }

    /**
     * Handle API requests
     */
    handleApiRequest(req, res) {
        const url = req.url;
        
        try {
            if (url === '/api/compliance/current') {
                this.serveComplianceData(req, res);
            } else if (url === '/api/lessons/current') {
                this.serveLessonsData(req, res);
            } else if (url === '/api/metrics/current') {
                this.serveMetricsData(req, res);
            } else if (url === '/api/unified/current') {
                this.serveUnifiedData(req, res);
            } else if (url === '/api/status') {
                this.serveStatus(req, res);
            } else {
                this.serve404(req, res);
            }
        } catch (error) {
            console.error('Error handling API request:', error);
            this.serveError(req, res, 500, 'API Error');
        }
    }

    /**
     * Serve compliance data
     */
    serveComplianceData(req, res) {
        try {
            const data = this.wsServer.dashboardController.getComplianceData();
            
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            
            res.end(JSON.stringify(data));
            
        } catch (error) {
            console.error('Error serving compliance data:', error);
            this.serveError(req, res, 500, 'Error loading compliance data');
        }
    }

    /**
     * Serve lessons data
     */
    serveLessonsData(req, res) {
        try {
            const data = this.wsServer.dashboardController.getLessonsData();
            
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            
            res.end(JSON.stringify(data));
            
        } catch (error) {
            console.error('Error serving lessons data:', error);
            this.serveError(req, res, 500, 'Error loading lessons data');
        }
    }

    /**
     * Serve metrics data
     */
    serveMetricsData(req, res) {
        try {
            const data = this.wsServer.dashboardController.getMetricsData();
            
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            
            res.end(JSON.stringify(data));
            
        } catch (error) {
            console.error('Error serving metrics data:', error);
            this.serveError(req, res, 500, 'Error loading metrics data');
        }
    }

    /**
     * Serve unified data
     */
    serveUnifiedData(req, res) {
        try {
            const data = this.wsServer.dashboardController.getUnifiedData();
            
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            
            res.end(JSON.stringify(data));
            
        } catch (error) {
            console.error('Error serving unified data:', error);
            this.serveError(req, res, 500, 'Error loading unified data');
        }
    }

    /**
     * Serve server status
     */
    serveStatus(req, res) {
        try {
            const status = {
                http: {
                    port: this.port,
                    isRunning: this.isRunning
                },
                websocket: this.wsServer.getStatus(),
                timestamp: new Date().toISOString()
            };
            
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            });
            
            res.end(JSON.stringify(status));
            
        } catch (error) {
            console.error('Error serving status:', error);
            this.serveError(req, res, 500, 'Error loading status');
        }
    }

    /**
     * Serve static files
     */
    serveStaticFile(req, res) {
        try {
            const filePath = join(__dirname, req.url);
            
            if (!existsSync(filePath)) {
                this.serve404(req, res);
                return;
            }
            
            const content = readFileSync(filePath);
            const ext = extname(filePath);
            
            let contentType = 'text/plain';
            switch (ext) {
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
            }
            
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            });
            
            res.end(content);
            
        } catch (error) {
            console.error('Error serving static file:', error);
            this.serve404(req, res);
        }
    }

    /**
     * Serve 404 error
     */
    serve404(req, res) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not Found');
    }

    /**
     * Serve error response
     */
    serveError(req, res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
        res.end(`${statusCode} - ${message}`);
    }

    /**
     * Stop the server
     */
    stop() {
        try {
            this.isRunning = false;
            
            if (this.wsServer) {
                this.wsServer.stop();
            }
            
            if (this.httpServer) {
                this.httpServer.close();
            }
            
            console.log('🤖 Dashboard server stopped');
            
        } catch (error) {
            console.error('Error stopping server:', error);
        }
    }

    /**
     * Get server status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            httpPort: this.port,
            wsPort: this.wsPort,
            wsStatus: this.wsServer ? this.wsServer.getStatus() : null
        };
    }
}

// Main execution
const currentFile = fileURLToPath(import.meta.url);
const isMainModule = currentFile === process.argv[1];

if (isMainModule) {
    const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;
    const server = new DashboardServer(port);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down dashboard server...');
        server.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down dashboard server...');
        server.stop();
        process.exit(0);
    });
    
    // Start the server
    server.start();
}

export default DashboardServer;
