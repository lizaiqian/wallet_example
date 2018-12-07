const Sequelize = require('sequelize');
const {db_post, db_database, db_password, db_username} = require('../config');
const logger = require('../utils/logUtil');

const sequelize = new Sequelize(db_database, db_username, db_password, {
    host: db_post,
    dialect: 'mysql',
    operatorsAliases: false,
    logging: false,
    timezone: '+08:00',

    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});

sequelize
    .authenticate()
    .then(() => {
        logger.info('Connection has been established successfully.');
    })
    .catch(err => {
        logger.info('Unable to connect to the database:', err);
    });

module.exports = sequelize;
