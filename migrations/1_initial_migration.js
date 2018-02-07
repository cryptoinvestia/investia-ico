var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network) {
  if (network !== 'testrpc') {
    deployer.deploy(Migrations);
  }
};
