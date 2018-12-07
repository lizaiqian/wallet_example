/**
 * 配置express、router、config
 */
const express = require('express');
const router = express.Router();
const userService = require('../service/users');
const withdrawEthInfoService = require('../service/withdrawEthUsdtInfo');
const rechargeBtcUsdtInfoService = require('../service/rechargeBtcUsdtInfo');
const withdrawBtcInfoService = require('../service/withdrawBtcUsdtInfo');

const {withdrawIv, withdrawKey, walletPassphrase, btcMasterAddress, privateKey, privateIv} = require('../config');
const {withdrawEthUsdtApi} = require('../interface');


/**
 * util配置
 * @type {module:crypto}
 */
const crypto = require('../utils/cryptoUtil');
const random = require('../utils/randomUtil');
const {getAddress, getPrivateKey, sendEthTransaction} = require('../utils/ethereumUtil');
const {sendOmniTransaction} = require('../utils/btcUtil');
const {fetchRequest} = require('../utils/fetchUtil');
const logger = require('../utils/logUtil');

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
const btcMainAccountName = "main";

/**
 * 载入主账户
 * @type {number}
 */
const mainAccountIndex = 0;

userService.findById(mainAccountIndex).then((res) => {
    if (!res) {
        const mainAddress = getAddress(mainAccountIndex);
        const mainPrivateKey = getPrivateKey(mainAccountIndex);
        const mainPrivateKeyCrypto = crypto.encrypt(mainPrivateKey, privateKey, privateIv);
        userService.createUser(mainAccountIndex, mainAddress, mainPrivateKeyCrypto, btcMasterAddress);
    }
});

/**
 * 分页获取用户
 */
router.get('/page/:page/limit/:limit', async (req, res, next) => {

    try {
        const limit = parseInt(req.params.limit);
        const page = parseInt(req.params.page);

        const users = await userService.findUsersByPage(limit, limit * page);
        res.success({users: users});
    } catch (e) {
        res.fail("invalid parameters");
    }

});


/**
 * 获取所有用户数量
 */
router.get('/count', async (req, res, next) => {

    const count = await userService.getUserCount();
    res.success(count);

});


/**
 * 生成和获取地址api
 */
router.get('/address/:uid', async (req, res, next) => {
    const uid = req.params.uid;
    const reg = /^[0-9]+$/;

    if (uid === "" || uid === mainAccountIndex.toString() || !reg.test(uid)) {
        res.fail("invalid uid");
        return;
    }

    let findUser;
    findUser = await userService.findById(uid);

    if (findUser === null) {
        //生成平台eth私钥
        const ethPrivateKey = getPrivateKey(uid);
        const ethPrivateKeyCrypto = crypto.encrypt(ethPrivateKey, privateKey, privateIv);

        // 生成平台eth地址
        const ethAddress = getAddress(uid);

        // 生成平台btc地址
        let btcAddress;
        try {
            await client.walletPassphrase(walletPassphrase, 60);
            await client.keypoolRefill();
            await client.walletLock();
            btcAddress = await client.getNewAddress(btcMainAccountName);
        } catch (e) {
            logger.error(e);
        }

        await userService.createUser(uid, ethAddress, ethPrivateKeyCrypto, btcAddress);
        res.success({eth: ethAddress, btc: btcAddress});
    } else {
        res.success({eth: findUser.ethAddress, btc: findUser.btcAddress});
    }

});


/**
 * 检查ethAddress是否存在
 */

router.get('/checkEthAddress/:ethAddress', async (req, res, next) => {
    const address = req.params.ethAddress;
    const reg = /^0x[0-9a-fA-F]{40}$/;
    if (!reg.test(address)) {
        res.fail("invalid address");
        return;
    }

    let findUser;
    findUser = await userService.findUidByEthAddress(address);

    if (findUser !== null) {
        res.success({ethAddress: address});
    } else {
        res.success({ethAddress: null});
    }

});


/**
 * 检查btcAddress是否存在
 */
router.get('/checkBtcAddress/:btcAddress', async (req, res, next) => {
    const address = req.params.btcAddress;
    const reg = /^[13][0-9A-Za-z]{25,33}$/;

    if (!reg.test(address)) {
        res.fail("invalid btc address");
        return;
    }

    const findUser = await userService.findByBtcAddress(address);
    res.success({btcAddress: findUser !== null ? findUser.btcAddress : null})

});


/**
 * omni-usdt提现
 */
