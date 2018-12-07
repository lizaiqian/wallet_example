const sequelize = require('../mysql/sequelize');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

const User = sequelize.define("user", {
    uid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },

    ethAddress: {
        type: Sequelize.STRING,
        unique: true
    },

    ethPrivateKey: {
        type: Sequelize.STRING
    },

    btcAddress: {
        type: Sequelize.STRING,
        unique: true
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

module.exports = User;