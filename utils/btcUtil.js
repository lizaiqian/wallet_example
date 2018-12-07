/**
 * omni rpc客户端
 */
const client = require('../omni/client');

/**
 * 配置和util
 */
const {walletPassphrase, btcMasterAddress, btcTransferFee} = require('../config');
const logger = require('./logUtil');
const {fetchGet} = require('./fetchUtil');
const Big = require('big.js');

const {recommendBtcFeeApi} = require('../interface');


/**
 * 发送omni-usdt交易
 * @param from 发送方
 * @param to 接收方
 * @param propertyId 代币id
 * @param value 代币金额
 * @param feeAddress 手续费地址
 * @returns {Promise<*>} hash
 */
const sendOmniTransaction = async (from, to, propertyId, value, feeAddress) => {

    const unspents = await client.listUnspent();
    if (unspents.length === 0) {
        const lockUnspents = await client.listLockUnspent();
        if (lockUnspents.length === 0) {
            throw Error("not enough fees to send usdt");
        }

        await client.lockUnspent(true, lockUnspents);
        await client.lockUnspent(true, lockUnspents);

    }

    let hash;

    try {
        await client.walletPassphrase(walletPassphrase, 60);
        hash = await client.omniFundedSend(from, to, propertyId, value.toString(), feeAddress);
    } catch (e) {
        logger.error(e);
    } finally {
        await client.walletLock();
    }

    return hash;

};

const sendBtcTransaction = async (to, amount) => {

    let unspents = await client.listUnspent();

    if (unspents.length === 0) {
        const lockUnspents = await client.listLockUnspent();
        if (lockUnspents.length === 0) {
            throw Error("not enough btc to send");
        }

        await client.lockUnspent(true, lockUnspents);
        await client.lockUnspent(true, lockUnspents);

        unspents = await client.listUnspent();
    }

    const input = unspents.filter(unspent => {
        return unspent.amount > 0.0001
    });

    const feeResponse = await fetchGet(recommendBtcFeeApi);
    console.log(feeResponse);

    const totalAmount = input.map(x => Big(x.amount)).reduce((a, b) => {
        return a.plus(b);
    });

    console.log("totalAmount: " + totalAmount.toString());

    const byteLength = 148 * input.length + 34 * 2 + 10;
    const fee = Big(byteLength).times(feeResponse.fastestFee).times(btcTransferFee).toString();
    console.log("fee: " + fee);

    let output = {};
    output[to] = amount.toString();
    output[btcMasterAddress] = totalAmount.minus(amount).minus(fee).toString();

    console.log(output);

    try {
        const rawTx = await client.createRawTransaction(input, output);
        console.log(rawTx);

        await client.walletPassphrase(walletPassphrase, 10);

        const signTx = await client.signRawTransaction(rawTx);
        console.log(signTx.hex);

        // return await client.sendRawTransaction(signTx);

    } catch (e) {
        logger.error(e);
        logger.error('fail to send transaction');
    } finally {
        await client.walletLock();
    }

    return null;

};

// sendBtcTransaction("1PgGywpKQyANJdSdWK4g6aJeoBBP1QSvB8", 0.0002);

module.exports = {
    sendOmniTransaction,
    sendBtcTransaction,
};