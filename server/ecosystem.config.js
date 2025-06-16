module.exports = {
  apps: [{
    name: 'server',
    script: 'main.js',
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
