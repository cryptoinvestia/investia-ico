pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./InvestiaToken.sol";


contract InvestiaICO is Ownable {
  using SafeMath for uint256;

  // The token to be used for payments
  ERC20 public payingToken;

  // The token being sold
  MintableToken public token;

  // Start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  // Address where funds are collected
  address public wallet;

  // How many token units a buyer gets per payingToken wei
  uint256 public rate;

  // Amount of raised money in payintgToken's wei
  uint256 public weiRaised;

  /* Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param value payingToken weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, uint256 value, uint256 amount);

  function InvestiaICO(uint256 _startTime, uint256 _endTime, uint256 _rate, ERC20 _payingToken, address _wallet, InvestiaToken _token) public {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_rate > 0);
    require(_wallet != address(0));
    require(_payingToken != address(0));
    require(_token != address(0));

    startTime = _startTime;
    endTime = _endTime;
    rate = _rate;
    payingToken = _payingToken;
    wallet = _wallet;
    token = _token;
  }

  // Reject any ETH payments, this ICO can only be participated in using payingToken
  function () external payable {
    revert();
  }

  // Purchase tokens. Requires the buyer to approve the ICO contract to withdraw the required
  // amount of payingTokens before.
  function buyWithTokens(uint256 _value) external {
    require(validPurchase(_value));

    uint256 tokens = _value * rate;

    // Transfer payingTokens from buyer to wallet
    payingToken.transferFrom(msg.sender, wallet, _value);
    weiRaised = weiRaised.add(_value);

    // Mint InvestiaTokens for buyer
    token.mint(msg.sender, tokens);
    TokenPurchase(msg.sender, _value, tokens);

    // Mint a bonus commision for ICO
    token.mint(wallet, tokens.div(5));
  }

  function setRate(uint256 _newRate) onlyOwner external {
    rate = _newRate;
  }

  function transferTokenOwnership(address newOwner) public onlyOwner {
    require (now > endTime);
    token.transferOwnership(newOwner);
  }

  function hasEnded() public view returns (bool) {
    return now > endTime;
  }

  function validPurchase(uint256 _value) internal view returns (bool) {
    return now >= startTime && now <= endTime && _value >= 1000 ether;
  }
}
