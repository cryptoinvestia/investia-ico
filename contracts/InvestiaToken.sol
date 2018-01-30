pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


contract InvestiaToken is MintableToken {
  string public constant name = "Investia";
  string public constant symbol = "INV";
  uint8 public constant decimals = 18;
}
