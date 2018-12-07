const WithdrawEthUsdtInfo = require('../model/withdrawEthUsdtInfo');

const createWithdrawInfo = async (uid, value, address) => {
    await WithdrawEthUsdtInfo.create({uid, value: value.toString(), desAddress: address});
};

const findByWid = async (id) => {
    return await WithdrawEthUsdtInfo.findOne({
        where: {
            wid: id
        }
    });
};

const findByUid = async (uid) =>{
    return await WithdrawEthUsdtInfo.findAll({
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