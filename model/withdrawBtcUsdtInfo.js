const Sequelize = require('sequelize');
const sequelize = require('../mysql/sequelize');
const moment = require('moment-timezone');

const WithdrawBtcUsdtInfo = sequelize.define("withdraw_btc_usdt_info", {

    wid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        default: 0
    },

    uid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    value: {
        type: Sequelize.STRING,
        default: "0"
    },

    desAddress: {
        type: Sequelize.STRING,
        allowNull: false
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

module.exports = WithdrawBtcUsdtInfo;