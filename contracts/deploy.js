const fs = require('fs');

const {interface, bytecode} = require('./compile');
const {network, mainMne} = require('../config');
const HDWalletProvider = require("truffle-hdwallet-provider");
// const mnemonic = fs.readFileSync('', 'utf-8'); // 12 word mnemonic

const provider = new HDWalletProvider(mainMne, network);
const Web3 = require('web3');

const web3 = new Web3(provider);

deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    // const a = await web3.eth.estimateGas({data: "0x" + bytecode})

    const contract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode,
            arguments: ["MateCoin", "MC"]
        }).send({
            from: accounts[0],
            gas: '4000000'
        });

    fs.writeFileSync('./abi/index.js', `const abi = ${interface};
module.exports = abi;`);

    fs.writeFileSync('./ethAddress/ethAddress.js', `const address = '${contract.options.ethAddress}';
module.exports = address;`);

};

deploy();