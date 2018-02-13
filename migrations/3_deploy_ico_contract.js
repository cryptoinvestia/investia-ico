var InvestiaICO = artifacts.require("InvestiaICO");
var InvestiaToken = artifacts.require("InvestiaToken");

module.exports = async function(deployer, network) {
  if (network === 'ropsten') {
    const rate = 1000;
    const wallet = '0xF416c25f992d14B4DD070cEC0e8941ea5331CCBe';
    const payingToken = '0x0d3ff957c60981eaedb2a6e9926f8829945ae53d';
    const block = await new Promise((resolve, reject) => {
      web3.eth.getBlock('latest', function (error, result) { error ? reject(error) : resolve(result) });
    });

    const startTime = block.timestamp + 120;
    const endTime = startTime + (86400 * 180); // 30 days

    await deployer.deploy(InvestiaICO, startTime, endTime, rate, payingToken, wallet, InvestiaToken.address);

    InvestiaToken.at(InvestiaToken.address).transferOwnership(InvestiaICO.address);
  }
};
