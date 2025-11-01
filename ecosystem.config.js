module.exports = {
  apps: [{
    name: 'ispora-health-monitor',
    script: 'monitor.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      HEALTH_URL: 'https://ispora-backend.onrender.com',
      CHECK_INTERVAL: '30000',
      ALERT_THRESHOLD: '5000',
      LOG_FILE: './logs/health-monitor.log',
      WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || null
    },
    error_file: './logs/health-monitor-error.log',
    out_file: './logs/health-monitor-out.log',
    log_file: './logs/health-monitor-combined.log',
    time: true
  }]
};