router.post('/withdraw/omniUsdt', async (req, res, next) => {

    //id, value, address
    const token = req.body.token;
    let decData = null;

    try {
        decData = crypto.decrypt(token, withdrawKey, withdrawIv);
        decData = JSON.parse(decData)
    } catch (e) {
        logger.error(e);
        res.fail("fail to decrypt token");
        return;
    }

    const uid = decData.uid;
    const value = decData.value;
    const address = decData.address;

    if (!uid || !value || !address) {
        res.fail("bad parameters");
        return;
    }

    const findUser = await userService.findById(uid);

    if (uid === 0 || findUser === null) {
        res.fail("invalid uid");
        return;
    }

    const btcAddress = findUser.btcAddress;

    const usdtBalance = await client.omniGetBalance(btcAddress, 31);

    await withdrawBtcInfoService.createWithdrawInfo(uid, value, address);

    if (parseInt(usdtBalance.balance) > 0) {
        //在充值里面处理
        logger.info("retrieve usdt from user address");
        const retrieveHash = await sendOmniTransaction(btcAddress, btcMasterAddress, 31, usdtBalance.balance, btcMasterAddress);
        await rechargeBtcUsdtInfoService.setRetrieveHash(uid, retrieveHash);
        logger.info("retrieve usdt from user address successful");
    }

    logger.info("withdraw usdt from main address to destination address");
    const sendHash = await sendOmniTransaction(btcMasterAddress, address, 31, value.toString(), btcMasterAddress);
    logger.info("withdraw usdt from main address to destination address successful");

    res.success({
        hash: sendHash
    });

});


/**
 * eth-usdt提现
 */
router.post('/withdraw/ethUsdt', async (req, res, next) => {

    //解析token
    const token = req.body.token;
    let decData;
    try {
        decData = crypto.decrypt(token, withdrawKey, withdrawIv);
        decData = JSON.parse(decData);
    } catch (e) {
        res.fail("fail to decrypt the token");
        return;
    }

    //主账户
    const mainAccount = await userService.mainAccount();

    //检查参数
    let uid, value, address, id;
    uid = decData.uid;
    value = decData.value;
    address = decData.address;
    id = decData.id;

    if (!uid || !value || !address || !id) {
        res.fail("bad parameters");
        return;
    }

    //获取用户信息
    const idReg = /^[0-9]+$/;
    const ethAddressReg = /^0x[0-9a-fA-F]{40}$/;

    if (uid === mainAccountIndex || uid === mainAccountIndex.toString() || !idReg.test(uid)) {
        res.fail("invalid uid");
        return;
    }

    if (!ethAddressReg.test(address)) {
        res.fail("invalid eth address");
        return;
    }

    let findUser;
    findUser = await userService.findById(uid);
    if (findUser === null) {
        res.fail("can't find a user by uid");
        return;
    }

    await withdrawEthInfoService.createWithdrawInfo(uid, value, address);

    //用户提现信息加密
    const timestamp = Date.now() + random.generateRandom();
    const newToken = crypto.encrypt(JSON.stringify({
        timestamp: timestamp,
        id: id,
        address: address,
        value: value
    }), withdrawKey, withdrawIv);

    res.success({token: newToken});

    const ethBalance = await web3.eth.getBalance(findUser.ethAddress);
    logger.debug("ethBalance:" + ethBalance);

    const balance = await contract.methods.balanceOf(findUser.ethAddress).call({from: mainAccount});
    logger.debug("token balance: " + balance);

    if (balance !== "0" && balance !== 0) {
        try {
            if (ethBalance < parseInt(web3.utils.toWei("0.001"))) {
                logger.info("transfer ETH to child account");
                await sendEthTransaction(mainAccountIndex, findUser.ethAddress, web3.utils.toWei("0.001"), 0);
                logger.info("transfer ETH to child account successful");
            }
            logger.info("retrieve USDT from child account");
            await sendEthTransaction(uid, mainAccount, 0, balance);
            logger.info("retrieve USDT from child account successful");
        } catch (e) {
            logger.error(e);
            const failToken = crypto.encrypt(JSON.stringify({
                code: 0,
                timestamp: timestamp,
                id: id,
                address: address,
                value: value
            }), withdrawKey, withdrawIv);
            fetchRequest(withdrawEthUsdtApi, failToken).then(json => logger.info(json))
                .catch(err => {
                    logger.error(err);
                });

            throw Error("fail to retrieve child account USDT");
        }
    }

    try {
        logger.info("transfer USDT from the main account to destination account");
        const block = await sendEthTransaction(mainAccountIndex, address, 0, Big(value).times(1000000).toString());
        logger.info("transfer USDT from the main account to destination account successful");

    } catch (e) {
        logger.error(e);
        const failToken = crypto.encrypt(JSON.stringify({
            code: 0,
            timestamp: timestamp,
            id: id,
            address: address,
            value: value
        }), withdrawKey, withdrawIv);
        fetchRequest(withdrawEthUsdtApi, failToken).then(json => logger.info(json))
            .catch(err => {
                logger.error(err);
            });

        throw Error("fail to transfer from the main account to destination account");
    }

    const successToken = crypto.encrypt(JSON.stringify({
        code: 1,
        timestamp: timestamp,
        id: id,
        address: address,
        value: value
    }), withdrawKey, withdrawIv);

    fetchRequest(withdrawEthUsdtApi, successToken).then(json => logger.info(json))
        .catch(err => {
            logger.error(err);
        });


});


module.exports = router;

