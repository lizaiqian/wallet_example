const RechargeEthUsdtInfo = require('../model/rechargeEthUsdtInfo');
const sequelize = require('sequelize');

const createTransaction = async (uid, hash, value, fromAddress, tid) => {
    let tokenId;

    if (tid === null || undefined) {
        tokenId = 0;
    } else {
        tokenId = tid;
    }

    await RechargeEthUsdtInfo.create({
        transactionHash: hash,
        uid,
        value,
        status: 0,
        tid: tokenId,
        fromAddress,
    });

};

const commitTransaction = async (hash) => {
    const info = await RechargeEthUsdtInfo.findOne({
        where: {
            transactionHash: hash
        }
    });

    if (info !== null) {
        return await info.update({
            status: 1
        });
    } else {
        return null;
    }
};

const invalidTransaction = async (hash) => {
    const info = await RechargeEthUsdtInfo.findOne({
        where: {
            transactionHash: hash
        }
    });
    if (info !== null) {
        return await info.update({status: 2});
    } else {
        return false;
    }
};

const deleteInvalidTransaction = async () => {
    return await RechargeEthUsdtInfo.destroy({
        where: {
            status: 2
        }
    });
};

const findByHash = async (hash) => {
    const info = await RechargeEthUsdtInfo.findOne({
        attributes: ["transactionHash"],
        where: {
            transactionHash: hash
        }
    });
    return info !== null ? info.get() : null;
};

const findByStatus = async (status) => {
    const infos = await RechargeEthUsdtInfo.findAll({
        where: {
            status: status
        }
    });

    return infos.map((tx) => {
        return tx.get();
    });

};

const findInfosByPage = async (limit, offset) => {
    return await RechargeEthUsdtInfo.findAll({
        attributes: {
            exclude: ['updatedAt', 'tid'],
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: offset,
    });
};

const getInfoCount = async () => {

    const result = await RechargeEthUsdtInfo.findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('uid')), "count"]]
    });

    return result[0];
};

module.exports = {
    createTransaction,
    commitTransaction,
    findByHash,
    invalidTransaction,
    deleteInvalidTransaction,
    findByStatus,
    findInfosByPage,
    getInfoCount
};