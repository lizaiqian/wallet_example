/**
 * redis连接对象
 * @type {RedisClient}
 */

const redis = require('redis');
const {redisPassword} = require('../config');
const logger = require('../utils/logUtil');

const client = redis.createClient({password: redisPassword});

client.on("error", (err) => {
    logger.error(err);
});

module.exports = client;
