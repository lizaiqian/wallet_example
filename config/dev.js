/**
 * 运行端口
 * @type {number}
 */
const port = 0;

/**
 * allow ip
 */
const allowIp = "0.0.0.0";


/**
 * 日志等级
 * @type {string}
 */
const logLevel = "debug";

/**
 * 数据库
 * @type {string}
 */

const db_post = "localhost";

const db_username = "root";

const db_password = "";

const db_database = "";


/**
 * 以太坊网络
 * @type {string}
 */
const network = "https://mainnet.infura.io";

const chainId = 1;

/**
 * websocket监听网络
 * @type {string}
 */
const wsnetwork = "wss://mainnet.infura.io/ws";

/**
 * 助记词（重要，不可公开）
 * @type {string}
 */
const mainMne = "";

/**
 * 加密的key和iv
 * @type {string}
 */
const rechargeKey = "";
const rechargeIv = "";
const withdrawKey = "";
const withdrawIv = "";
const sendTransactionKey = "";
const sendTransactionIv = "";
const privateKey = "";
const privateIv = "";


/**
 * gasPrice设置，2代表默认gasPrice的两倍
 * @type {number}
 */
const gasPriceFactor = 1;


/**
 * redis存储key
 * @type {string}
 */
const redisEthTransactionCountKey = "";
const redisBlockCountKey = "";

/**
 * redis password
 * @type {string}
 */
const redisPassword = "";

/**
 * omni rpc配置
 * @type {string}
 */
const rpcUser = "";

const rpcPassword = "";

const rpcPort = 8332;

const rpcHost = "";

/**
 * btc wallet配置
 * @type {string}
 */
const btcMasterAddress = "";
const walletPassphrase = "";

const btcTransferFee = 0.00000001;


module.exports = {
    network,

    allowIp,

    logLevel,

    chainId,

    mainMne,

    rechargeKey,

    rechargeIv,

    withdrawKey,

    withdrawIv,

    wsnetwork,

    sendTransactionKey,

    sendTransactionIv,

    privateKey,

    privateIv,

    port,

    db_post,

    db_database,

    db_username,

    db_password,

    gasPriceFactor,

    rpcUser,

    rpcPassword,

    rpcPort,

    rpcHost,

    redisEthTransactionCountKey,

    redisBlockCountKey,

    redisPassword,

    walletPassphrase,

    btcMasterAddress,

    btcTransferFee,

};