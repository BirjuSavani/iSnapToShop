const Redis = require('ioredis');
const redis = new Redis({
  host: 'localhost', // or your Redis server IP
  port: 6379,
  // password: 'your_password', // if protected
});

module.exports = redis;
