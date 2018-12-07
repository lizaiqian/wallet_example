const RechargeBtcInfo = require('../model/rechargeBtcInfo');
const sequelize = require('sequelize');

const createRechargeInfo = async (hash, uid, value) => {

    await RechargeBtcInfo.create({
        transactionHash: hash,
        uid: uid,
        value: value,
        status: 0,
    });

};

const commitRechargeInfo = async (hash) => {

    const info = await RechargeBtcInfo.findOne({
        where: {
            transactionHash: hash
        }
    });

    await info.update({
        status: 1
    })
};

const invalidRechargeInfo = async (hash) => {

    const info = await RechargeBtcInfo.findOne({
        where: {
            transactionHash: hash
        }
    });

    await info.update({
        status: 2
    })

};


const setRetrieveHash = async (uid, retrieveHash) => {

    const infos = await RechargeBtcInfo.findAll({
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
    return await RechargeBtcInfo.findOne({
        where: {
            transactionHash: hash
        }
    });
};

const findInfosByPage = async (limit, offset) => {
    return await RechargeBtcInfo.findAll({
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
    const result = await RechargeBtcInfo.findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('uid')), "count"]]
    });

    return result[0];
};


module.exports = {
    createRechargeInfo,
    findInfoByHash,
    setRetrieveHash,
    commitRechargeInfo,
    invalidRechargeInfo,
    findInfosByPage,
    getInfoCount
};