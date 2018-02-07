pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/mocks/BasicTokenMock.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract PayingTokenMock is BasicTokenMock, StandardToken {
  function PayingTokenMock(address initialAccount, uint256 initialBalance)
    BasicTokenMock(initialAccount, initialBalance) public {
  }
}
