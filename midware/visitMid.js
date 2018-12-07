/**
 * ip访问控制
 */

const {allowIp} = require('../config');

const visitMid = (req, res, next) => {

    if(allowIp === "0.0.0.0") {
        next();
        return;
    }

    let ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }

    const strings = ip.split(':');
    let shortIp = strings[strings.length - 1];

    //本机和局域网ip规则
    if(allowIp === "127.0.0.1") {
        if(shortIp === "1" || shortIp.startsWith('192.168')) {
            next();
            return;
        } else {
            res.fail("code:500, not allowed");
            return;
        }
    }

    //外网ip规则
    if(shortIp !== allowIp) {
        res.fail("code:500, not allowed");
        return;
    }

    next();

};

module.exports = visitMid;