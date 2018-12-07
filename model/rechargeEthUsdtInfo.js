const sequelize = require('../mysql/sequelize');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

const RechargeEthUsdtInfo = sequelize.define('recharge_eth_usdt_info', {
    transactionHash: {
        type: Sequelize.STRING,
        primaryKey: true
    },

    uid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    value: {
        type: Sequelize.STRING
    },

    status: {
        type: Sequelize.INTEGER
    },

    tid: {
        type: Sequelize.INTEGER,
        default: 0
    },

    fromAddress: {
        type: Sequelize.STRING,
    },

    createdAt: {
        type: Sequelize.DATE,
        get() {
            return moment.tz(this.getDataValue('createdAt'), 'Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
        }
    },
    updatedAt: {
        type: Sequelize.DATE,
        get() {
            return moment.tz(this.getDataValue('updatedAt'), 'Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
        }
    }

});

sequelize.sync();

module.exports = RechargeEthUsdtInfo;