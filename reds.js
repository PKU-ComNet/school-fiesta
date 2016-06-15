
var reds = require('reds');
var redis = require('redis');

reds.createClient = function () {
  return (reds.client || redis.createClient(process.env.REDIS_URL));
}

module.exports = reds;
