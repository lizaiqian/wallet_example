/**
 * 配置数据库
 */
const userService = require('./service/users');
const rechargeInfoService = require('./service/rechargeBtcInfo');

/**
 * 工具和参数
 */
const {fetchRequest} = require('./utils/fetchUtil');
const crypto = require('./utils/cryptoUtil');
const {sendOmniTransaction} = require('./utils/btcUtil');
const logger = require('./utils/logUtil');

const {rechargeKey, rechargeIv, btcMasterAddress} = require('./config');
const {rechargeBtcUsdtApi} = require('./interface');

/**
 * 获取omni rpc client
 */
const client = require('./omni/client');

/**
 * 配置redis
 */
const redis = require('./redis/redis');
const utils = require('util');

const redisGetAsync = utils.promisify(redis.get).bind(redis);
const redisSetAsync = utils.promisify(redis.set).bind(redis);

const {redisBlockCountKey} = require('./config');

let lastBlockCount = 0;
let currentBlockCount;

const watchTransaction = async () => {

    lastBlockCount = await redisGetAsync(redisBlockCountKey);
    logger.debug("lastBlockCount:" + lastBlockCount);
    //第一次运行初始化
    if (lastBlockCount === null || lastBlockCount === undefined) {
        lastBlockCount = await client.getBlockCount();
        logger.debug("lastBlockCount:" + lastBlockCount);
        await redisSetAsync(redisBlockCountKey, lastBlockCount);
        return;
    }

    //获取当前blockCount
    currentBlockCount = await client.getBlockCount();
    logger.debug("currentBlockCount:" + currentBlockCount);

    //初始化
    if(currentBlockCount - lastBlockCount > 10) {
        await redisSetAsync(redisBlockCountKey, currentBlockCount);
        return;
    }

    await redisSetAsync(redisBlockCountKey, currentBlockCount);

    //存储块中所有hash
    const newHashes = [];
    for (let i = lastBlockCount; i < currentBlockCount; i++) {
        let blockHash = await client.getBlockHash(parseInt(i));
        let block = await client.getBlock(blockHash);
        for (let j = 0; j < block.tx.length; j++) {
            newHashes.push(block.tx[j]);
        }
    }

    //获取交易信息并筛选
    const txs = [];
    for (let i = 0; i < newHashes.length; i++) {
        const tx = await client.omniGetTransaction(newHashes[i]);
        const user = await userService.findByBtcAddress(tx.referenceaddress);
        if (user !== null && user.uid !== 0 && tx.propertyid === 31) {
            logger.info("retrieve usdt from user address");

            let retrieveHash;

            try {
                const usdtBalance = await client.omniGetBalance(user.btcAddress, 31);

                txs.push({hash: tx.txid, uid: user.uid, value: tx.amount, fromAddress: tx.sendingaddress});

                logger.info("usdtBalance: " + usdtBalance.balance);
                retrieveHash = await sendOmniTransaction(user.btcAddress, btcMasterAddress, 31, usdtBalance.balance, btcMasterAddress);
                logger.info("retrieve usdt from user address successful");
                await rechargeInfoService.createRechargeInfo(tx.txid, user.uid, tx.amount, retrieveHash, tx.sendingaddress);

            } catch (e) {
                logger.error(e);
                await rechargeInfoService.createRechargeInfo(tx.txid, user.uid, tx.amount, null);
                logger.info("fail to retrieve usdt from user address");

            }

        }
    }

    if (txs.length !== 0) {

        for (let i = 0; i < txs.length; i++) {
            const encryptData = crypto.encrypt(JSON.stringify(txs[i]), rechargeKey, rechargeIv);
            fetchRequest(rechargeBtcUsdtApi, encryptData).then(json => {logger.info({msg: "状态提交成功", resCode: json.code})})
                .catch(logger.error);
        }

    }

    logger.debug(txs);

};

watchTransaction();
setInterval(watchTransaction, 1000 * 180);
