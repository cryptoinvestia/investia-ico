require('babel-register');
require('babel-polyfill');
require('babel-node-modules')([
  'zeppelin-solidity'
])

var HDWalletProvider = require("truffle-hdwallet-provider");
const infuraToken = process.env.INFURA_TOKEN;
const mnemonic = process.env.WALLET_MNEMONIC;

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*"
    },
    testrpc: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/' + infuraToken)
      },
      network_id: 3,
      gas: 4000000
    }
  }
};
