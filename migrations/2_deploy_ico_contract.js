var InvestiaICO = artifacts.require("InvestiaICO");

module.exports = function(deployer) {
  const rate = 1000;
  const wallet = "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2";
  deployer.deploy(InvestiaICO, rate, wallet);
};
