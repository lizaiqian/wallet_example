let abi;
if(process.env.NODE_ENV === 'production') {
    abi = require('./prod');
} else {
    abi = require('./dev');
}

module.exports = abi;