pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./InvestiaToken.sol";


contract InvestiaICO is Crowdsale, Ownable {
  function InvestiaICO(uint256 _rate, address _wallet)
    Crowdsale(now, (now + 90 days), _rate, _wallet) public
  {

  }

  function buyTokens(address beneficiary) public payable {
    require(msg.value > 0.25 ether);
    super.buyTokens(beneficiary);
  }

  function setRate(uint256 _newRate) onlyOwner external {
    rate = _newRate;
  }

  function forwardFunds() internal {
    uint256 weiAmount = msg.value;
    uint256 walletTokens = weiAmount.mul(rate).div(5);
    token.mint(wallet, walletTokens);
    super.forwardFunds();
  }

  function createTokenContract() internal returns (MintableToken) {
    return new InvestiaToken();
  }

  // TODO:
  // * add an onlyOwner function to transfer token ownership
}
