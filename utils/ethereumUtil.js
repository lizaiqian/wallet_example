/**
 * config
 */
const {mainMne, gasPriceFactor, chainId, privateKey, privateIv} = require('../config');
const logger = require('./logUtil');
const crypto = require('./cryptoUtil');
const Big = require('big.js');


/**
 * web3 and contract
 */
const web3 = require('./web3Util');
const contract = require('../contracts/contract');
const contractAddress = require('../contracts/address/index');


/**
 * bip39 and wallet
 */
const bip39 = require('bip39');
const HDKey = require('ethereumjs-wallet/hdkey');
const EthereumTx = require('ethereumjs-tx');


/**
 * service
 */
const userService = require('../service/users');



/**
 * 获取eth地址
 * @param id
 * @returns {*}
 */
const getAddress = (id) => {
    const childKey = getChildKey(id);
    return childKey.getWallet().getAddressString();

};


/**
 * 获取eth私钥
 * @param id
 * @returns {*}
 */
const getPrivateKey = (id) => {
    const childKey = getChildKey(id);
    return childKey.getWallet().getPrivateKeyString();
};

/**
 * 派生子账户
 * @param id
 */
const getChildKey = (id) => {
    const seed = bip39.mnemonicToSeed(mainMne);
    const masterKey = HDKey.fromMasterSeed(seed);
    return masterKey.derivePath("m/44'/60'/0'/0/" + id);
};

/**
 * 解密private key
 * @param ethPrivateKeyCrypto
 * @returns {string}
 */
const decodePrivateKey = (ethPrivateKeyCrypto) => {
    return crypto.decrypt(ethPrivateKeyCrypto, privateKey, privateIv);
};


/**
 * 生成原始交易
 * @param uid
 * @param desAddress
 * @param value
 * @param tokenValue
 * @returns {Promise<void>}
 */
const sendEthTransaction = async (uid, desAddress, value, tokenValue) => {

    //获取数据库对象
    const findUser = await userService.findById(uid);

    //获取私钥
    const privateKeyString = decodePrivateKey(findUser.ethPrivateKey).substring(2);
    const privateKey = Buffer.from(privateKeyString, 'hex');

    //iValue 转账金额
    let dataAbi = "";
    let iValue;
    let toAddress;
    let gasLimit;
    if(tokenValue !== 0 && tokenValue !=="0") {
        //获取转账数据abi
        dataAbi = contract.methods.transfer(desAddress, tokenValue.toString()).encodeABI();
        logger.debug("data:" + dataAbi);
        iValue = 0;
        toAddress = contractAddress;
        gasLimit = await contract.methods.transfer(desAddress, tokenValue.toString()).estimateGas({from: findUser.ethAddress});

    } else {
        iValue = parseInt(value);
        toAddress = desAddress;
        gasLimit = 21000;
    }

    //gas
    const gasPrice = await web3.eth.getGasPrice();

    logger.debug("gasLimit: " + gasLimit);

    //nonce
    let nonce = await web3.eth.getTransactionCount(findUser.ethAddress, "pending");
    logger.debug("nonce: " + nonce);

    const txParams = {
        nonce: toHex(nonce),
        gasPrice: toHex(gasPrice * gasPriceFactor),
        gasLimit: toHex(gasLimit),
        to: toAddress,
        value: toHex(iValue),
        data: dataAbi,
        chainId: chainId
    };

    const tx = new EthereumTx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();

    const block = await web3.eth.sendSignedTransaction(toHex(serializedTx));
    logger.debug(block.transactionHash);

    return block;

};


/**
 * 提取子账户中所有eth-usdt
 * @param uid
 * @param desAddress
 * @returns {Promise<void>}
 */
const retrieveAllEthUsdt = async (uid, desAddress) => {
    //获取数据库对象
    const findUser = await userService.findById(uid);

    //获取私钥
    const privateKeyString = decodePrivateKey(findUser.ethPrivateKey).substring(2);
    const privateKey = Buffer.from(privateKeyString, 'hex');

    const balance = await contract.methods.balanceOf(findUser.ethAddress).call();
    if(balance === 0 || balance === "0") {
        return;
    }

    const coinValue = balance;
    console.log("usdt balance: " + coinValue);

    const gasLimit = await contract.methods.transfer(desAddress, coinValue).estimateGas({from: findUser.ethAddress});
    logger.debug("gasLimit:" + gasLimit);
    const gasPrice = await web3.eth.getGasPrice();

    const retrieveNeededEth = Big(gasLimit).times(gasPrice).times(gasPriceFactor).toString();

    const ethBalance = await web3.eth.getBalance(findUser.ethAddress);
    logger.debug("ethBalance:" + ethBalance);
    console.log("retrieveNeedEth: " + parseInt(retrieveNeededEth));

    if (ethBalance < parseInt(retrieveNeededEth)) {
        logger.info("transfer ETH to child account");
        await sendEthTransaction(0, findUser.ethAddress, Big(retrieveNeededEth).minus(ethBalance).toString(), 0);
        logger.info("transfer ETH to child account successful");
    }

    //获取转账数据abi
    const dataAbi = contract.methods.transfer(desAddress, coinValue).encodeABI();
    const iValue = 0;
    const toAddress = contractAddress;

    //nonce
    let nonce = await web3.eth.getTransactionCount(findUser.ethAddress, "pending");
    logger.debug("nonce: " + nonce);

    const txParams = {
        nonce: toHex(nonce),
        gasPrice: toHex(gasPrice * gasPriceFactor),
        gasLimit: toHex(gasLimit),
        to: toAddress,
        value: toHex(iValue),
        data: dataAbi,
        chainId: chainId
    };

    const tx = new EthereumTx(txParams);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();

    const block = await web3.eth.sendSignedTransaction(toHex(serializedTx));
    logger.debug(block.transactionHash);
};


/**
 * 转为十六进制
 * @param data
 * @returns {string}
 */
const toHex = (data) => {
    if(typeof(data) === 'string') {
        return "0x" + parseInt(data).toString(16);
    } else if(typeof(data) === 'number') {
        return "0x" + data.toString(16);
    } else {
        return "0x" + data.toString('hex');
    }
};

module.exports = {
    getAddress,
    getPrivateKey,
    sendEthTransaction,
    retrieveAllEthUsdt
};
