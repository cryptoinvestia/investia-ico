require('babel-register');
require('babel-polyfill');
require('babel-node-modules')([
  'zeppelin-solidity'
])

module.exports = {
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
    }
  }
};
