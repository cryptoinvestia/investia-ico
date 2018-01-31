pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./InvestiaToken.sol";


contract InvestiaICO is Crowdsale, Ownable {
  ERC20 payingToken;

  function InvestiaICO(uint256 _startTime, uint256 _endTime, uint256 _rate, address _payingToken, address _wallet)
    Crowdsale(_startTime, _endTime, _rate, _wallet) public
  {
    payingToken = ERC20(_payingToken);
  }

  function () external payable {
    revert();
  }

  function buyTokens() public payable {
    revert();
  }

  function buyWithTokens(uint256 _value) external {
    require(validPurchase(_value));
    payingToken.transferFrom(msg.sender, wallet, _value);
    uint256 weiAmount = _value * rate;
    uint256 walletTokens = weiAmount.div(5);
    token.mint(msg.sender, weiAmount);
    token.mint(wallet, walletTokens);
  }

  function setRate(uint256 _newRate) onlyOwner external {
    rate = _newRate;
  }

  function createTokenContract() internal returns (MintableToken) {
    return new InvestiaToken();
  }

  function transferTokenOwnership(address newOwner) public onlyOwner {
    require (now > endTime);
    token.transferOwnership(newOwner);
  }

  function validPurchase(uint256 _value) internal view returns (bool) {
    bool withinPeriod = now >= startTime && now <= endTime;
    bool minimumPurchaseValue = _value >= 0.25 ether;
    return withinPeriod && minimumPurchaseValue;
  }
}
