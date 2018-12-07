const User = require("../model/users");
const sequelize = require('sequelize');
const Op = sequelize.Op;


const createUser = async (id, ethAddress, ethPrivateKey, btcAddress) => {
    await User.create({uid: id, ethAddress: ethAddress, ethPrivateKey: ethPrivateKey, btcAddress: btcAddress});
};

const listAllBtcAddress = async () => {
    const addresses = await User.findAll({
        attributes: ['btcAddress']
    });

    return addresses.map(addr => {
        return addr.btcAddress;
    })
};

const mainAccount = async () => {
    const user = await User.findOne({
        attributes:['ethAddress'],
        where: {
            uid: 0
        }
    });
    return user.ethAddress;
};

const findById = async (id) => {
    const user = await User.findOne({
        where: {
            uid: id
        }
    });
    return user === null ? null : user.get();
};

const findUidByEthAddress = async (ethAddress) => {
    const user = await User.findOne({
        attributes: ['uid'],
        where: {
            ethAddress
        }
    });

    return user === null ? null : user.get();
};

const findByBtcAddress = async (btcAddress) => {
    const user = await User.findOne({
        where: {
            btcAddress
        }
    });

    return user === null ? null : user.get();
};

const findUsersByPage = async (limit, offset) => {
    return await User.findAll({
        attributes: {
            exclude: ['ethPrivateKey', 'updatedAt']
        },
        limit: limit,
        offset: offset,
        order: [
            ['createdAt', 'DESC']
        ],

        where: {
            uid: {
                [Op.ne]: 0
            }
        },
    });
};

const getUserCount = async () => {

    const result = await User.findAll({
        attributes: [[sequelize.fn('COUNT', sequelize.col('uid')), "count"]]
    });

    return result[0];
};

// const crypto = require('../utils/cryptoUtil');
// const {privateKey, privateIv} = require('../config');
//
// (async function f() {
//     const users = await User.findAll();
//
//     users.forEach(async user => {
//         const ethPrivateKeyCrypto = crypto.encrypt(user.ethPrivateKey, privateKey, privateIv);
//         await user.update({
//             ethPrivateKey: ethPrivateKeyCrypto
//         })
//     })
//
// })()

module.exports = {
    createUser,
    findById,
    findUidByEthAddress,
    mainAccount,
    findByBtcAddress,
    listAllBtcAddress,
    findUsersByPage,
    getUserCount
};

