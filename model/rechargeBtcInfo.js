const sequelize = require('../mysql/sequelize');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

const RechargeBtcUsdtInfo = sequelize.define('recharge_btc_info', {

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
        type: Sequelize.INTEGER,
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

module.exports = RechargeBtcUsdtInfo;