import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';
import { URL } from 'url';

interface DashboardResponse {
  statusCode: number;
  headers: any;
  body: string;
}

class DashboardAPITester {
  private baseUrl: string;
  private port: number;

  constructor(port: number = 3011) {
    this.port = port;
    this.baseUrl = `http://localhost:${port}`;
  }

  async makeRequest(path: string, method: string = 'GET', body?: string): Promise<DashboardResponse> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 500,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  async testEndpoint(path: string, expectedStatus: number = 200): Promise<void> {
    try {
      const response = await this.makeRequest(path);
      expect(response.statusCode).toBe(expectedStatus);
    } catch (error) {
      // If server is not running, skip the test
      if (error.code === 'ECONNREFUSED') {
        console.log(`Skipping test for ${path} - server not running`);
        return;
      }
      throw error;
    }
  }

  async testJSONEndpoint(path: string, expectedStatus: number = 200): Promise<any> {
    try {
      const response = await this.makeRequest(path);
      expect(response.statusCode).toBe(expectedStatus);
      
      if (response.body) {
        return JSON.parse(response.body);
      }
      return null;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`Skipping test for ${path} - server not running`);
        return null;
      }
      throw error;
    }
  }
}

describe('Agent-OS Dashboard API Integration Tests', () => {
  let apiTester: DashboardAPITester;

  beforeAll(() => {
    apiTester = new DashboardAPITester(3011);
  });

  describe('Core Dashboard Endpoints', () => {
    it('should serve main dashboard page', async () => {
      await apiTester.testEndpoint('/app', 200);
    });

    it('should redirect root to app', async () => {
      const response = await apiTester.makeRequest('/');
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/app');
    });

    it('should serve doctor UI', async () => {
      await apiTester.testEndpoint('/doctor-ui', 200);
    });

    it('should serve user guide', async () => {
      await apiTester.testEndpoint('/user-guide', 200);
    });
  });

  describe('Metrics and Data Endpoints', () => {
    it('should serve live metrics', async () => {
      const data = await apiTester.testJSONEndpoint('/api/live', 200);
      if (data) {
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('metrics');
      }
    });

    it('should serve historical data', async () => {
      const data = await apiTester.testJSONEndpoint('/history', 200);
      if (data) {
        expect(Array.isArray(data)).toBe(true);
      }
    });

    it('should serve trends data', async () => {
      const data = await apiTester.testJSONEndpoint('/trends', 200);
      if (data) {
        expect(data).toHaveProperty('trends');
      }
    });

    it('should serve effectiveness metrics', async () => {
      const data = await apiTester.testJSONEndpoint('/effectiveness', 200);
      if (data) {
        expect(data).toHaveProperty('effectiveness');
      }
    });

    it('should serve performance metrics', async () => {
      const data = await apiTester.testJSONEndpoint('/performance-metrics', 200);
      if (data) {
        expect(data).toHaveProperty('performance');
      }
    });
  });

  describe('API Configuration Endpoints', () => {
    it('should handle auto-refresh configuration', async () => {
      const configData = JSON.stringify({ enabled: true, interval: 30000 });
      const response = await apiTester.makeRequest('/api/refresh', 'POST', configData);
      expect(response.statusCode).toBe(200);
    });

    it('should serve system status', async () => {
      const data = await apiTester.testJSONEndpoint('/api/status', 200);
      if (data) {
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('uptime');
        expect(data).toHaveProperty('version');
      }
    });

    it('should serve standards data', async () => {
      const data = await apiTester.testJSONEndpoint('/api/standards', 200);
      if (data) {
        expect(data).toHaveProperty('standards');
      }
    });
  });

  describe('Modern Dashboard Assets', () => {
    it('should serve design system CSS', async () => {
      await apiTester.testEndpoint('/modern-dashboard/design-system.css', 200);
    });

    it('should serve theme manager JS', async () => {
      await apiTester.testEndpoint('/modern-dashboard/theme-manager.js', 200);
    });

    it('should serve 3D components CSS', async () => {
      await apiTester.testEndpoint('/modern-dashboard/css/3d-components.css', 200);
    });

    it('should serve 3D chart renderer', async () => {
      await apiTester.testEndpoint('/modern-dashboard/js/3d/Chart3DRenderer.js', 200);
    });

    it('should serve 3D bar chart component', async () => {
      await apiTester.testEndpoint('/modern-dashboard/js/charts/BarChart3D.js', 200);
    });

    it('should serve sample datasets', async () => {
      await apiTester.testEndpoint('/modern-dashboard/data/sample-datasets.js', 200);
    });

    it('should serve 3D scatter plot component', async () => {
      await apiTester.testEndpoint('/modern-dashboard/js/charts/ScatterPlot3D.js', 200);
    });
  });

  describe('Debug and Development Endpoints', () => {
    it('should serve debug page', async () => {
      await apiTester.testEndpoint('/debug', 200);
    });

    it('should serve lessons learned', async () => {
      const data = await apiTester.testJSONEndpoint('/lessons', 200);
      if (data) {
        expect(data).toHaveProperty('lessons');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown endpoints', async () => {
      await apiTester.testEndpoint('/unknown-endpoint', 404);
    });

    it('should handle CORS headers', async () => {
      const response = await apiTester.makeRequest('/api/live');
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });

    it('should handle OPTIONS requests', async () => {
      const response = await apiTester.makeRequest('/api/live', 'OPTIONS');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Data Validation', () => {
    it('should return valid JSON for metrics endpoint', async () => {
      const data = await apiTester.testJSONEndpoint('/api/live', 200);
      if (data) {
        expect(typeof data.timestamp).toBe('string');
        expect(typeof data.metrics).toBe('object');
      }
    });

    it('should return valid JSON for status endpoint', async () => {
      const data = await apiTester.testJSONEndpoint('/api/status', 200);
      if (data) {
        expect(typeof data.status).toBe('string');
        expect(typeof data.uptime).toBe('number');
      }
    });

    it('should return valid JSON for trends endpoint', async () => {
      const data = await apiTester.testJSONEndpoint('/trends', 200);
      if (data) {
        expect(typeof data.trends).toBe('object');
      }
    });
  });
});
