var InvestiaToken = artifacts.require("InvestiaToken");

module.exports = async function(deployer, network) {
  if (network === 'ropsten') {
    deployer.deploy(InvestiaToken);
  }
};
