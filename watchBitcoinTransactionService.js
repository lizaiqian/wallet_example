/**
 * 配置数据库
 */
const userService = require('./service/users');
const rechargeBtcInfoService = require('./service/rechargeBtcInfo');
const rechargeBtcUsdtInfoService = require('./service/rechargeBtcUsdtInfo');

/**
 * 工具和参数
 */
const {fetchRequest} = require('./utils/fetchUtil');
const crypto = require('./utils/cryptoUtil');
const logger = require('./utils/logUtil');
const {sendOmniTransaction} = require('./utils/btcUtil');

const {rechargeKey, rechargeIv, btcMasterAddress} = require('./config');
const {rechargeBtcApi, rechargeBtcUsdtApi} = require('./interface');

/**
 * 获取omni rpc client
 */
const client = require('./omni/client');

/**
 * 配置redis
 */
const watchTransaction = async () => {

    //监听btc交易信息
    const btcTransactions = await client.listTransactions("main", 50);
    for (let i = btcTransactions.length - 1; i >= 0; i--) {

        const tx = btcTransactions[i];

        if (tx.address === btcMasterAddress || tx.amount < 0.001) {
            continue;
        }

        //查询用户是否在数据库中
        const user = await userService.findByBtcAddress(tx.address);
        if (user === null) {
            continue;
        }

        //查询数据库中是否已有该交易信息
        const info = await rechargeBtcInfoService.findInfoByHash(tx.txid);
        if (info !== null) {
            break;
        }

        await rechargeBtcInfoService.createRechargeInfo(tx.txid, user.uid, tx.amount);
        const encryptData = crypto.encrypt(JSON.stringify({
            hash: tx.txid,
            uid: user.uid,
            value: tx.amount
        }), rechargeKey, rechargeIv);

        const response = await fetchRequest(rechargeBtcApi, encryptData);

        if (response.code === 1) {
            await rechargeBtcInfoService.commitRechargeInfo(tx.txid);
            logger.debug({msg: "状态提交成功", resCode: response.code});
        }


    }

    //监听omni-usdt交易信息
    const omniTransactions = await client.omniListTransactions("*", 50);

    for (let i = 0; i < omniTransactions.length; i++) {
        const tx = omniTransactions[i];

        if (tx.referenceaddress === btcMasterAddress) {
            continue;
        }

        const user = await userService.findByBtcAddress(tx.referenceaddress);
        if (user === null) {
            continue;
        }

        console.log(tx);

        const info = await rechargeBtcUsdtInfoService.findInfoByHash(tx.txid);
        if (info !== null) {
            break;
        }

        const retrieveHash = await sendOmniTransaction(tx.referenceaddress, btcMasterAddress, 31, tx.amount, btcMasterAddress);

        //保存充值数据
        await rechargeBtcUsdtInfoService.createRechargeInfo(tx.txid, user.uid, tx.amount, retrieveHash, tx.sendingaddress);

        const encryptData = crypto.encrypt(JSON.stringify({
            hash: tx.txid,
            uid: user.uid,
            value: tx.amount
        }), rechargeKey, rechargeIv);

        const response = await fetchRequest(rechargeBtcUsdtApi, encryptData);
        if (response.code === 1) {
            logger.debug({msg: "状态提交成功", resCode: response.code});
        }
    }

};

watchTransaction();
setInterval(watchTransaction, 1000 * 180);
