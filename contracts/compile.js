const path = require('path');
const fs = require('fs');
const solc = require('solc');

const solpath = path.resolve(__dirname, 'erc20-example-contracts.sol');
const contract = fs.readFileSync(solpath, 'utf-8');
const data = solc.compile(contract, 1);

console.log(data);

// console.log(data.contracts);
// fs.writeFileSync('./abi/index.js', JSON.stringify(data.contracts[':TetherToken']));
//
// module.exports = data.contracts[':TetherToken'];
