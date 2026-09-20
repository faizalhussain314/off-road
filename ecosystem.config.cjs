module.exports = {
  apps: [
    {
      name: 'adventure-offroad',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/home/optimusinfinity/adventure.madprotekcorp.com',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MYSQL_HOST: 'localhost',
        MYSQL_PORT: 3306,
        MYSQL_USER: 'optimusinfinity_mpuser',
        MYSQL_PASSWORD: 'MadProTekPass2026!#',
        MYSQL_DATABASE: 'optimusinfinity_offroad',
        ADMIN_SECRET_KEY: 'madprotek2026'
      }
    }
  ]
};
