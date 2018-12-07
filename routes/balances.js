/**
 * 配置express、router、config
 */
const express = require('express');
const router = express.Router();
const userService = require('../service/users');

const {btcMasterAddress} = require('../config');

/**
 * util配置
 * @type {module:crypto}
 */

const Big = require('big.js');

/**
 * 以太坊连接配置
 * @type {Web3}
 */
const web3 = require('../utils/web3Util');


/**
 * 载入合约
 * @type {Contract | web3.eth.Contract}
 */
const contract = require('../contracts/contract');

/**
 * omni配置
 */
const client = require('../omni/client');

/**
 * 获取所有余额
 */

router.get('/all', async (req, res, next) => {

    const mainAccount = await userService.mainAccount();

    //eth usdt
    const tempEthUsdtBalance = await contract.methods.balanceOf(mainAccount).call();
    const ethUsdtBalance = Big(tempEthUsdtBalance).div('1e+6').toFixed(4);

    //eth
    const tempEthBalance = await web3.eth.getBalance(mainAccount);
    const ethBalance = Big(tempEthBalance).div('1e+18').toFixed(4);

    //omni usdt
    const tempBtcUsdtBalance = await client.omniGetBalance(btcMasterAddress, 31);
    const btcUsdtBalance = Big(tempBtcUsdtBalance.balance).toFixed(4);

    //btc
    const tempBtcBalance = await client.getBalance();
    const btcBalance = Big(tempBtcBalance).toFixed(4);

    res.success({ethUsdt: ethUsdtBalance, omniUsdt: btcUsdtBalance, eth: ethBalance, btc: btcBalance.toString()});

});


module.exports = router;