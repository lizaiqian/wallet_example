const RechargeBtcUsdtInfo = require('../model/rechargeBtcUsdtInfo');
const sequelize = require('sequelize');

const createRechargeInfo = async (hash, uid, value, retrieveHash, fromAddress) => {

    await RechargeBtcUsdtInfo.create({
        transactionHash: hash,
        uid: uid,
        value: value,
        retrieveHash: retrieveHash,
        fromAddress: fromAddress,
    });

};

const setRetrieveHash = async (uid, retrieveHash) => {

    const infos = await RechargeBtcUsdtInfo.findAll({
        where: {
            uid: uid
        }
    });

    infos.forEach(async info => {
        if(info.retrieveHash === null) {
            await info.update({retrieveHash: retrieveHash});
        }
    });

};

const findInfoByHash = async (hash) => {
    return await RechargeBtcUsdtInfo.findOne({
        where: {
            transactionHash: hash
        }
    });
};

const findInfosByPage = async (limit, offset) => {
    return await RechargeBtcUsdtInfo.findAll({
        attributes:{
            exclude: ['updatedAt', 'retrieveHash']
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: offset
    })
};

const getInfoCount = async () => {
    const result = await RechargeBtcUsdtInfo.findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('uid')), "count"]]
    });

    return result[0];
};


module.exports = {
    createRechargeInfo,
    findInfoByHash,
    setRetrieveHash,
    findInfosByPage,
    getInfoCount
};