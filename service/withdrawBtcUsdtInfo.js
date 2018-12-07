const WithdrawBtcUsdtInfo = require('../model/withdrawBtcUsdtInfo');

const createWithdrawInfo = async (uid, value, address) => {
    await WithdrawBtcUsdtInfo.create({uid, value: value.toString(), desAddress: address});
};

const findByWid = async (id) => {
    return await WithdrawBtcUsdtInfo.findOne({
        where: {
            wid: id
        }
    });
};

const findByUid = async (uid) =>{
    return await WithdrawBtcUsdtInfo.findAll({
        where: {
            uid: uid
        }
    })
};

module.exports = {
    createWithdrawInfo,
    findByUid,
    findByWid
};