pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./InvestiaToken.sol";


contract InvestiaICO is Crowdsale, Ownable {
  function InvestiaICO(uint256 _rate, address _wallet)
    Crowdsale(now, (now + 90 days), _rate, _wallet) public
  {

  }

  function setRate(uint256 _newRate) onlyOwner external {
    rate = _newRate;
  }

  function createTokenContract() internal returns (MintableToken) {
    return new InvestiaToken();
  }


  // TODO:
  // * require minimum transaction of 0.25ETH
  // * override the buyTokens function to issue bonus tokens to wallet address
  // * add an onlyOwner function to transfer token ownership
}
