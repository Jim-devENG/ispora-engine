#!/usr/bin/env node

/**
 * iSpora Health Check Monitor
 * Monitors Render health check patterns and alerts on anomalies
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class HealthMonitor {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://ispora-backend.onrender.com';
    this.interval = config.interval || 30000; // 30 seconds
    this.alertThreshold = config.alertThreshold || 5000; // 5 seconds drift
    this.logFile = config.logFile || './health-monitor.log';
    this.webhookUrl = config.webhookUrl || null;
    
    this.lastUptime = null;
    this.lastTimestamp = null;
    this.consecutiveFailures = 0;
    this.maxFailures = 3;
    
    this.start();
  }

  async checkHealth() {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/api/health');
      const responseTime = Date.now() - startTime;
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        this.handleSuccess(data, responseTime);
      } else {
        this.handleFailure(`HTTP ${response.statusCode}`, responseTime);
      }
    } catch (error) {
      this.handleFailure(error.message, Date.now() - startTime);
    }
  }

  handleSuccess(data, responseTime) {
    const currentUptime = data.uptime;
    const currentTimestamp = new Date(data.timestamp).getTime();
    
    // Check for uptime drift
    if (this.lastUptime !== null) {
      const expectedUptime = this.lastUptime + (currentTimestamp - this.lastTimestamp) / 1000;
      const uptimeDrift = Math.abs(currentUptime - expectedUptime);
      
      if (uptimeDrift > this.alertThreshold) {
        this.alert(`Uptime drift detected: ${uptimeDrift.toFixed(2)}s (threshold: ${this.alertThreshold}ms)`);
      }
    }
    
    // Check health status
    if (data.status !== 'ok') {
      this.alert(`Health status not OK: ${data.status}`);
    }
    
    // Log successful check
    this.log({
      timestamp: new Date().toISOString(),
      status: 'success',
      uptime: currentUptime,
      responseTime: responseTime,
      environment: data.environment,
      version: data.version
    });
    
    // Update tracking
    this.lastUptime = currentUptime;
    this.lastTimestamp = currentTimestamp;
    this.consecutiveFailures = 0;
  }

  handleFailure(error, responseTime) {
    this.consecutiveFailures++;
    
    this.log({
      timestamp: new Date().toISOString(),
      status: 'failure',
      error: error,
      responseTime: responseTime,
      consecutiveFailures: this.consecutiveFailures
    });
    
    if (this.consecutiveFailures >= this.maxFailures) {
      this.alert(`Health check failed ${this.consecutiveFailures} times in a row: ${error}`);
    }
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: new URL(this.baseUrl).hostname,
        port: 443,
        path: path,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'iSpora-HealthMonitor/1.0'
        }
      };
      
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  log(entry) {
    const logEntry = JSON.stringify(entry) + '\n';
    console.log(`[${entry.timestamp}] ${entry.status.toUpperCase()}: ${entry.uptime ? `Uptime: ${entry.uptime}s` : entry.error}`);
    
    // Write to log file
    fs.appendFileSync(this.logFile, logEntry);
  }

  alert(message) {
    const alertMessage = `🚨 ALERT: ${message}`;
    console.error(alertMessage);
    
    // Send webhook if configured
    if (this.webhookUrl) {
      this.sendWebhook(alertMessage);
    }
  }

  async sendWebhook(message) {
    try {
      const data = JSON.stringify({
        text: message,
        timestamp: new Date().toISOString()
      });
      
      const options = {
        hostname: new URL(this.webhookUrl).hostname,
        port: 443,
        path: new URL(this.webhookUrl).pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = http.request(options);
      req.write(data);
      req.end();
    } catch (error) {
      console.error('Failed to send webhook:', error.message);
    }
  }

  start() {
    console.log(`🔍 Starting health monitor for ${this.baseUrl}`);
    console.log(`📊 Check interval: ${this.interval}ms`);
    console.log(`⚠️  Alert threshold: ${this.alertThreshold}ms uptime drift`);
    console.log(`📝 Log file: ${this.logFile}`);
    
    // Initial check
    this.checkHealth();
    
    // Schedule regular checks
    setInterval(() => {
      this.checkHealth();
    }, this.interval);
  }
}

// Configuration
const config = {
  baseUrl: process.env.HEALTH_URL || 'https://ispora-backend.onrender.com',
  interval: parseInt(process.env.CHECK_INTERVAL) || 30000,
  alertThreshold: parseInt(process.env.ALERT_THRESHOLD) || 5000,
  logFile: process.env.LOG_FILE || './health-monitor.log',
  webhookUrl: process.env.WEBHOOK_URL || null
};

// Start monitoring
new HealthMonitor(config);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down health monitor...');
  process.exit(0);
});

