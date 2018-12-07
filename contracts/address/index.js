let address;
if(process.env.NODE_ENV === 'production') {
    address = require('./prod');
} else {
    address = require('./dev');
}

module.exports = address;