/**
 * 获取web3对象
 * @type {Web3}
 */

const Web3 = require('web3');
const {network} = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider(network));

module.exports = web3;