/**
 * omni客户端
 * @type {OmniClient}
 */
const OmniClient = require('./OmniClient').OmniClient;

const {rpcUser, rpcPassword, rpcHost, rpcPort} = require('../config');

const client = new OmniClient({
    host: rpcHost,
    user: rpcUser,
    pass: rpcPassword,
    port: rpcPort
});

module.exports = client;

