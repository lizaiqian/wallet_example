/**
 * 日志打印
 */
const Logger = require('log4js');
const {logLevel} = require('../config');

Logger.configure({
    appenders: { lianghua: { type: 'console' } },
    categories: { default: { appenders: ['lianghua'], level: logLevel } },
    pm2: true,
    replaceConsole: true
});

const logger = Logger.getLogger("lianghua");

module.exports = logger;
