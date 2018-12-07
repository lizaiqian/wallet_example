/**
 * 设置事件监听
 * @type {string}
 */


/**
 * service
 * @type {{createUser, findById, findUidByEthAddress, mainAccount, findByBtcAddress, listAllBtcAddress}|*}
 */
const userService = require("./service/users");
const txService = require("./service/rechargeEthUsdtInfo");


/**
 * config, api
 */
const {rechargeKey, rechargeIv, wsnetwork} = require('./config');
const {rechargeEthUsdtApi} = require('./interface');


/**
 * utils
 * @type {{encrypt, decrypt}|*}
 */
const crypto = require('./utils/cryptoUtil');
const {fetchRequest} = require('./utils/fetchUtil');
const logger = require('./utils/logUtil');
const {retrieveAllEthUsdt} = require('./utils/ethereumUtil');
const Big = require('big.js');


/**
 * web3
 * @type {address|string}
 */
const address = require('./contracts/address');
const abi = require('./contracts/abi');
const Web3 = require('web3');

const wsProvider = new Web3.providers.WebsocketProvider(wsnetwork);
const web3 = new Web3(wsProvider);
const contract = new web3.eth.Contract(abi, address);


const testNetwork = () => {
    userService.mainAccount()
        .then(web3.eth.getBalance)
        .then(balance => logger.debug(balance))
        .catch(e => process.exit(1));
};

//websocket网络测试
setInterval(testNetwork, 60 * 1000);

contract.events.Transfer({}, {
    fromBlock: 0,
    toBlock: 'latest',
}, async (error, event) => {
    if (error) {
        logger.error(error);
    } else {

        const to = event.returnValues.to.toLowerCase();
        const bigValue = Big(event.returnValues.value);
        const value = bigValue.div(1000000).toFixed(6);
        const hash = event.transactionHash;

        const user = await userService.findUidByEthAddress(to);
        logger.debug(user);

        if(user === null || user.uid === 0) {
            return;
        }

        let encryptData = crypto.encrypt(JSON.stringify({
            hash: event.transactionHash,
            uid: user.uid,
            value: value.toString(),
            fromAddress: event.returnValues.from,
        }), rechargeKey, rechargeIv);

        const tx = await txService.findByHash(hash);

        if(tx !== null) {
            logger.info("交易重复提交");
            return;
        }

        await txService.createTransaction(user.uid, hash, value.toString(), event.returnValues.from);

        try {
            const response = await fetchRequest(rechargeEthUsdtApi, encryptData);
            if(response.code === 1) {
                await txService.commitTransaction(hash);
                logger.debug({msg: "状态提交成功", resCode: response.code});
            }
        } catch (e) {
            logger.error(e);
            await txService.invalidTransaction(hash);
            logger.debug({msg: "状态提交成功", resCode: 0});
        }

        const mainAddress = await userService.mainAccount();

        try {
            logger.info("retrieve all ETH-USDT from child address");
            await retrieveAllEthUsdt(user.uid, mainAddress);
            logger.info("retrieve all ETH-USDT from child address successful");
        } catch (e) {
            logger.error(e);
            logger.info("fail to retrieve all ETH-USDT from child address")
        }

    }
});

