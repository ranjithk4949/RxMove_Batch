// PM2 ecosystem configuration for production deployment
module.exports = {
  apps: [{
    name: 'rxmove-batch-jobs',
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      TZ: 'America/Toronto'
    },
    env_production: {
      NODE_ENV: 'production',
      TZ: 'America/Toronto'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
