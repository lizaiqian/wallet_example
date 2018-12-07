/**
 * 生成合约对象
 * @type {Web3}
 */
const web3 = require('../utils/web3Util');
const address = require('./address');
const abi = require('./abi');

const contract = new web3.eth.Contract(abi, address);

module.exports = contract;